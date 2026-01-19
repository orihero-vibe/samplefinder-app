import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface MapIconProps {
  size?: number;
  color?: string;
}

const MapIcon: React.FC<MapIconProps> = ({
  size = 21,
  color = '#C2C1C1',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        d="M7.36364 15.5455L1 19.1818V4.63636L7.36364 1M7.36364 15.5455L13.7273 19.1818M7.36364 15.5455V1M13.7273 19.1818L19.1818 15.5455V1L13.7273 4.63636M13.7273 19.1818V4.63636M13.7273 4.63636L7.36364 1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default MapIcon;
