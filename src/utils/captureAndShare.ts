import { type RefObject } from 'react';
import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import Share from 'react-native-share';

const DEFAULT_MESSAGE = 'Check this out on SampleFinder!';

/** Errors from the share sheet completion (e.g. Save to Photos fails on simulator) - not our failure. */
function isShareCompletionError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'domain' in error) {
    const d = (error as { domain?: string; code?: string }).domain;
    const code = (error as { domain?: string; code?: string }).code;
    if (d === 'ALAssetsLibraryErrorDomain' || d === 'PHPhotosErrorDomain' || code === 'EALASSETSLIBRARYERRORDOMAIN-1') {
      return true;
    }
  }
  return false;
}

/** Wait for the view to be laid out and painted before capturing. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 150);
      });
    });
  });
}

/** Ensure URI has file:// prefix for sharing. */
function toFileUri(uri: string): string {
  return uri.startsWith('file://') ? uri : `file://${uri}`;
}

async function getAndroidShareUri(uri: string): Promise<string> {
  if (Platform.OS !== 'android') {
    return uri;
  }

  try {
    const path = uri.replace(/^file:\/\//, '');
    const contentUri = await FileSystem.getContentUriAsync(path);
    return contentUri || uri;
  } catch {
    return uri;
  }
}

/**
 * Share screenshot + caption using react-native-share (not RN Share):
 * Android's built-in Share module only sends text/plain and ignores `url`, so images never reached chat apps.
 * iOS uses LinkPresentation metadata so caption-like text is associated with the image for apps that support it,
 * with a standard message+file fallback.
 */
async function shareImageWithMessage(fileUri: string, message: string): Promise<void> {
  const baseOptions = {
    title: 'SampleFinder',
    failOnCancel: false as const,
  };

  if (Platform.OS === 'android') {
    const contentUri = await getAndroidShareUri(fileUri);
    await Share.open({
      ...baseOptions,
      message,
      url: contentUri,
      type: 'image/png',
    });
    return;
  }

  // iOS: Prefer one activity item with LPLinkMetadata.title — some messengers use it as caption when plain
  // string + file loses the text (e.g. WhatsApp / Telegram).
  try {
    await Share.open({
      ...baseOptions,
      activityItemSources: [
        {
          placeholderItem: { type: 'url', content: fileUri },
          item: {
            default: { type: 'url', content: fileUri },
          },
          linkMetadata: {
            title: message,
          },
        },
      ],
    });
  } catch {
    await Share.open({
      ...baseOptions,
      message,
      url: fileUri,
      type: 'image/png',
    });
  }
}

/**
 * Captures the given view as an image and opens the native share sheet
 * with the image and optional message.
 */
export async function captureAndShareView(
  viewRef: RefObject<any>,
  message: string = DEFAULT_MESSAGE,
  captureOptions?: Omit<Parameters<typeof captureRef>[1], 'format' | 'quality' | 'result'>
): Promise<void> {
  const node = viewRef?.current;
  if (!node) {
    console.warn('[captureAndShare] No view ref to capture');
    return;
  }

  try {
    await waitForPaint();

    const tmpUri = await captureRef(node, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
      ...(captureOptions ?? {}),
    });

    let shareUri = tmpUri;
    if (tmpUri && FileSystem.cacheDirectory) {
      const fileName = `SampleFinder-share-${Date.now()}.png`;
      const cachePath = `${FileSystem.cacheDirectory.replace(/\/$/, '')}/${fileName}`;
      const fromUri = toFileUri(tmpUri);
      try {
        await FileSystem.copyAsync({ from: fromUri, to: cachePath });
        shareUri = toFileUri(cachePath);
      } catch (_) {
        shareUri = toFileUri(tmpUri);
      }
    } else if (tmpUri) {
      shareUri = toFileUri(tmpUri);
    }

    if (!shareUri) {
      throw new Error('Failed to capture or resolve image URI');
    }

    const fileUri = toFileUri(shareUri);
    await shareImageWithMessage(fileUri, message);
  } catch (error) {
    if (isShareCompletionError(error)) {
      return;
    }
    console.error('[captureAndShare] Error:', error);
    throw error;
  }
}
