import React from 'react';
import { Image, ImageProps, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type RoundedLogoImageProps = Omit<ImageProps, 'source' | 'style'> & {
  source: ImageSourcePropType;
  width: number;
  height: number;
  containerStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  backgroundColor?: string;
};

const RoundedLogoImage: React.FC<RoundedLogoImageProps> = ({
  source,
  width,
  height,
  containerStyle,
  imageStyle,
  backgroundColor,
  ...imageProps
}) => {
  const borderRadius = (() => {
    const minSide = Math.min(width, height);
    const radius = Math.round(minSide * 0.18);
    return Math.max(6, Math.min(20, radius));
  })();

  return (
    <View
      style={[
        styles.container,
        { width, height, borderRadius },
        backgroundColor ? { backgroundColor } : null,
        containerStyle,
      ]}
    >
      <Image source={source} style={[styles.image, imageStyle]} {...imageProps} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default RoundedLogoImage;

