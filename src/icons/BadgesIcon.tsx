import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface BadgesIconProps {
  size?: number;
  strokeColor?: string;
  fillColor?: string;
}

const BadgesIcon: React.FC<BadgesIconProps> = ({
  size = 34,
  strokeColor = '#1D0A74',
  fillColor = 'white',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <Circle
        cx="17"
        cy="17"
        r="16.0286"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1.94286"
      />
      <Path
        d="M17 8.5L18.4818 11.4635C18.9832 12.4665 19.234 12.9679 19.5689 13.4025C19.8662 13.7881 20.2119 14.1338 20.5975 14.4311C21.0321 14.766 21.5335 15.0168 22.5365 15.5182L25.5 17L22.5365 18.4818C21.5335 18.9832 21.0321 19.234 20.5975 19.5689C20.2119 19.8662 19.8662 20.2119 19.5689 20.5975C19.234 21.0321 18.9832 21.5335 18.4818 22.5365L17 25.5L15.5182 22.5365C15.0168 21.5335 14.766 21.0321 14.4311 20.5975C14.1338 20.2119 13.7881 19.8662 13.4025 19.5689C12.9679 19.234 12.4665 18.9832 11.4635 18.4818L8.5 17L11.4635 15.5182C12.4665 15.0168 12.9679 14.766 13.4025 14.4311C13.7881 14.1338 14.1338 13.7881 14.4311 13.4025C14.766 12.9679 15.0168 12.4665 15.5182 11.4635L17 8.5Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BadgesIcon;
