import { Dimensions, PixelRatio, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 410;  // iPhone 11 Pro width
const BASE_HEIGHT = 812; // iPhone 11 Pro height

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(scaleWidth, scaleHeight);

export const isTablet = SCREEN_WIDTH >= 600;

/** Font scaling */
export const scaleFontSize = (size: number): number => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/** Scales by width - optimized for mobile */
export const resWidth = (w: number): number => {
  if (isTablet) {
    // For tablets, use a more conservative scaling
    const tabletModeration = SCREEN_WIDTH > 1000 ? 0.6 : 1;
    return (SCREEN_WIDTH * w * tabletModeration) / 100;
  }
  // For mobile, use full percentage
  return (SCREEN_WIDTH * w) / 100;
};

/** Scales by height - optimized for mobile */
export const resHeight = (h: number): number => {
  if (isTablet) {
    // For tablets, use a more conservative scaling
    const tabletModeration = SCREEN_HEIGHT > 1200 ? 0.6 : 1;
    return (SCREEN_HEIGHT * h * tabletModeration) / 100;
  }
  // For mobile, use full percentage
  return (SCREEN_HEIGHT * h) / 100;
};

/** Tablet-specific width scaling */
export const resWidthTablet = (w: number): number => {
  const moderation = SCREEN_WIDTH > 1000 ? 0.6 : 0.7;
  return (SCREEN_WIDTH * w * moderation) / 100;
};

export const resAvarage = (value: any) => {
  const res = (SCREEN_WIDTH + SCREEN_HEIGHT) / 2;
  return Math.round((res * value) / 100);
};


/** Tablet-specific height scaling */
export const resHeightTablet = (h: number): number => {
  const moderation = SCREEN_HEIGHT > 1200 ? 0.6 : 0.7;
  return (SCREEN_HEIGHT * h * moderation) / 100;
};

/** Mobile-specific width scaling */
export const resWidthMobile = (w: number): number => {
  return (SCREEN_WIDTH * w) / 100;
};

/** Mobile-specific height scaling */
export const resHeightMobile = (h: number): number => {
  return (SCREEN_HEIGHT * h) / 100;
};

/** Scale any element */
export const scaleSize = (size: number): number => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

export const statusBarHeight = Platform.select({
  ios: SCREEN_HEIGHT >= 812 ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0,
});