import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface SparkleIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
}

const SparkleIcon: React.FC<SparkleIconProps> = ({ 
  size = 24, 
  color = '#1E0E50',
  circleColor = '#FFFFFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={circleColor} stroke={color} strokeWidth="1"/>
      <Path
        d="M12 7L12.5 9.5L15 10L12.5 10.5L12 13L11.5 10.5L9 10L11.5 9.5L12 7Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 12L9 12.5L8 13L7 12.5L8 12Z"
        fill={color}
      />
      <Path
        d="M16 12L17 12.5L16 13L15 12.5L16 12Z"
        fill={color}
      />
    </Svg>
  );
};

export default SparkleIcon;

