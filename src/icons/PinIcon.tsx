import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PinIconProps {
  width?: number;
  height?: number;
  pinColor?: string;
  circleColor?: string;
}

const PinIcon: React.FC<PinIconProps> = ({
  width = 40,
  height = 62,
  pinColor = '#1D0A74',
  circleColor = '#FFFFFF',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 62" fill="none">
      {/* Teardrop pin shape */}
      <Path
        d="M20.1706 1.2412C9.77312 1.14919 1.26735 9.35199 1.17267 19.5626C1.14505 22.5468 1.8394 25.3721 3.09495 27.8797L3.10777 27.9059L3.12552 27.9398C3.20344 28.0938 3.28234 28.2459 3.36421 28.397L20.071 60.3646L36.7038 28.271C36.76 28.1645 36.8152 28.058 36.8695 27.9504L36.9001 27.8923L36.906 27.8797C38.1132 25.4699 38.8016 22.7628 38.8283 19.8978C38.9229 9.68615 30.57 1.33322 20.1716 1.24023L20.1706 1.2412Z"
        fill={pinColor}
      />
      {/* White center circle */}
      <Path
        d="M20.0711 29.087C26.49 29.087 31.6935 23.9769 31.6935 17.6734C31.6935 11.3698 26.49 6.25977 20.0711 6.25977C13.6522 6.25977 8.44861 11.3698 8.44861 17.6734C8.44861 23.9769 13.6522 29.087 20.0711 29.087Z"
        fill={circleColor}
      />
    </Svg>
  );
};

export default PinIcon;
