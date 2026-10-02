import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { colors } from '../../utils/colors';
import { FontMedium, FontRegular } from '../../utils/fontFamily';
import { font15, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import Verify from '../../assets/images/icons/verify.svg';
import CustomButton from '../components/CustomButton';
import Next from '../../assets/images/icons/whiteNext.svg';
import { navigate } from '../../navigation/NavigationUtils';

interface AvailabilityModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export default function AvailabilityModal({ show, setShow }: AvailabilityModalProps) {
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
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.box,
                                { transform: [{ translateY: transformY }] } as ViewStyle,
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <Verify width={resAvarage(8)} height={resAvarage(8)} />
                            </View>

                            <CustomText style={styles.infoTitle}>
                                {"Your Counsellor Account Has Been Approved!"}
                            </CustomText>
                            <CustomText style={styles.infoText}>
                                {"To start receiving session requests and appear in the platform, please complete the final setup of your profile"}
                            </CustomText>
                            <CustomButton
                                title={"Set Up Availability"}
                                Pre={Next}
                                onPress={() => {
                                    close();
                                    navigate('Availability');
                                }}
                            />
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
        backgroundColor: '#000000B0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(12),
        marginHorizontal: resAvarage(2),
        paddingTop: resAvarage(5),
        paddingBottom: resAvarage(8),
        paddingHorizontal: resAvarage(4.5),
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTitle: {
        fontFamily: FontMedium,
        fontSize: font18,
        lineHeight: font18 * 1.5,
        textAlign: 'center',
        marginBottom: resAvarage(3),
        maxWidth: resWidth(85),
    },
    infoText: {
        fontFamily: FontRegular,
        fontSize: font15,
        lineHeight: font15 * 1.7,
        textAlign: 'center',
        maxWidth: resWidth(80),
        marginBottom: resAvarage(4)
    },
});
