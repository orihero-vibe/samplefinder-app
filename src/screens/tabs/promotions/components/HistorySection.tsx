import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { HistoryIcon } from '@/icons';
import HistoryItem, { HistoryItemData } from './HistoryItem';

interface HistorySectionProps {
  historyItems: HistoryItemData[];
}

const HistorySection: React.FC<HistorySectionProps> = ({ historyItems }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Section Header */}
        <View style={styles.header}>
          <HistoryIcon size={40} />
          <Text style={styles.headerTitle}>YOUR HISTORY</Text>
        </View>

        {/* History Items or Empty State */}
      {historyItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No History Yet</Text>
          <Text style={styles.emptyStateText}>
            Keep sampling and earning badges & points!{'\n'}
            Come back to track your progress.
          </Text>
        </View>
        ) : (
          <View style={styles.itemsContainer}>
            {historyItems.map((item, index) => (
              <HistoryItem key={item.id} item={item} defaultExpanded={index === 0 && !!item.review} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginTop: 8,
  },
  itemsContainer: {
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    opacity: 0.3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.pinDarkBlue,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinDarkBlue,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
});

export default HistorySection;

