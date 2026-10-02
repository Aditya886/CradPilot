import { Image } from "react-native";

export const assets: any = {
  dollar: require("../assets/images/assets/high-resolution-color-logo.png"),
  bg: require("../assets/images/assets/bg3.png"),
};

export const dummy: any = {

}

export const icons: any = {
};

/**
   * Function to get an asset by its key
   * @param key The key name of the image in the assets map
   * @returns The required image or undefined if not found
   */
export const getAsset = (key: string): any => {

  return assets[key] || undefined;
};
export const getAssetIcon = (key: string): any => {

  return icons[key] || undefined;
};

/**
 * Function to get all assets
 * @returns All assets in the map
 */
export const getAllAssets = (): Record<string, any> => {
  return assets;
};
