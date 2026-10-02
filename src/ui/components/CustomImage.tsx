import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import { icons } from '../../utils/AppImages';
import SkeletonComponent from '../../utils/SkeletonComponent';
import { scaleSize } from '../../utils/responsive';

interface CustomImageProps extends FastImageProps {
  placeholder?: React.ReactNode; // Placeholder while loading
  loadingIndicator?: boolean; // Show a loading spinner
  errorComponent?: React.ReactNode; // Component to display on error
  style?: any; // Custom styles for the image
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center'; // Image resize mode
  tintColor?: string; // Tint color for the image
  onError?: any;
}

const CustomImage: React.FC<CustomImageProps> = ({
  source,
  placeholder,
  loadingIndicator = true,
  errorComponent,
  style,
  resizeMode = 'cover',
  tintColor,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (event: any) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading && loadingIndicator && (
        <View style={styles.loadingContainer}>
          <SkeletonComponent width={scaleSize(30)} borderRadius={scaleSize(10)} height={scaleSize(30)} />
        </View>
      )}

      {hasError ? (
        errorComponent || (
          <View style={[styles.errorContainer, style]}>
            <Image
              style={[styles.errorImage, style]}
              resizeMode="contain"
              source={icons.crackImage}
            />
          </View>
        )
      ) : tintColor ? (
        // Use Image component if tintColor is provided
        <Image
          source={source}
          style={[styles.image, style, { tintColor }]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        <FastImage
          source={source}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          {...props}
        />
      )}

      {placeholder && isLoading && !hasError && (
        <View style={styles.placeholderContainer}>{placeholder}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorImage: {
    width: 50,
    height: 50,
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomImage;
