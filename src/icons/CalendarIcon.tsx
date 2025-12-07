import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface CalendarIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
}

const CalendarIcon: React.FC<CalendarIconProps> = ({ 
  size = 24, 
  color = '#1E0E50',
  circleColor = '#FFFFFF' 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 22 24"
      fill="none"
    >
      <Path
        d="M6.38 3.274c-1.848 0-2.772 0-3.478.356A3.286 3.286 0 001.46 5.06c-.36.7-.36 1.617-.36 3.45v9.164c0 1.832 0 2.749.36 3.449a3.287 3.287 0 001.442 1.43c.706.357 1.63.357 3.478.357h5.17M20.9 9.82H1.1m5.5-8.728v4.363"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
      <Path
        d="M15.62 3.274c1.848 0 2.772 0 3.478.356.621.314 1.126.815 1.442 1.43.36.7.36 1.617.36 3.45v9.164c0 1.832 0 2.749-.36 3.449a3.287 3.287 0 01-1.442 1.43c-.706.357-1.63.357-3.478.357h-5.17M1.1 9.82h19.8m-5.5-8.728V5.455"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
      <Path
        d="M15.95 3.273h-11"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={1}
      />
    </Svg>  
  );
};

export default CalendarIcon;

