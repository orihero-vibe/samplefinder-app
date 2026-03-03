import React from 'react';
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
        anchor={{ x: 0.5, y: ANCHOR_Y }}
        tracksViewChanges={TRACKS_VIEW_CHANGES}
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
        anchor={{ x: 0.5, y: ANCHOR_Y }}
        tracksViewChanges={TRACKS_VIEW_CHANGES}
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

/** Extra space below pin so the tip is not clipped by the map's marker view */
const BOTTOM_PADDING = Platform.OS === 'android' ? 6 : 12;

// White center circle in the SVG is vertically centered at y≈17.673 in a 62px-tall viewBox
const CENTER_CIRCLE_Y_RATIO = 17.673 / 62;

// Size and top offset for the event-count circle rendered over the SVG center circle
const EVENT_CIRCLE_SIZE = Platform.OS === 'android' ? 20 : 24;
const EVENT_CIRCLE_TOP = PIN_HEIGHT * CENTER_CIRCLE_Y_RATIO - EVENT_CIRCLE_SIZE / 2;

/** Anchor y so the pin tip (not wrapper bottom) is on the coordinate: tip is at PIN_HEIGHT of (PIN_HEIGHT + BOTTOM_PADDING) */
const ANCHOR_Y = PIN_HEIGHT / (PIN_HEIGHT + BOTTOM_PADDING);

/** Android needs tracksViewChanges=true for custom marker content to render */
const TRACKS_VIEW_CHANGES = Platform.OS === 'android';

const styles = StyleSheet.create({
  markerWrapper: {
    width: PIN_WIDTH,
    height: PIN_HEIGHT + BOTTOM_PADDING,
    paddingBottom: BOTTOM_PADDING,
    alignItems: 'center',
    justifyContent: 'flex-end',
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

