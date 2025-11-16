import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface HomeIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
}

const HomeIcon: React.FC<HomeIconProps> = ({ 
  size = 24, 
  color = '#1E0E50',
  circleColor = '#FFFFFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={circleColor} stroke={color} strokeWidth="1"/>
      <Path
        d="M12 6L7 10V18H10V14H14V18H17V10L12 6Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12H15M9 15H15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default HomeIcon;

