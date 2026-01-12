import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface CertifiedBrandAmbassadorIconProps {
  size?: number;
  color?: string;
  disabled?: boolean;
}

const CertifiedBrandAmbassadorIcon: React.FC<CertifiedBrandAmbassadorIconProps> = ({
  size = 34,
  color = '#F16F30',
  disabled = false,
}) => {
  const opacity = disabled ? 0.4 : 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 34 35" fill="none" opacity={opacity}>
      <Circle
        cx="17"
        cy="17"
        r="16"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M22.8286 17.9863L23.5906 19.5104C23.8485 20.0262 23.9775 20.2841 24.1498 20.5076C24.3026 20.7059 24.4804 20.8837 24.6787 21.0366C24.9022 21.2089 25.1601 21.3378 25.6759 21.5957L27.2 22.3578L25.6759 23.1198C25.1601 23.3777 24.9022 23.5067 24.6787 23.6789C24.4804 23.8318 24.3026 24.0096 24.1498 24.2079C23.9775 24.4314 23.8485 24.6893 23.5906 25.2051L22.8286 26.7292L22.0665 25.2051C21.8086 24.6893 21.6797 24.4314 21.5074 24.2079C21.3545 24.0096 21.1768 23.8318 20.9784 23.6789C20.755 23.5067 20.4971 23.3777 19.9812 23.1198L18.4572 22.3578L19.9812 21.5957C20.4971 21.3378 20.755 21.2089 20.9784 21.0366C21.1768 20.8837 21.3545 20.7059 21.5074 20.5076C21.6797 20.2841 21.8086 20.0262 22.0665 19.5104L22.8286 17.9863Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.4858 19.7542H13.1143C11.7587 19.7542 11.0808 19.7542 10.5292 19.9215C9.28735 20.2982 8.31552 21.2701 7.9388 22.5119C7.77148 23.0635 7.77148 23.7414 7.77148 25.097M19.9143 11.9828C19.9143 14.397 17.9572 16.3542 15.5429 16.3542C13.1286 16.3542 11.1715 14.397 11.1715 11.9828C11.1715 9.56848 13.1286 7.61133 15.5429 7.61133C17.9572 7.61133 19.9143 9.56848 19.9143 11.9828Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CertifiedBrandAmbassadorIcon;
