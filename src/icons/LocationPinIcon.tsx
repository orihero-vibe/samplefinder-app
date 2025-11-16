import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface LocationPinIconProps {
  size?: number;
  color?: string;
  magnifyingGlassColor?: string;
}

const LocationPinIcon: React.FC<LocationPinIconProps> = ({
  size = 80,
  color = '#6B46C1',
  magnifyingGlassColor = '#FFFFFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Location Pin Shape */}
      <Path
        d="M40 8C28.954 8 20 16.954 20 28C20 42 40 72 40 72C40 72 60 42 60 28C60 16.954 51.046 8 40 8Z"
        fill={color}
      />
      {/* Magnifying Glass Circle */}
      <Circle
        cx="40"
        cy="28"
        r="12"
        stroke={magnifyingGlassColor}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Magnifying Glass Handle */}
      <Path
        d="M48 36L54 42"
        stroke={magnifyingGlassColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default LocationPinIcon;

