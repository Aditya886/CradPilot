import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font12, font14, font16, font20 } from '../../utils/fontSizes';
import { resAvarage, resWidth } from '../../utils/responsive';
import { securityService } from '../../services/securityService';
import { showFlashMessage } from '../../utils/flashMessage';
import LockIcon from '../../assets/images/icons/password.svg';
import EyeIcon from '../../assets/images/icons/eye.svg';
import CloseEyeIcon from '../../assets/images/icons/closeEye.svg';

interface PasswordAuthModalProps {
    visible: boolean;
    onClose: () => void;
    onAuthorized: () => void;
    title?: string;
    actionType?: 'export' | 'import';
    sectionName?: string;
}

export default function PasswordAuthModal({
    visible,
    onClose,
    onAuthorized,
    title,
    actionType = 'export',
    sectionName,
}: PasswordAuthModalProps) {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async () => {
        if (!password.trim()) {
            setErrorMessage('Password is required');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const result = await securityService.verifyPassword(password);
            setLoading(false);

            if (result.success) {
                setPassword('');
                onAuthorized();
            } else {
                setErrorMessage(result.message || 'Incorrect password. Try again.');
                showFlashMessage(result.message || 'Incorrect password', 'error');
            }
        } catch (e: any) {
            setLoading(false);
            setErrorMessage('Verification failed');
        }
    };

    const handleDismiss = () => {
        setPassword('');
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleDismiss}
        >
            <TouchableWithoutFeedback onPress={handleDismiss}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Header Icon */}
                            <View style={styles.iconCircle}>
                                <LockIcon width={resAvarage(4)} height={resAvarage(4)} />
                            </View>

                            {/* Badge */}
                            <View style={[styles.badge, actionType === 'import' ? styles.importBadge : styles.exportBadge]}>
                                <CustomText style={styles.badgeText}>
                                    {actionType === 'import' ? 'IMPORT AUTHORIZATION' : 'EXPORT AUTHORIZATION'}
                                </CustomText>
                            </View>

                            {/* Title & Description */}
                            <CustomText style={styles.title}>
                                {title || 'Security Verification'}
                            </CustomText>
                            <CustomText style={styles.description}>
                                {sectionName
                                    ? `Enter your account password to authorize ${actionType} for ${sectionName}.`
                                    : `Please enter your account password to authorize offline data ${actionType}.`}
                            </CustomText>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter account password"
                                    placeholderTextColor="#94A3B8"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={text => {
                                        setPassword(text);
                                        if (errorMessage) setErrorMessage('');
                                    }}
                                    autoFocus
                                    onSubmitEditing={handleVerify}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setShowPassword(prev => !prev)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? (
                                        <CloseEyeIcon width={resAvarage(3)} height={resAvarage(3)} />
                                    ) : (
                                        <EyeIcon width={resAvarage(3)} height={resAvarage(3)} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Error text */}
                            {errorMessage ? (
                                <CustomText style={styles.errorText}>{errorMessage}</CustomText>
                            ) : null}

                            {/* Buttons */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleDismiss}
                                    style={styles.cancelButton}
                                >
                                    <CustomText style={styles.cancelText}>Cancel</CustomText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleVerify}
                                    style={styles.confirmButton}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={colors.black} size="small" />
                                    ) : (
                                        <CustomText style={styles.confirmText}>Authorize</CustomText>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <CustomText style={styles.securityNote}>
                                🔒 Offline verification · Password stays on device
                            </CustomText>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3),
    },
    container: {
        width: resWidth(90),
        backgroundColor: colors.white,
        borderRadius: resAvarage(4),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(3.5),
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    iconCircle: {
        width: resAvarage(8),
        height: resAvarage(8),
        borderRadius: resAvarage(4),
        backgroundColor: colors.theme20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: resAvarage(1.5),
        borderWidth: 1,
        borderColor: colors.theme,
    },
    badge: {
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(0.5),
        borderRadius: resAvarage(10),
        marginBottom: resAvarage(1),
    },
    exportBadge: {
        backgroundColor: colors.theme20,
    },
    importBadge: {
        backgroundColor: '#E0F2FE',
    },
    badgeText: {
        fontSize: font12,
        fontFamily: FontBold,
        letterSpacing: resAvarage(0.1),
        color: colors.black,
    },
    title: {
        fontSize: font20,
        fontFamily: FontBold,
        color: colors.black,
        textAlign: 'center',
        marginBottom: resAvarage(0.5),
    },
    description: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        textAlign: 'center',
        lineHeight: font12 * 1.4,
        marginBottom: resAvarage(2.5),
        paddingHorizontal: resAvarage(1),
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: resAvarage(2),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: resAvarage(2),
        height: resAvarage(6),
        marginBottom: resAvarage(1),
    },
    textInput: {
        flex: 1,
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
        paddingVertical: 0,
    },
    eyeBtn: {
        padding: resAvarage(1),
    },
    errorText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.cancel,
        marginBottom: resAvarage(1.5),
        alignSelf: 'flex-start',
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: resAvarage(2),
        marginTop: resAvarage(2),
    },
    cancelButton: {
        flex: 1,
        height: resAvarage(6),
        borderRadius: resAvarage(2),
        borderWidth: 1,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    cancelText: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        color: colors.black70,
    },
    confirmButton: {
        flex: 1,
        height: resAvarage(6),
        borderRadius: resAvarage(2),
        backgroundColor: colors.theme,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmText: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.black,
    },
    securityNote: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black40,
        marginTop: resAvarage(2),
        textAlign: 'center',
    },
});
