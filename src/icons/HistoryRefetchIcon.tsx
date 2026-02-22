import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HistoryRefetchIconProps {
  size?: number;
  color?: string;
}

const HistoryRefetchIcon: React.FC<HistoryRefetchIconProps> = ({
  size = 21,
  color = 'white',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        d="M1 8.38889C1 8.38889 3.00498 5.50534 4.63383 3.78481C6.26269 2.06428 8.5136 1 11 1C15.9706 1 20 5.25329 20 10.5C20 15.7467 15.9706 20 11 20C6.89691 20 3.43511 17.1017 2.35177 13.1389M1 8.38889V3.78481M1 8.38889H4.63383"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 6.27734V12.6107L14.7384 14.5837"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default HistoryRefetchIcon;
