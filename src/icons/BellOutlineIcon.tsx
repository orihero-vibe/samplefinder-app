import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface BellOutlineIconProps {
  size?: number;
  color?: string;
}

export const BellOutlineIcon: React.FC<BellOutlineIconProps> = ({ 
  size = 21, 
  color = 'white' 
}) => {
  const scale = size / 21; // Original height is 21
  const width = 19 * scale;
  const height = 21 * scale;

  return (
    <Svg width={width} height={height} viewBox="0 0 19 21" fill="none">
      <Path
        d="M9.47898 1.28516C6.07157 1.28516 3.31231 4.005 3.31231 7.36373V9.28039C3.31231 9.90103 3.05306 10.832 2.72898 11.3613L1.55306 13.2963C0.830833 14.4919 1.33083 15.8244 2.66417 16.2625C7.09009 17.7137 11.8771 17.7137 16.3031 16.2625C17.5531 15.8518 18.0901 14.4098 17.4142 13.2963L16.2382 11.3613C15.9142 10.832 15.6549 9.8919 15.6549 9.28039V7.36373C15.6456 4.02325 12.8679 1.28516 9.47898 1.28516Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <Path
        d="M12.5436 16.6387C12.5436 18.3089 11.1547 19.678 9.46029 19.678C8.61769 19.678 7.83992 19.3311 7.28436 18.7835C6.7288 18.2359 6.37695 17.4692 6.37695 16.6387"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
      />
    </Svg>
  );
};
