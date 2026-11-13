import { View, Modal, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import {
  font13,
  font15,
  font16,
} from '../../utils/fontSizes';
import { FontBold, FontRegular } from '../../utils/fontFamily';
import { t } from '../../language/t';

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
      tranformY.setValue(resHeight(100));
    }
  }, [show]);

  const close = () => {
    Animated.timing(tranformY, {
      toValue: resHeight(100),
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShow(false));
  };

  const getTitle = () => {
    const val = t('profile.e');
    return val === 'profile.e' ? 'Logout' : val;
  };

  const getSubtitle = () => {
    const val = t('profile.e1');
    return val === 'profile.e1' ? 'Are you sure you want to log out?' : val;
  };

  const getCancelText = () => {
    const val = t('profile.e2');
    return val === 'profile.e2' ? 'Cancel' : val;
  };

  const getLogoutText = () => {
    const val = t('profile.e3');
    return val === 'profile.e3' ? 'Logout' : val;
  };

  return (
    <Modal
      transparent
      visible={show}
      animationType="fade"
      onRequestClose={close}>
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.main}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.box, { transform: [{ translateY: tranformY }] }]}>
              <CustomText style={styles.title}>{getTitle()}</CustomText>
              <CustomText style={styles.subtitle}>
                {getSubtitle()}
              </CustomText>
              <View style={styles.buttonView}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={close}
                  style={[styles.button, styles.cancelButton]}
                >
                  <CustomText style={styles.cancelText}>{getCancelText()}</CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    close();
                    if (onPress) {
                      onPress();
                    }
                  }}
                  style={[styles.button, styles.logoutButton]}
                >
                  <CustomText style={styles.logoutText}>{getLogoutText()}</CustomText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  box: {
    backgroundColor: colors.bgWhite,
    borderRadius: resWidth(7),
    width: resWidth(92),
    paddingVertical: scaleSize(30),
    paddingHorizontal: resWidth(4),
    marginBottom: scaleSize(20),
    overflow: 'hidden',
  },
  title: {
    color: colors.textBlack,
    textAlign: 'center',
    fontSize: font16,
    fontFamily: FontBold,
  },
  subtitle: {
    color: colors.textBlack41,
    textAlign: 'center',
    marginVertical: scaleSize(12),
    lineHeight: resWidth(4.5),
    alignSelf: 'center',
    maxWidth: resWidth(70),
    fontSize: font13,
    fontFamily: FontRegular,
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scaleSize(10),
  },
  button: {
    width: resWidth(40),
    height: scaleSize(46),
    borderRadius: resAvarage(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.bgColor,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: font15,
    fontFamily: FontBold,
    color: colors.textBlack,
  },
  logoutButton: {
    backgroundColor: colors.black,
  },
  logoutText: {
    fontSize: font15,
    fontFamily: FontBold,
    color: colors.white,
  },
});
