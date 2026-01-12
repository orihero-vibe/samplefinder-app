import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface BadgeCircleIconProps {
  size?: number;
  color?: string;
  disabled?: boolean;
}

const BadgeCircleIcon: React.FC<BadgeCircleIconProps> = ({
  size = 35,
  color = '#D95AFF',
  disabled = false,
}) => {
  const opacity = disabled ? 0.3 : 1;

  return (
    <Svg width={size} height={size * 1.23} viewBox="0 0 35 43" fill="none" opacity={opacity}>
      {/* Main circle */}
      <Circle
        cx="17.0283"
        cy="17.5"
        r="16"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      {/* Sparkle star */}
      <Path
        d="M6.3426 1.9707L7.10465 3.49479C7.36255 4.0106 7.49151 4.26851 7.66378 4.49199C7.81664 4.69031 7.99443 4.86809 8.19274 5.02096C8.41623 5.19323 8.67414 5.32218 9.18994 5.58009L10.714 6.34213L9.18994 7.10418C8.67414 7.36208 8.41623 7.49103 8.19274 7.6633C7.99443 7.81617 7.81664 7.99395 7.66378 8.19227C7.49151 8.41576 7.36255 8.67366 7.10465 9.18947L6.34261 10.7136L5.58056 9.18947C5.32266 8.67366 5.1937 8.41576 5.02143 8.19227C4.86857 7.99395 4.69078 7.81617 4.49247 7.6633C4.26898 7.49103 4.01107 7.36208 3.49527 7.10418L1.97118 6.34213L3.49527 5.58009C4.01107 5.32218 4.26898 5.19323 4.49247 5.02096C4.69078 4.86809 4.86857 4.69031 5.02143 4.49199C5.1937 4.2685 5.32266 4.0106 5.58056 3.49479L6.3426 1.9707Z"
        fill="white"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BadgeCircleIcon;
