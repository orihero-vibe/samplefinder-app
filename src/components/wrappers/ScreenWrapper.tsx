import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
      <View style={styles.container}>
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
      </View>
    );
  }

  if (scrollable) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: totalFooterHeight + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
        <Footer />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {content}
      <Footer />
    </View>
  );
};

const { height: screenHeight } = Dimensions.get('window');
const isSmallDevice = screenHeight < 700;
const isMediumDevice = screenHeight >= 700 && screenHeight < 800;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B69',
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

