import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface HeartIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
  filled?: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({ 
  size = 24, 
  color = '#1E0E50',
  circleColor = '#FFFFFF',
  filled = false
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={circleColor} stroke={color} strokeWidth="1"/>
      <Path
        d="M12 8C10.5 6.5 8.5 6.5 7 8C5.5 9.5 5.5 11.5 7 13L12 18L17 13C18.5 11.5 18.5 9.5 17 8C15.5 6.5 13.5 6.5 12 8Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HeartIcon;

