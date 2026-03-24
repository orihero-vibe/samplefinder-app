import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuthHeader from '@/components/wrappers/AuthHeader';
import Footer from '@/components/wrappers/Footer';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: object;
  contentBackgroundColor?: string;
  headerLeft?: React.ReactNode;
  /**
   * Optional override for bottom padding applied to the scroll content
   * to keep the main content clear of the footer.
   * When undefined, a default value based on footer height is used.
   */
  footerPaddingBottom?: number;
  /** Extra pixels added to default footer clearance (default 8). Use 0 to sit closer to the footer. */
  footerPaddingExtra?: number;
  /** When false, scroll content only wraps its children (no min-height stretch gap below short content). */
  scrollContentFlexGrow?: boolean;
  /** When true, the main content area grows to fill space below the header (for column layouts). */
  expandMainContent?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  contentContainerStyle,
  contentBackgroundColor,
  footerPaddingBottom,
  footerPaddingExtra = 8,
  scrollContentFlexGrow = true,
  expandMainContent = false,
  headerLeft,
}) => {
  const { bottom } = useSafeAreaInsets();
  const footerHeight = isSmallDevice ? 60 : isMediumDevice ? 70 : 80;
  const totalFooterHeight = footerHeight + bottom;

  const scrollContentStyle = [
    scrollContentFlexGrow ? styles.scrollContentFlex : null,
    styles.scrollContentColumn,
    {
      paddingBottom:
        typeof footerPaddingBottom === 'number'
          ? footerPaddingBottom
          : totalFooterHeight + footerPaddingExtra,
    },
    contentBackgroundColor && { backgroundColor: contentBackgroundColor },
  ];

  const contentStyle = [
    styles.content,
    expandMainContent && styles.contentExpand,
    contentBackgroundColor && { backgroundColor: contentBackgroundColor },
    contentContainerStyle,
  ];

  const content = (
    <>
      <AuthHeader leftElement={headerLeft} />
      <View style={contentStyle}>{children}</View>
    </>
  );

  if (scrollable && keyboardAvoiding) {
    return (
      <LinearGradient
      colors={[
        '#6C0331',
        '#4B0350',
        '#2A0458',
        '#0F0556',
        '#000047',
        '#080860',
      ]}
      locations={[0, 0.2, 0.45, 0.65, 0.85, 1]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={{ flex: 1 }}
    >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={scrollContentStyle}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
        <Footer />
      </LinearGradient>
    );
  }

  if (scrollable) {
    return (
      <LinearGradient
  colors={[
    '#6C0331',
    '#4B0350',
    '#2A0458',
    '#0F0556',
    '#000047',
    '#080860',
  ]}
  locations={[0, 0.2, 0.45, 0.65, 0.85, 1]}
  start={{ x: 0, y: 1 }}
  end={{ x: 1, y: 0 }}
  style={{ flex: 1 }}
>
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
        <Footer />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
  colors={[
    '#6C0331',
    '#4B0350',
    '#2A0458',
    '#0F0556',
    '#000047',
    '#080860',
  ]}
  locations={[0, 0.2, 0.45, 0.65, 0.85, 1]}
  start={{ x: 0, y: 1 }}
  end={{ x: 1, y: 0 }}
  style={{ flex: 1 }}
>
      {content}
      <Footer />
    </LinearGradient>
  );
};

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContentFlex: {
    flexGrow: 1,
  },
  scrollContentColumn: {
    flexDirection: 'column',
  },
  content: {
    paddingHorizontal: isSmallDevice ? 20 : 30,
    paddingVertical: isSmallDevice ? 12 : isMediumDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 16 : 30,
  },
  contentExpand: {
    flex: 1,
  },
});

export default ScreenWrapper;

