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
        <Text style={styles.metricLabel}>Event Check Ins</Text>
      </View>
      <View style={styles.metricColumn}>
        <Text style={styles.metricValue}>{data.samplingReviews}</Text>
        <Text style={styles.metricLabel}>Sampling Reviews</Text>
      </View>
      <View style={styles.metricColumn}>
        <Text style={styles.metricValue}>{data.badgeAchievements}</Text>
        <Text style={styles.metricLabel}>Badge Achievements</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricColumn: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleBright,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: Colors.black,
    textAlign: 'center',
  },
});

export default ActivityMetrics;

