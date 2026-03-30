import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export interface ActivityMetricsData {
  eventCheckIns: number;
  samplingReviews: number;
  badgeAchievements: number;
}

interface ActivityMetricsProps {
  data?: ActivityMetricsData;
}

const ActivityMetrics: React.FC<ActivityMetricsProps> = ({
  data = {
    eventCheckIns: 150,
    samplingReviews: 15,
    badgeAchievements: 3,
  },
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.metricColumn}>
        <Text style={styles.metricValue}>{data.eventCheckIns}</Text>
        <Text style={styles.metricLabel}>Event{'\n'}Check Ins</Text>
      </View>
      <View style={styles.metricColumn}>
        <Text style={styles.metricValue}>{data.samplingReviews}</Text>
        <Text style={styles.metricLabel}>Sampling{'\n'}Reviews</Text>
      </View>
      <View style={styles.metricColumn}>
        <Text style={styles.metricValue}>{data.badgeAchievements}</Text>
        <Text style={styles.metricLabel}>Badge{'\n'}Achievements</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  metricColumn: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: Colors.brandPurpleBright,
  },
  metricLabel: {
    fontSize: 17,
    fontFamily: 'Quicksand_500Medium',
    color: Colors.pinBlueBlack,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default ActivityMetrics;

