import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface CloseIconProps {
  size?: number;
  color?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({ 
  size = 21, 
  color = '#1D0A74' 
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 21 21" 
        fill="none"
      >
        <Circle
          cx="10.0909"
          cy="10.0909"
          r="9.09091"
          stroke={color}
          strokeWidth="2"
        />
        <Path
          d="M6 14.5L14.5 6M14.5 14.5L6 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CloseIcon;
