import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ReviewStarFilledIconProps {
  width?: number;
  height?: number;
}

const ReviewStarFilledIcon: React.FC<ReviewStarFilledIconProps> = ({
  width = 37,
  height = 37,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 37 37" fill="none">
      <Path
        d="M18.3333 0L22.4494 12.668H35.7694L24.9933 20.4973L29.1094 33.1653L18.3333 25.336L7.55727 33.1653L11.6734 20.4973L0.897297 12.668H14.2172L18.3333 0Z"
        fill="#1D0A74"
      />
    </Svg>
  );
};

export default ReviewStarFilledIcon;
