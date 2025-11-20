import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

type TabType = 'inProgress' | 'earned';

interface PromotionsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const PromotionsTabs: React.FC<PromotionsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'inProgress' && styles.activeTab]}
        onPress={() => onTabChange('inProgress')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'inProgress' && styles.activeTabText,
          ]}
        >
          In Progress
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'earned' && styles.activeTab]}
        onPress={() => onTabChange('earned')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'earned' && styles.activeTabText,
          ]}
        >
          Earned
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.pinDarkBlue,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    color: Colors.white,
  },
  activeTabText: {
    color: Colors.white,
  },
});

export default PromotionsTabs;

