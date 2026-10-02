import React from 'react';
import { TouchableOpacity, StyleSheet, View, Dimensions } from 'react-native';
import { colors } from '../../utils/colors';
import { resAvarage } from '../../utils/responsive';
import Tick from '../../assets/images/icons/check.svg';

const { width } = Dimensions.get('window');

const scale = size => (width / 375) * size;

const CustomTickBox = ({
  checked = false,
  onPress,
  size = resAvarage(3.3),
  activeColor = colors.btnColor,
  inactiveColor = colors.white20,
  borderRadius = scale(4),
  style,
}: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: checked ? activeColor : 'transparent',
          borderColor: checked ? activeColor : inactiveColor,
        },
        style,
      ]}
    >
      {checked && <Tick width={size * 0.9} height={size * 0.9} />}
    </TouchableOpacity>
  );
};

export default CustomTickBox;

const styles = StyleSheet.create({
  box: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
