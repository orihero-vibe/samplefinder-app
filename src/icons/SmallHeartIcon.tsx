import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SmallHeartIconProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

const SmallHeartIcon: React.FC<SmallHeartIconProps> = ({
  size = 18,
  color = '#090188',
}) => {
  const aspectRatio = 25 / 18;
  const width = size * aspectRatio;
  
  return (
    <Svg
      width={width}
      height={size}
      viewBox="0 0 25 18"
      fill="none"
    >
      <Path 
        d="M12.1919 3.49902C13.5926 0.483256 17.2594 -0.836791 20.3824 0.551758C23.5051 1.94064 24.9014 5.51216 23.5015 8.52832C22.9058 9.81127 21.8993 10.7868 20.6997 11.3779L12.106 17.8086L3.34622 11.3779C2.14665 10.7868 1.14018 9.81125 0.544464 8.52832C-0.855596 5.51201 0.540561 1.94053 3.6636 0.551758C6.78667 -0.836607 10.4545 0.483053 11.855 3.49902C11.9165 3.63143 11.9722 3.76608 12.023 3.90039C12.0737 3.76601 12.1304 3.6315 12.1919 3.49902Z" 
        fill={color}
      />
    </Svg>
  );
};

export default SmallHeartIcon;
