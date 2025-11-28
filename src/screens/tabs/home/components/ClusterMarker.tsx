import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '@/constants/Colors';

interface ClusterMarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  pointCount: number;
  onPress?: () => void;
}

const ClusterMarker: React.FC<ClusterMarkerProps> = ({ coordinate, pointCount, onPress }) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress}>
      <View style={styles.clusterContainer}>
        <View style={styles.clusterMarker}>
          <View style={styles.clusterInnerCircle}>
            <Text style={styles.clusterText}>{pointCount}</Text>
          </View>
        </View>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterInnerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.brandPurpleDeep,
  },
});

export default ClusterMarker;

