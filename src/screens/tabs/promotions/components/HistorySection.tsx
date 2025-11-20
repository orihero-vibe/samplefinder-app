import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Monicon } from '@monicon/native';
import { Colors } from '@/constants/Colors';
import { SparkleIcon } from '@/icons';
import HistoryItem, { HistoryItemData } from './HistoryItem';

interface HistorySectionProps {
  historyItems: HistoryItemData[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ historyItems }) => {
  if (historyItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <View style={styles.headerIcon}>
            <Monicon name="streamline:star-2-remix" size={24} color={Colors.pinDarkBlue} />
          </View>
        </View>
        <Text style={styles.headerTitle}>YOUR HISTORY</Text>
      </View>

      {/* History Items */}
      <View style={styles.itemsContainer}>
        {historyItems.map((item, index) => (
          <HistoryItem key={item.id} item={item} defaultExpanded={index === 0 && !!item.review} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
  },
  itemsContainer: {
  },
});

export default HistorySection;

