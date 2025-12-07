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
    <Svg
      width={size}
      height={size}
      viewBox="0 0 27 27"
      fill="none"
    >
      <Path
        d="M4.125 26v-6.25m0-12.5V1M1 4.125h6.25M1 22.875h6.25m7.5-20.625l-2.168 5.636c-.352.917-.529 1.375-.803 1.76a3.75 3.75 0 01-.883.883c-.385.274-.843.45-1.76.803L3.5 13.5l5.636 2.168c.917.352 1.375.529 1.76.803.342.242.64.541.883.883.274.385.45.843.803 1.76l2.168 5.636 2.168-5.636c.352-.917.529-1.375.803-1.76a3.75 3.75 0 01.883-.883c.385-.274.843-.45 1.76-.803L26 13.5l-5.636-2.168c-.917-.352-1.375-.529-1.76-.803a3.75 3.75 0 01-.883-.883c-.274-.385-.45-.843-.803-1.76L14.75 2.25z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={1}
      />
    </Svg>
  );
};

export default SparkleIcon;

