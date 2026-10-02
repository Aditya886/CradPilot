import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import { font15, font18 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../utils/responsive';

const CloseIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

export interface AddPersonsModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onAddPerson?: (name: string) => void;
}

export default function AddPersonsModal({
    show,
    setShow,
    onAddPerson,
}: AddPersonsModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(50))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [name, setName] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (show) {
            setName('');
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(transformY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [show]);

    const close = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(transformY, {
                toValue: resHeight(50),
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => setShow(false));
    };

    const handleAdd = () => {
        if (!name.trim()) return;

        onAddPerson?.(name.trim());
        close();
    };

    const isSubmitDisabled = !name.trim();

    return (
        <Modal
            transparent
            visible={show}
            animationType="none"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    transform: [{ translateY: transformY }],
                                },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <CustomText style={styles.headerTitle}>Add person</CustomText>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={close}
                                    style={styles.closeBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <CloseIcon color={colors.black} size={resAvarage(3.2)} />
                                </TouchableOpacity>
                            </View>

                            {/* Name Input */}
                            <View
                                style={[
                                    styles.inputContainer,
                                    isFocused && styles.inputFocused,
                                ]}
                            >
                                <TextInput
                                    style={styles.input}
                                    placeholder="Name"
                                    placeholderTextColor="#8E8E93"
                                    value={name}
                                    onChangeText={setName}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    allowFontScaling={false}
                                    autoFocus
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                activeOpacity={0.85}
                                onPress={handleAdd}
                                disabled={isSubmitDisabled}
                                style={[
                                    styles.submitBtn,
                                    isSubmitDisabled && styles.submitBtnDisabled,
                                ]}
                            >
                                <CustomText style={styles.submitBtnText}>Add</CustomText>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3),
    },
    card: {
        width: resWidth(92),
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(3),
    },
    headerTitle: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(0.5),
    },
    inputContainer: {
        backgroundColor: '#F7F8FA',
        borderRadius: resAvarage(3),
        borderWidth: 1.2,
        borderColor: 'transparent',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(7.5),
        justifyContent: 'center',
        marginBottom: resAvarage(3.5),
    },
    inputFocused: {
        borderColor: colors.black,
        backgroundColor: colors.white,
    },
    input: {
        fontSize: font15,
        fontFamily: FontRegular,
        color: colors.black,
        padding: 0,
    },
    submitBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        height: resAvarage(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: colors.white,
        fontSize: font15,
        fontFamily: FontMedium,
    },
});
