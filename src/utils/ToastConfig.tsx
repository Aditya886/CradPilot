import React from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { FontSemiBold } from './fontFamily';
import { font14 } from './fontSizes';
import { colors } from './colors';
import { resWidth, scaleSize } from './responsive';
import { icons } from './AppImages'; // make sure your icons are defined here
import FastImage from 'react-native-fast-image';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text2Style={styles.text1}
      renderLeadingIcon={() => (
        <FastImage
          source={icons.confirm} // e.g. require('../assets/icons/success.png')
          style={styles.icon}
          resizeMode="contain"
        />
      )}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text2Style={styles.text1}
      renderLeadingIcon={() => (
        <FastImage
          source={icons.redInfo} // e.g. require('../assets/icons/error.png')
          style={styles.icon}
          resizeMode="contain"
        />
      )}
    />
  ),

  info: (props: any) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text2Style={styles.text1}
      renderLeadingIcon={() => (
        <FastImage
          source={icons.infoIcon} // e.g. require('../assets/icons/info.png')
          style={styles.icon}
          resizeMode="contain"
        />
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.btnColor,
    borderLeftColor: colors.btnColor,
    backgroundColor: colors.bgWhite,
    width: resWidth(100),
    elevation: 0,
    borderRadius: resWidth(5),
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height:
      Platform.OS === 'ios'
        ? scaleSize(90)
        : Platform.Version > "34"
        ? scaleSize(90)
        : scaleSize(50),
    alignItems: 'flex-end',
  },
  errorToast: {
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderColor: "#F92323",
    borderLeftColor: "#F92323",
    backgroundColor: colors.bgWhite,
    width: resWidth(100),
    elevation: 0,
    borderRadius: resWidth(5),
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height:
      Platform.OS === 'ios'
        ? scaleSize(90)
        : Platform.Version > "34"
        ? scaleSize(90)
        : scaleSize(50),
    alignItems: 'flex-end',
  },
  infoToast: {
    borderLeftColor: 'blue',
    backgroundColor: '#d1ecf1',
    height: scaleSize(45),
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  text1: {
    fontSize: font14,
    fontFamily: FontSemiBold,
    color: '#333',
    marginBottom: scaleSize(15),
    marginLeft: 0,
    paddingLeft: 0,
    // backgroundColor:"red"
  },
  icon: {
    width: scaleSize(20),
    height: scaleSize(20),
    marginLeft: scaleSize(20),
    marginRight: scaleSize(0),
    marginBottom: scaleSize(15),
    alignSelf: 'flex-end',
  },
});

export default toastConfig;
