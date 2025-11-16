import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
            contentContainerStyle={styles.scrollContent}
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
          contentContainerStyle={styles.scrollContent}
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 30,
  },
});

export default ScreenWrapper;

