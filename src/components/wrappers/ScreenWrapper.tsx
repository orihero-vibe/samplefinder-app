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
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = true,
  keyboardAvoiding = true,
  contentContainerStyle,
  contentBackgroundColor,
}) => {
  const { bottom } = useSafeAreaInsets();
  const footerHeight = isSmallDevice ? 60 : isMediumDevice ? 70 : 80;
  const totalFooterHeight = footerHeight + bottom;
  
  const contentStyle = [
    styles.content,
    contentBackgroundColor && { backgroundColor: contentBackgroundColor },
    contentContainerStyle,
  ];


  const content = (
    <>
      <AuthHeader />
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
            contentContainerStyle={[styles.scrollContent, { paddingBottom: totalFooterHeight + 16 }]}
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
          contentContainerStyle={[styles.scrollContent, { paddingBottom: totalFooterHeight + 16 }]}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 20 : 30,
    paddingVertical: isSmallDevice ? 12 : isMediumDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 16 : 30,
  },
});

export default ScreenWrapper;

