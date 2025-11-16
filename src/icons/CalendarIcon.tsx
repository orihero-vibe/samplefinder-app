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
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={circleColor} stroke={color} strokeWidth="1"/>
      <Rect x="6" y="8" width="12" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.5"/>
      <Path
        d="M6 11H18"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Rect x="7" y="5" width="2" height="3" rx="0.5" fill={color}/>
      <Rect x="15" y="5" width="2" height="3" rx="0.5" fill={color}/>
      <Circle cx="9" cy="15" r="1" fill={color}/>
      <Circle cx="12" cy="15" r="1" fill={color}/>
      <Circle cx="15" cy="15" r="1" fill={color}/>
    </Svg>
  );
};

export default CalendarIcon;

