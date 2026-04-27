import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
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
  /**
   * Android needs an initial true pass for custom marker views to draw; leaving it true
   * forces constant re-snapshots and blocks the map (empty/slow tiles while zooming).
   */
  const [tracksViewChanges, setTracksViewChanges] = useState(Platform.OS === 'android');
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const t = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(t);
  }, []);

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
        tracksViewChanges={tracksViewChanges}
      >
        <View style={styles.markerWrapper}>
          <View style={styles.pinContainer}>
            <PinIcon width={PIN_WIDTH} height={PIN_HEIGHT} pinColor={Colors.blueColorMode} />
            {/* Small number circle at top */}
            <View style={styles.pinNumberContainer}>
              <View style={styles.pinNumberCircle}>
                <Text style={styles.pinNumber}>{marker.pinNumber}</Text>
              </View>
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
        tracksViewChanges={tracksViewChanges}
      >
        <View style={styles.markerWrapper}>
          <View style={styles.pinContainer}>
            <PinIcon width={PIN_WIDTH} height={PIN_HEIGHT} pinColor={Colors.blueColorMode} />
            {/* Event count in center circle */}
            {eventCount > 0 && (
              <View style={styles.eventCountContainer}>
                <Text style={styles.eventCount}>{eventCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Marker>
    );
  }
};

const BASE_PIN_HEIGHT = 62;
const BASE_PIN_WIDTH = 40;
const ANDROID_SCALE = 0.63;

const PIN_HEIGHT = Platform.OS === 'android' ? BASE_PIN_HEIGHT * ANDROID_SCALE : BASE_PIN_HEIGHT;
const PIN_WIDTH = Platform.OS === 'android' ? BASE_PIN_WIDTH * ANDROID_SCALE : BASE_PIN_WIDTH;

const PIN_NUMBER_CIRCLE_SIZE = Platform.OS === 'android' ? 20 : 20;

// White center circle in the SVG is vertically centered at y≈17.673 in a 62px-tall viewBox
const CENTER_CIRCLE_Y_RATIO = 17.673 / 62;

// SVG path tip sits at y≈60.36 inside the 62px viewBox, leaving ~1.64px of empty space below.
const SVG_TIP_Y_RATIO = 60.36 / 62;

// react-native-maps centers view-based markers on the coordinate (the `anchor` prop is
// unreliable for child-view markers on iOS). We extend the wrapper downward with empty
// space so the visible SVG tip lands at the wrapper's vertical center — that puts the
// tip on the coordinate via the default centering, with no platform-specific props.
const WRAPPER_HEIGHT = 2 * PIN_HEIGHT * SVG_TIP_Y_RATIO;

// Size and top offset for the event-count circle rendered over the SVG center circle
const EVENT_CIRCLE_SIZE = Platform.OS === 'android' ? 20 : 24;
const EVENT_CIRCLE_TOP = PIN_HEIGHT * CENTER_CIRCLE_Y_RATIO - EVENT_CIRCLE_SIZE / 2;

const styles = StyleSheet.create({
  markerWrapper: {
    width: PIN_WIDTH,
    height: WRAPPER_HEIGHT,
    alignItems: 'center',
  },
  pinContainer: {
    width: PIN_WIDTH,
    height: PIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  pinNumberContainer: {
    position: 'absolute',
    top: 2, // Positioned at the top of the pin
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumberCircle: {
    width: PIN_NUMBER_CIRCLE_SIZE,
    height: PIN_NUMBER_CIRCLE_SIZE,
    borderRadius: PIN_NUMBER_CIRCLE_SIZE / 2,
    backgroundColor: Colors.blueColorMode,
    borderWidth: 1.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumber: {
    fontSize: Platform.OS === 'android' ? 8 : 12,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.white,
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center',
        }
      : {}),
  },
  eventCountContainer: {
    position: 'absolute',
    top: EVENT_CIRCLE_TOP,
    alignItems: 'center',
    justifyContent: 'center',
    width: EVENT_CIRCLE_SIZE,
    height: EVENT_CIRCLE_SIZE,
  },
  eventCount: {
    fontSize: Platform.OS === 'android' ? 10 : 14,
    fontFamily: 'Quicksand_700Bold',
    color: Colors.blueColorMode,
    textAlign: 'center',
    ...(Platform.OS === 'android'
      ? {
          includeFontPadding: false,
          textAlignVertical: 'center',
        }
      : {}),
  },
});

export default MapMarker;

