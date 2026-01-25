import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '@/constants/Colors';
import { Monicon } from '@monicon/native';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  pinNumber?: number;
  icon?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  events: string[]; // Event IDs for this location
}

interface MapMarkerProps {
  marker: MapMarkerData;
  onPress?: (marker: MapMarkerData) => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({ marker, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(marker);
    }
  };

  if (marker.pinNumber) {
    // Large pin with number
    return (
      <Marker
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        onPress={handlePress}
      >
        <View style={styles.pinContainer}>
          <View style={styles.largePin}>
            <Text style={styles.pinNumber}>{marker.pinNumber}</Text>
          </View>
        </View>
      </Marker>
    );
  } else if (marker.icon) {
    // Icon marker with transparent background and dark blue icon
    return (
      <Marker
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        onPress={handlePress}
      >
        <View style={styles.iconMarkerContainer}>
          <View style={styles.iconMarker}>
            <Monicon name={marker.icon} size={20} color={Colors.pinDarkBlue} />
          </View>
        </View>
      </Marker>
    );
  } else {
    // Default large pin
    return (
      <Marker
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        onPress={handlePress}
      >
        <View style={styles.pinContainer}>
          <View style={styles.largePin}>
            <View style={styles.pinDot} />
          </View>
        </View>
      </Marker>
    );
  }
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  largePin: {
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
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  pinNumber: {
    fontSize: 16,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
  iconMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default MapMarker;

