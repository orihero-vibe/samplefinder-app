import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface HeartIconProps {
  size?: number;
  color?: string;
  circleColor?: string;
  filled?: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  size = 24,
  color = '#090188',
  circleColor = '#FFFFFF',
  filled = false
}) => {
  const aspectRatio = 41 / 30;
  const height = size / aspectRatio;
  
  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 41 30"
      fill="none"
    >
      <Defs>
        <LinearGradient 
          id="heartGradient" 
          x1="20.5" 
          y1="0" 
          x2="20.5" 
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#090188" stopOpacity="1" />
          <Stop offset="0.5" stopColor="#4A0A5B" stopOpacity="1" />
          <Stop offset="0.75" stopColor="#6C0331" stopOpacity="1" />
          <Stop offset="1" stopColor="#910168" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Path 
        d="M20.3185 5.83301C22.6525 0.805737 28.7644 -1.39364 33.9699 0.920898C39.1751 3.23558 41.5028 9.1876 39.1691 14.2148C38.1763 16.3533 36.4977 17.9777 34.4982 18.9629L20.176 29.6816L5.57733 18.9629C3.57777 17.9776 1.89931 16.3534 0.906433 14.2148C-1.42726 9.18763 0.900578 3.23563 6.10565 0.920898C11.3111 -1.39359 17.423 0.805735 19.757 5.83301C19.86 6.05475 19.9524 6.27897 20.0373 6.50391C20.1222 6.27888 20.2156 6.05484 20.3185 5.83301Z" 
        fill="url(#heartGradient)"
      />
    </Svg>
  );
};

export default HeartIcon;

