import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MainHeader from '@/components/wrappers/MainHeader';

const PromotionsScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MainHeader
        onMapPress={() => {}}
        onListPress={() => {}}
      />
      <View style={styles.content}>
        <Text style={styles.title}>PROMOTIONS</Text>
        <Text style={styles.subtitle}>Promotions screen coming soon</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    color: '#2D1B69',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#666',
    textAlign: 'center',
  },
});

export default PromotionsScreen;

