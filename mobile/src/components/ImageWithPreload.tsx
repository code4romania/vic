import React, { ImageStyle } from 'react-native';
import { Image } from 'expo-image';

const blurhash = 'L3O;6_0001IA~UD%IURk00MxE1Wq';

interface ImageWithPreloadProps {
  styles: ImageStyle;
  source: string;
}

const ImageWithPreload = (props: ImageWithPreloadProps) => (
  <Image
    placeholder={blurhash}
    contentFit="cover"
    transition={1000}
    source={props.source}
    style={props.styles}
  />
);

export default ImageWithPreload;
