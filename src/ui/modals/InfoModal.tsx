import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { colors } from '../../utils/colors';
import { FontRegular } from '../../utils/fontFamily';
import { font15, font16 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import GraphIcon from '../../assets/images/icons/consistency.svg';

interface InfoModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function InfoModal({ show, setShow }: InfoModalProps) {
  const transformY = useRef(new Animated.Value(resHeight(100))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      // Fade in backdrop
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Slide up sheet
      Animated.timing(transformY, {
        duration: 350,
        useNativeDriver: true,
        toValue: 0,
      }).start();
    }
  }, [show]);

  const close = () => {
    // Fade out backdrop
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    // Slide down sheet
    Animated.timing(transformY, {
      toValue: resHeight(100),
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShow(false));
  };

  return (
    <Modal
      transparent
      visible={show}
      animationType="none"
      onRequestClose={close}
    >
      <TouchableWithoutFeedback onPress={close}>
        <Animated.View style={[styles.main, { opacity: fadeAnim }]}>
          {/* <TouchableWithoutFeedback> */}
          <Animated.View
            style={[
              styles.box,
              { transform: [{ translateY: transformY }] } as ViewStyle,
            ]}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <GraphIcon width={resAvarage(5)} height={resAvarage(5)} />
              </View>
            </View>

            <CustomText style={styles.infoText}>
              {"Scores are calculated based on time spent learning, journal activity, game performance & overall platform engagement."}
            </CustomText>
          </Animated.View>
          {/* </TouchableWithoutFeedback> */}
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#000000B0',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  box: {
    backgroundColor: colors.bgColor, // Sleek matching dark background color
    borderTopLeftRadius: resAvarage(4.5),
    borderTopRightRadius: resAvarage(4.5),
    width: resWidth(100),
    paddingTop: resAvarage(5),
    borderWidth: 1,
    borderColor: "#5D6071",
    borderBottomWidth: 0,
    borderLeftColor: "#5d607185",
    borderTopColor: "#5d607185",
    borderRightColor: "#5d607185",
    paddingBottom: resAvarage(8),
    paddingHorizontal: resAvarage(4.5),
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: resAvarage(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: resAvarage(10),
    height: resAvarage(10),
    borderRadius: resAvarage(100),
    backgroundColor: 'rgba(40, 199, 111, 0.15)', // Light green translucent background
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontFamily: FontRegular,
    fontSize: font16,
    lineHeight: font16 * 1.5,
    color: '#D1CFE2', // Elegant, high-readability off-white text color
    textAlign: 'center',
    maxWidth: resWidth(80),
  },
});
