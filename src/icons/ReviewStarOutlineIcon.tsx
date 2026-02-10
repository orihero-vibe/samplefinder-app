import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ReviewStarOutlineIconProps {
  width?: number;
  height?: number;
}

const ReviewStarOutlineIcon: React.FC<ReviewStarOutlineIconProps> = ({
  width = 37,
  height = 37,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 37 37" fill="none">
      <Path
        d="M20.7061 13.2344L21.1172 14.501H30.127L23.916 19.0137L22.8379 19.7969L23.25 21.0635L25.6221 28.3652L19.4111 23.8525L18.333 23.0703L17.2559 23.8525L11.0439 28.3643L13.417 21.0635L13.8281 19.7969L12.751 19.0137L6.53906 14.501H15.5488L15.9609 13.2344L18.333 5.93262L20.7061 13.2344Z"
        stroke="#1D0A74"
        strokeWidth={3.66667}
      />
    </Svg>
  );
};

export default ReviewStarOutlineIcon;
