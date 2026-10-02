import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { colors } from '../../utils/colors';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import {
    font15,
    font18,
} from '../../utils/fontSizes';
import Next from "../../assets/images/icons/whiteNext.svg"
import { FontMedium, FontRegular } from '../../utils/fontFamily';

export default function HomeWarningModal({ show, setShow, onPress }: any) {
      const tranformY = useRef(new Animated.Value(resHeight(100))).current;
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
            Animated.timing(tranformY, {
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
        Animated.timing(tranformY, {
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
                    <TouchableWithoutFeedback>
                        <Animated.View
                    style={[styles.box, { transform: [{ translateY: tranformY }] }]}>
                    <View style={{ gap: resAvarage(3) }} >
                        <CustomText style={styles.title}>{"Complete your first assessment to unlock your dashboard"}</CustomText>
                        <CustomText style={styles.subtitle}>{"It takes about 5 minutes. You’ll answer a set of questions to set your baseline and personalize your experience."}</CustomText>
                        <CustomText style={styles.subtitle}>
                            {"Once done, you’ll get access to your dashboard, insights, and tools tailored to you."}
                        </CustomText>
                    </View>
                    <View style={styles.buttonView}>
                        <CustomButton
                            onPress={onPress}
                            style={styles.button}
                            Pre={Next}
                            // textStyle={styles.text}
                            title={"Continue"}
                        />
                    </View>
                </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#00000095',
        justifyContent: 'center',
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
        marginHorizontal: resAvarage(3),
        backgroundColor: colors.bgColor,
        borderRadius: resWidth(3),
        paddingVertical: scaleSize(30),
        borderWidth:1,
        borderColor: colors.white20,
        gap: resAvarage(4),
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
        fontFamily: FontMedium,
        fontSize: font18,
        lineHeight: font18 * 1.8,
        color: colors.textWhite,
        textAlign: 'center',
    },
    subtitle: {
        color: colors.white90,
        textAlign: 'center',
        fontFamily: FontRegular,
        fontSize: font15,
        alignSelf: 'center',
        maxWidth: resWidth(80),
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


// import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
// import React, { useEffect, useRef } from 'react';
// import CustomText from '../components/CustomText';
// import { colors } from '../../utils/colors';
// import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
// import { font15 } from '../../utils/fontSizes';
// import { FontMedium, FontRegular } from '../../utils/fontFamily';
// import CustomButton from '../components/CustomButton';
// import Chat from '../../assets/images/icons/blueChat.svg'

// interface InfoModalProps {
//     show: boolean;
//     setShow: (show: boolean) => void;
// }

// export default function AddSessionModal({ show, setShow }: InfoModalProps) {
//     const tranformY = useRef(new Animated.Value(resHeight(100))).current;
//     const fadeAnim = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         if (show) {
//             // Fade in backdrop
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 300,
//                 useNativeDriver: true,
//             }).start();

//             // Slide up sheet
//             Animated.timing(transformY, {
//                 duration: 350,
//                 useNativeDriver: true,
//                 toValue: 0,
//             }).start();
//         }
//     }, [show]);

//     const close = () => {
//         // Fade out backdrop
//         Animated.timing(fadeAnim, {
//             toValue: 0,
//             duration: 250,
//             useNativeDriver: true,
//         }).start();

//         // Slide down sheet
//         Animated.timing(transformY, {
//             toValue: resHeight(100),
//             duration: 250,
//             useNativeDriver: true,
//         }).start(() => setShow(false));
//     };

//     return (
        
//     );
// }

// const styles = StyleSheet.create({
//     main: {
//         flex: 1,
//         backgroundColor: '#000000B0',
//         justifyContent: 'flex-end',
//         alignItems: 'center',
//     },
//     box: {
//         backgroundColor: colors.bgColor, // Sleek matching dark background color
//         borderTopLeftRadius: resAvarage(4.5),
//         borderTopRightRadius: resAvarage(4.5),
//         width: resWidth(100),
//         borderWidth: 1,
//         borderTopColor: colors.white30,
//         paddingTop: resAvarage(3),
//         paddingBottom: resAvarage(3),
//         paddingHorizontal: resAvarage(4.5),
//         // alignItems: 'center',
//     },
//     iconContainer: {
//         marginBottom: resAvarage(3),
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     iconBackground: {
//         width: resAvarage(10),
//         height: resAvarage(10),
//         borderRadius: resAvarage(100),
//         backgroundColor: 'rgba(40, 199, 111, 0.15)', // Light green translucent background
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     infoText: {
//         fontFamily: FontRegular,
//         fontSize: font15,
//         lineHeight: font15 * 1.5,
//         color: '#D1CFE2', // Elegant, high-readability off-white text color
//         textAlign: 'center',
//         maxWidth: resWidth(85),
//     },
// });
