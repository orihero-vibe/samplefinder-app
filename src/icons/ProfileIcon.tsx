import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface ProfileIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  size = 24, 
  color = '#1E0E50',
  circleColor = '#FFFFFF' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="11" fill={circleColor} stroke={color} strokeWidth="1"/>
      <Circle cx="12" cy="9" r="3" fill="none" stroke={color} strokeWidth="1.5"/>
      <Path
        d="M6 19C6 15 8.5 13 12 13C15.5 13 18 15 18 19"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default ProfileIcon;

