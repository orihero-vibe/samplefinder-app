import { type RefObject } from 'react';
import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

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

    if (Platform.OS === 'android') {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        await Share.share({ message, title: 'SampleFinder' });
        return;
      }
      if (message) {
        await Clipboard.setStringAsync(message);
      }
      await Sharing.shareAsync(shareUri, {
        mimeType: 'image/png',
        dialogTitle: message ? 'Share screenshot (caption copied – paste in app)' : 'Share screenshot',
      });
    } else {
      const shareOptions: { message: string; url?: string; title?: string } = {
        message,
        title: 'SampleFinder',
        url: shareUri,
      };
      await Share.share(shareOptions);
    }
  } catch (error) {
    if (isShareCompletionError(error)) {
      return;
    }
    console.error('[captureAndShare] Error:', error);
    throw error;
  }
}
