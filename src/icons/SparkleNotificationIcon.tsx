import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface SparkleNotificationIconProps {
  size?: number;
  fillColor?: string;
  strokeColor?: string;
}

export const SparkleNotificationIcon: React.FC<SparkleNotificationIconProps> = ({
  size = 40,
  fillColor = 'white',
  strokeColor = '#D95AFF',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle
        cx="20"
        cy="20"
        r="19.0286"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.94286"
      />
      <Path
        d="M20 10L21.7432 13.4865C22.3332 14.6664 22.6282 15.2564 23.0223 15.7677C23.372 16.2213 23.7787 16.628 24.2323 16.9777C24.7436 17.3718 25.3336 17.6668 26.5135 18.2568L30 20L26.5135 21.7432C25.3336 22.3332 24.7436 22.6282 24.2323 23.0223C23.7787 23.372 23.372 23.7787 23.0223 24.2323C22.6282 24.7436 22.3332 25.3336 21.7432 26.5135L20 30L18.2568 26.5135C17.6668 25.3336 17.3718 24.7436 16.9777 24.2323C16.628 23.7787 16.2213 23.372 15.7677 23.0223C15.2564 22.6282 14.6664 22.3332 13.4865 21.7432L10 20L13.4865 18.2568C14.6664 17.6668 15.2564 17.3718 15.7677 16.9777C16.2213 16.628 16.628 16.2213 16.9777 15.7677C17.3718 15.2564 17.6668 14.6664 18.2568 13.4865L20 10Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
