import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '@/constants/Colors';
import PinIcon from '@/icons/PinIcon';

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

  // Calculate event count from events array
  const eventCount = marker.events?.length || 0;

  if (marker.pinNumber) {
    // Large teardrop pin with number in small circle at top
    return (
      <Marker
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        onPress={handlePress}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={styles.pinContainer}>
          <PinIcon width={40} height={62} pinColor={Colors.blueColorMode} />
          {/* Small number circle at top */}
          <View style={styles.pinNumberContainer}>
            <View style={styles.pinNumberCircle}>
              <Text style={styles.pinNumber}>{marker.pinNumber}</Text>
            </View>
          </View>
        </View>
      </Marker>
    );
  } else {
    // Default teardrop pin with event count in center circle
    return (
      <Marker
        coordinate={{
          latitude: marker.latitude,
          longitude: marker.longitude,
        }}
        title={marker.title}
        onPress={handlePress}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={styles.pinContainer}>
          <PinIcon width={40} height={62} pinColor={Colors.blueColorMode} />
          {/* Event count in center circle */}
          {eventCount > 0 && (
            <View style={styles.eventCountContainer}>
              <Text style={styles.eventCount}>{eventCount}</Text>
            </View>
          )}
        </View>
      </Marker>
    );
  }
};

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinNumberContainer: {
    position: 'absolute',
    top: 2, // Positioned at the top of the pin
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.blueColorMode,
    borderWidth: 1.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumber: {
    fontSize: 12,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
  },
  eventCountContainer: {
    position: 'absolute',
    // Center circle is at y≈17.67 in viewBox (0-62), same as pin height
    // Position container so text is centered: 17.67 - (container height / 2) = 17.67 - 12 = 5.67
    top: 5.67,
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  eventCount: {
    fontSize: 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
  },
});

export default MapMarker;

