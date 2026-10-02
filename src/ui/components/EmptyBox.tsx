import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import CustomImage from './CustomImage';
import {assets, icons} from '../../utils/AppImages';
import {resHeight, resWidth, scaleSize} from '../../utils/responsive';
import {colors} from '../../utils/colors';
import CustomText from './CustomText';

export default function EmptyBox({
  style,
  title,
  subtitle,
  icon,
  iconColor,
}: any) {
  return (
    <View style={[styles.main, style]}>
      {/* <CustomImage
        resizeMode="contain"
        source={icon || assets.empty}
        style={styles.icon}
      /> */}
      <CustomText variant="title" style={styles.title}>{title || 'No data found'}</CustomText>
      <CustomText variant="body" style={styles.subtitle}>
        {subtitle || 'There is no data to show you right now'}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 0.9,
    // height: resHeight(100),
    width: resWidth(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
    // backgroundColor: 'red'
  },
  icon: {
    width: resWidth(20),
    height: resWidth(20),
    // backgroundColor:"red"
  },
  title: {
    color: colors.bgColor,
    marginTop: scaleSize(15),
    marginVertical: scaleSize(5),
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: resWidth(5.5),
    maxWidth: resWidth(80),
    color: colors.textBlack41,
  },
});
