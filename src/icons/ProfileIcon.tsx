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
    <Svg
      width={size}
      height={size}
      viewBox="0 0 25 27"
      fill="none"
    >
      <Path
        d="M15.521 17.278c1.857 0 3.008-.01 3.971.282a6.532 6.532 0 014.356 4.352c.292.963.28 2.113.28 3.969a1 1 0 01-2 0c0-2.002-.01-2.78-.194-3.388a4.532 4.532 0 00-3.022-3.02c-.607-.183-1.389-.195-3.39-.195H8.607c-2.002 0-2.783.012-3.39.196a4.532 4.532 0 00-3.022 3.02C2.011 23.1 2 23.88 2 25.88a1 1 0 01-2 0c0-1.856-.01-3.006.281-3.969a6.532 6.532 0 014.356-4.352c.963-.292 2.113-.282 3.97-.282h6.915zM12.064 0a7.223 7.223 0 017.225 7.22 7.223 7.223 0 01-7.225 7.22 7.222 7.222 0 01-7.223-7.22A7.223 7.223 0 0112.065 0zm0 2a5.223 5.223 0 00-5.223 5.22 5.222 5.222 0 005.224 5.22 5.223 5.223 0 005.224-5.22c0-2.882-2.34-5.22-5.225-5.22z"
        fill={color}
        fillOpacity={1}
      />
    </Svg>
  );
};

export default ProfileIcon;

