import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';

type TabType = 'inProgress' | 'earned';

interface PromotionsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const PromotionsTabs: React.FC<PromotionsTabsProps> = ({ activeTab, onTabChange }) => {
  const handleInProgressPress = useCallback(() => {
    onTabChange('inProgress');
  }, [onTabChange]);

  const handleEarnedPress = useCallback(() => {
    onTabChange('earned');
  }, [onTabChange]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={[styles.tab, activeTab === 'inProgress' && styles.activeTab]}
          onPress={handleInProgressPress}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'inProgress' ? styles.activeTabText : styles.inactiveTabText,
            ]}
            numberOfLines={1}
          >
            In Progress
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'earned' && styles.activeTab]}
          onPress={handleEarnedPress}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'earned' ? styles.activeTabText : styles.inactiveTabText,
            ]}
            numberOfLines={1}
          >
            Earned
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginHorizontal: 35,
  },
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.brandBlueBright,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  activeTab: {
    backgroundColor: Colors.brandBlueBright,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  activeTabText: {
    color: Colors.white,
  },
  inactiveTabText: {
    color: Colors.blueColorMode,
  },
});

export default memo(PromotionsTabs);

