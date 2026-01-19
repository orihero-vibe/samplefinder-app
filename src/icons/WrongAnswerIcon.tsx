import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WrongAnswerIconProps {
  size?: number;
  opacity?: number;
}

const WrongAnswerIcon: React.FC<WrongAnswerIconProps> = ({
  size = 83,
  opacity = 1,
}) => {
  const height = (size * 85) / 83;

  return (
    <Svg width={size} height={height} viewBox="0 0 83 85" fill="none" opacity={opacity}>
      <Path
        d="M80.7597 42.6708C80.7597 20.9616 63.1738 3.36426 41.4819 3.36426C19.7901 3.36431 2.2041 20.9617 2.2041 42.6708C2.2041 64.3799 19.7901 81.9772 41.4819 81.9773C63.1738 81.9773 80.7597 64.3799 80.7597 42.6708ZM82.9638 42.6708C82.9638 65.5957 64.3925 84.1814 41.4819 84.1814C18.5713 84.1813 1.18252e-07 65.5957 0 42.6708C0 19.7459 18.5713 1.16021 41.4819 1.16016C64.3925 1.16016 82.9638 19.7458 82.9638 42.6708Z"
        fill="url(#paint0_linear_6019_2650)"
      />
      <Path
        d="M43.7147 2.26288C43.7147 3.51263 42.7023 4.52576 41.4534 4.52576C40.2045 4.52576 39.1921 3.51263 39.1921 2.26288C39.1921 1.01313 40.2045 0 41.4534 0C42.7023 0 43.7147 1.01313 43.7147 2.26288Z"
        fill="url(#paint1_linear_6019_2650)"
      />
      <Path
        d="M56.674 24.1109C57.9651 22.8198 60.0587 22.8198 61.3498 24.1109C62.6406 25.402 62.6406 27.495 61.3498 28.786L45.8199 44.3152L61.3498 59.8451C62.6409 61.1362 62.6409 63.2298 61.3498 64.5209C60.0587 65.812 57.9651 65.812 56.674 64.5209L41.1441 48.991L25.6149 64.5209C24.3238 65.8118 22.2309 65.8118 20.9398 64.5209C19.6487 63.2298 19.6487 61.1362 20.9398 59.8451L36.469 44.3152L20.9398 28.786C19.6487 27.4949 19.6487 25.4021 20.9398 24.1109C22.2309 22.8198 24.3238 22.8198 25.6149 24.1109L41.1441 39.6401L56.674 24.1109Z"
        fill="url(#paint2_linear_6019_2650)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_6019_2650"
          x1="41.4819"
          y1="1.16016"
          x2="41.4819"
          y2="84.1814"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#F51616" />
          <Stop offset="1" stopColor="#6C0331" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_6019_2650"
          x1="41.4534"
          y1="0"
          x2="41.4534"
          y2="4.52576"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#F51616" />
          <Stop offset="1" stopColor="#6C0331" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_6019_2650"
          x1="41.1448"
          y1="23.1426"
          x2="41.1448"
          y2="65.4893"
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#F51616" />
          <Stop offset="1" stopColor="#6C0331" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

export default WrongAnswerIcon;
