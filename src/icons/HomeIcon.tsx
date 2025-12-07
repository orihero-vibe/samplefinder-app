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
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M1 9.286l9.862-7.749c.375-.295.563-.442.77-.5.181-.05.373-.05.555 0 .206.058.394.205.77.5l9.861 7.749m-16.145 7.2h10.472M6.673 11.914h10.472M3.182 7.571v11.2c0 1.28 0 1.92.238 2.41.209.43.543.78.953.998.467.25 1.078.25 2.3.25h10.472c1.222 0 1.833 0 2.3-.25.41-.219.744-.568.954-.998.237-.49.237-1.13.237-2.41v-11.2L14.004 2.36c-.752-.59-1.127-.885-1.54-.999-.364-.1-.746-.1-1.11 0-.413.114-.788.409-1.54.999L3.183 7.571z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  );
};

export default HomeIcon;

