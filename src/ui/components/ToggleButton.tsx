import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Easing,
  Platform,
} from 'react-native';
import { resWidth } from '../../utils/responsive';
import { colors } from '../../utils/colors';
import { scaleSize } from './../../utils/responsive';
import { useAppSelector } from '../../utils/hooks';

const ToggleButton = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => {
  const offset = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const switchTranslate = offset.interpolate({
    inputRange: [0, 1],
    outputRange: Platform.OS === 'ios' ? [1, 22] : [1, 19],
  });

  const switchBgColor = value ? colors.btnColor : colors.borderColor;

  return (
    <TouchableWithoutFeedback onPress={onToggle}>
      <View style={[styles.switchContainer, { backgroundColor: switchBgColor }]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX: switchTranslate }],
            },
          ]}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: resWidth(10),
    borderRadius: resWidth(100),
    padding: scaleSize(2),
    justifyContent: 'center',
  },
  knob: {
    width: resWidth(3.5),
    height: resWidth(3.5),
    borderRadius: resWidth(100),
    backgroundColor: colors.bgWhite,
    elevation: 1,
  },
});


export default ToggleButton;
