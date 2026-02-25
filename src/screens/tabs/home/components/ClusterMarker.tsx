import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
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
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  clusterInnerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.brandPurpleDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: {
    fontSize: 14,
    lineHeight: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
});

export default ClusterMarker;

