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
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inProgress' && styles.activeTab]}
          onPress={() => onTabChange('inProgress')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'inProgress' ? styles.activeTabText : styles.inactiveTabText,
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
              activeTab === 'earned' ? styles.activeTabText : styles.inactiveTabText,
            ]}
          >
            Earned
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.pinDarkBlue,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  activeTab: {
    backgroundColor: Colors.pinDarkBlue,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  activeTabText: {
    color: Colors.white,
  },
  inactiveTabText: {
    color: Colors.pinDarkBlue,
  },
});

export default PromotionsTabs;

