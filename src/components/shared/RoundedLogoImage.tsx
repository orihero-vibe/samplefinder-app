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
  return (
    <View
      style={[
        styles.container,
        { width, height },
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
    borderRadius: 9999,
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

