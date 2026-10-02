import { View, Modal, StyleSheet, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { colors } from '../../utils/colors';
import { resHeight, resWidth, scaleSize } from '../../utils/responsive';
import {
  font15,
} from '../../utils/fontSizes';
import { t } from '../../language/t';
import GradientBorderButton from '../components/GradientBorderButton';

export default function LogoutModal({ show, setShow, onPress }: any) {
  const tranformY = useRef(new Animated.Value(resHeight(100))).current;

  useEffect(() => {
    if (show) {
      Animated.timing(tranformY, {
        duration: 300,
        useNativeDriver: true,
        toValue: 0,
      }).start();
    } else {
      setShow(false);
    }
  }, [show]);

  const close = () => {
    Animated.timing(tranformY, {
      toValue: resHeight(100),
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShow(false));
  };
  return (
    <Modal
      transparent
      visible={show}
      animationType="fade"
      onRequestClose={close}>
      <View style={styles.main}>
        <Animated.View
          style={[styles.box, { transform: [{ translateY: tranformY }] }]}>
          <CustomText variant="title" style={styles.title}>{t('profile.e')}</CustomText>
          <CustomText variant="body" style={styles.subtitle}>
            {t('profile.e1')}{' '}
          </CustomText>
          <View style={styles.buttonView}>
            <GradientBorderButton
              onPress={close}
              backgroundColor={colors.bgWhite}
              // textStyle={styles.text}
              style={styles.button}
              title={t('profile.e2')}
            />
            <CustomButton
              onPress={onPress}
              style={styles.button}
              // textStyle={styles.text}
              title={t('profile.e3')}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#00000065',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  input: {
    width: resWidth(83),
    marginBottom: resWidth(6),
    alignSelf: 'center',
  },
  text: {
    fontSize: font15,
  },
  box: {
    backgroundColor: colors.bgWhite,
    borderRadius: resWidth(7),
    width: resWidth(92),
    paddingVertical: scaleSize(30),
    marginBottom: scaleSize(15),
    overflow: 'hidden',
  },
  upperView: {
    width: resWidth(95),
    backgroundColor: colors.bgColor,
    paddingVertical: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: scaleSize(25),
    height: scaleSize(25),
  },
  title: {
    marginRight: resWidth(2),
    color: colors.textBlack,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textBlack41,
    textAlign: 'center',
    marginVertical: scaleSize(10),
    lineHeight: resWidth(4.5),
    alignSelf: 'center',
    maxWidth: resWidth(60),
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    width: resWidth(40),
  },
});
