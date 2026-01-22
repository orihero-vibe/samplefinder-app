import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface CalendarAddedIconProps {
  size?: number;
  color?: string;
}

const CalendarAddedIcon: React.FC<CalendarAddedIconProps> = ({
  size = 23,
  color = '#1D0A74',
}) => {
  const aspectRatio = 22 / 23;
  const width = size * aspectRatio;
  
  return (
    <Svg
      width={width}
      height={size}
      viewBox="0 0 22 23"
      fill="none"
    >
      <Rect
        x="2"
        y="4"
        width="16"
        height="4"
        fill="white"
      />
      <Path
        d="M19 10.5V7.8C19 6.11984 19 5.27976 18.673 4.63803C18.3854 4.07354 17.9265 3.6146 17.362 3.32698C16.7202 3 15.8802 3 14.2 3H5.8C4.11984 3 3.27976 3 2.63803 3.32698C2.07354 3.6146 1.6146 4.07354 1.32698 4.63803C1 5.27976 1 6.11984 1 7.8V16.2C1 17.8802 1 18.7202 1.32698 19.362C1.6146 19.9265 2.07354 20.3854 2.63803 20.673C3.27976 21 4.11984 21 5.8 21H10.5M19 9H1M14 1V5M6 1V5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 20V14M13 17H19"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 20V17M16 17V14M16 17H13M16 17H19"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CalendarAddedIcon;
