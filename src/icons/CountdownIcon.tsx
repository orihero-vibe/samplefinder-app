import React from 'react';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CountdownIconProps {
  size?: number;
  opacity?: number;
}

const CountdownIcon: React.FC<CountdownIconProps> = ({
  size = 85,
  opacity = 1,
}) => {
  const height = (size * 84) / 85;

  return (
    <Svg width={size} height={height} viewBox="0 0 85 84" fill="none" opacity={opacity}>
      <Defs>
        <LinearGradient id="paint0_linear" x1="41.8696" y1="1.5" x2="41.8696" y2="82.5" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#95268B" stopOpacity="1" />
          <Stop offset="1" stopColor="#090188" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="paint1_linear" x1="62.0544" y1="1.5" x2="62.0544" y2="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#95268B" stopOpacity="1" />
          <Stop offset="1" stopColor="#090188" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="paint2_linear" x1="82.2393" y1="39.7324" x2="82.2393" y2="44.2684" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#95268B" stopOpacity="1" />
          <Stop offset="1" stopColor="#090188" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <Path
        d="M82.2393 42C82.2393 64.3675 64.1652 82.5 41.8696 82.5C19.5741 82.5 1.5 64.3675 1.5 42C1.5 19.6325 19.5741 1.5 41.8696 1.5C64.1652 1.5 82.2393 19.6325 82.2393 42Z"
        stroke="url(#paint0_linear)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="0.2 10"
      />

      <Path
        d="M82.2393 42C82.2393 19.6325 64.1652 1.5 41.8696 1.5"
        stroke="url(#paint1_linear)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <Ellipse
        cx="82.2393"
        cy="42.0004"
        rx="2.2607"
        ry="2.268"
        fill="url(#paint2_linear)"
      />
    </Svg>
  );
};

export default CountdownIcon;
