import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from "react-native"
import React, { useState, useEffect, useRef } from "react"
import { useRoute } from "@react-navigation/native"
import { navigate, goBack } from "../../navigation/NavigationUtils"
import CustomButton from "../../ui/components/CustomButton"
import CustomText from "../../ui/components/CustomText"
import { colors } from "../../utils/colors"
import { FontRegular, FontMedium, FontSemiBold, FontBold, FontBoldR } from "../../utils/fontFamily"
import { font10, font11, font12, font13, font14, font15, font24, font32 } from "../../utils/fontSizes"
import { resAvarage, resWidth, scaleSize } from "../../utils/responsive"
import CustomInput from "../../ui/components/CustomInput"
import LinearGradient from "react-native-linear-gradient"
import Lock from "../../assets/images/icons/password.svg"
import Check from "../../assets/images/icons/check.svg"
import Log from "../../assets/images/icons/login.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, masterUpdate } from "../../storage/local/sqlite"
import { useSendForgotPasswordOtpMutation, useVerifyResetPasswordMutation, extractApiErrorMessage } from "../../API"
import Svg, { Path, Rect } from 'react-native-svg'

const MailIcon = (props: any) => (
    <Svg width={resAvarage(2.6)} height={resAvarage(2.6)} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={2} y={4} width={20} height={16} rx={2} />
        <Path d="M22 7l-10 7L2 7" />
    </Svg>
);

export default function ForgotPassword() {
    const route = useRoute<any>()
    const { prefilledEmail } = route.params || {}
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [email, setEmail] = useState("")
    const [userRecord, setUserRecord] = useState<any>(null)
    const [otp, setOtp] = useState("")
    const [timer, setTimer] = useState(45)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const otpInputRef = useRef<TextInput>(null)

    const [sendForgotOtpApi, { isLoading: isSendingForgotOtp }] = useSendForgotPasswordOtpMutation()
    const [verifyResetApi, { isLoading: isResettingPassword }] = useVerifyResetPasswordMutation()

    useEffect(() => {
        if (prefilledEmail) {
            setEmail(prefilledEmail);
        }
    }, [prefilledEmail]);

    useEffect(() => {
        let interval: any = null;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, timer]);

    const validateEmail = (val: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    };

    const handleSendResetCode = async () => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !validateEmail(cleanEmail)) {
            ShowToast("Please enter a valid registered email", "error");
            return;
        }

        try {
            // Attempt sending OTP via backend
            const res: any = await sendForgotOtpApi({ email: cleanEmail });
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                const user = masterQuery(
                    "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
                    [cleanEmail, cleanEmail]
                );

                if (user && user.length > 0) {
                    setUserRecord(user[0]);
                } else {
                    setUserRecord({ email: cleanEmail, username: cleanEmail });
                }

                setOtp("");
                setStep(2);
                setTimer(45);
                ShowToast(res?.data?.message || `Reset verification code sent to ${cleanEmail}`, "success");

                setTimeout(() => {
                    otpInputRef.current?.focus();
                }, 300);
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || "No account found with this email", "error");
                return;
            }
        } catch (e) {
            console.error("Forgot password lookup error:", e);
            ShowToast("Failed to initiate password reset", "error");
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        const cleanEmail = email.trim().toLowerCase();
        try {
            const res: any = await sendForgotOtpApi({ email: cleanEmail });
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                ShowToast(res?.data?.message || `New reset code sent to ${cleanEmail}`, "success");
                setTimer(45);
                setOtp("");
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || "Failed to resend code", "error");
            }
        } catch (e: any) {
            ShowToast(extractApiErrorMessage(e, "Failed to resend code"), "error");
        }
    };

    const handleVerifyOtp = () => {
        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6) {
            ShowToast("Please enter the 6-digit verification code", "error");
            return;
        }

        setStep(3);
    };

    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            ShowToast("Password must be at least 6 characters", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            ShowToast("Passwords do not match", "error");
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.trim();

        // Attempt backend reset
        const res: any = await verifyResetApi({
            email: cleanEmail,
            otp: cleanOtp,
            newPassword: newPassword,
        });

        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            try {
                if (userRecord?.id) {
                    masterUpdate("users", userRecord.id, {
                        password: newPassword,
                    });
                }
                ShowToast(res?.data?.message || "Password reset successfully! Please sign in.", "success");
                navigate("Login", { flow: cleanEmail });
            } catch (e) {
                console.error("Password reset update error:", e);
                ShowToast("Failed to reset password", "error");
            }
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || "Failed to reset password", "error");
            return;
        }
    };

    return (
        <View style={styles.main}>
            <LinearGradient colors={[colors.theme40, colors.bgColor, colors.bgColor]} style={styles.main}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: resAvarage(20),
                        paddingTop: resAvarage(10),
                        paddingHorizontal: resAvarage(2),
                        justifyContent: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets
                >
                    <View style={{ gap: resAvarage(3), justifyContent: "center", flex: 1 }}>
                        {step === 1 ? (
                            /* STEP 1: ENTER REGISTERED EMAIL */
                            <View style={{ gap: resAvarage(2) }}>
                                <View style={{ gap: resAvarage(1), marginBottom: resAvarage(2) }}>
                                    <TouchableOpacity onPress={() => goBack()} style={styles.backRow} activeOpacity={0.7}>
                                        <CustomText style={styles.backText}>← Back to Sign in</CustomText>
                                    </TouchableOpacity>
                                    <CustomText style={styles.heading}>Account Recovery</CustomText>
                                    <CustomText style={styles.title}>Forgot password?</CustomText>
                                    <CustomText style={styles.subtitle}>
                                        Enter your registered email address to receive an account recovery code.
                                    </CustomText>
                                </View>

                                <View style={{ gap: resAvarage(0) }}>
                                    <CustomInput
                                        label={"Registered Email"}
                                        Prefix={MailIcon}
                                        placeholder={"name@example.com"}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={{ marginTop: resAvarage(2) }}>
                                    <CustomButton
                                        loading={isSendingForgotOtp}
                                        disabled={isSendingForgotOtp}
                                        onPress={handleSendResetCode}
                                        style={{ marginBottom: resAvarage(3) }}
                                        title={"Send Reset Code"}
                                        Sufix={Log}
                                    />
                                    <CustomText style={styles.account}>
                                        {"Remembered your password?" + "  "}
                                        <CustomText onPress={() => navigate("Login")} style={[styles.account, styles.highlight]}>
                                            {"Sign in"}
                                        </CustomText>
                                    </CustomText>
                                </View>
                            </View>
                        ) : step === 2 ? (
                            /* STEP 2: VERIFY OTP */
                            <View style={{ gap: resAvarage(2.5) }}>
                                <View style={{ gap: resAvarage(1), marginBottom: resAvarage(1) }}>
                                    <TouchableOpacity onPress={() => setStep(1)} style={styles.backRow} activeOpacity={0.7}>
                                        <CustomText style={styles.backText}>← Change Email</CustomText>
                                    </TouchableOpacity>
                                    <CustomText style={styles.heading}>Verification</CustomText>
                                    <CustomText style={styles.title}>Enter reset code.</CustomText>
                                    <CustomText style={styles.subtitle}>
                                        We sent a 6-digit verification code to:
                                    </CustomText>
                                    <View style={styles.emailPill}>
                                        <CustomText style={styles.emailPillText}>{email.trim()}</CustomText>
                                    </View>
                                </View>

                                {/* 6-Digit OTP Box Grid */}
                                <View style={styles.otpSection}>
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        onPress={() => otpInputRef.current?.focus()}
                                        style={styles.otpBoxesRow}
                                    >
                                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                                            const digit = otp[idx] || '';
                                            const isFocusedBox = otp.length === idx;
                                            return (
                                                <View
                                                    key={idx}
                                                    style={[
                                                        styles.otpBox,
                                                        digit ? styles.otpBoxFilled : null,
                                                        isFocusedBox ? styles.otpBoxFocused : null,
                                                    ]}
                                                >
                                                    <CustomText style={styles.otpDigitText}>{digit}</CustomText>
                                                </View>
                                            );
                                        })}
                                    </TouchableOpacity>

                                    {/* Invisible real text input controlling the boxes */}
                                    <TextInput
                                        ref={otpInputRef}
                                        value={otp}
                                        onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        style={styles.hiddenOtpInput}
                                        autoFocus
                                    />
                                </View>

                                <View style={styles.resendRow}>
                                    <CustomText style={styles.resendText}>Didn't receive the code? </CustomText>
                                    <TouchableOpacity
                                        disabled={timer > 0}
                                        onPress={handleResendOtp}
                                        activeOpacity={0.7}
                                    >
                                        <CustomText style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
                                            {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                <View style={{ marginTop: resAvarage(2) }}>
                                    <CustomButton
                                        onPress={handleVerifyOtp}
                                        style={{ marginBottom: resAvarage(3) }}
                                        title={"Verify Code"}
                                        Sufix={Check}
                                    />
                                </View>
                            </View>
                        ) : (
                            /* STEP 3: CREATE NEW PASSWORD */
                            <View style={{ gap: resAvarage(2) }}>
                                <View style={{ gap: resAvarage(1), marginBottom: resAvarage(2) }}>
                                    <CustomText style={styles.heading}>Security Update</CustomText>
                                    <CustomText style={styles.title}>New password.</CustomText>
                                    <CustomText style={styles.subtitle}>
                                        Create a new secure password for your CredPilot account.
                                    </CustomText>
                                </View>

                                <View style={{ gap: resAvarage(0) }}>
                                    <CustomInput
                                        label={"New Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"At least 6 characters"}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <CustomInput
                                        label={"Confirm New Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"Re-enter new password"}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>

                                <View style={{ marginTop: resAvarage(2) }}>
                                    <CustomButton
                                        loading={isResettingPassword}
                                        disabled={isResettingPassword}
                                        onPress={handleResetPassword}
                                        style={{ marginBottom: resAvarage(3) }}
                                        title={"Reset Password"}
                                        Sufix={Check}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    title: {
        fontSize: font32,
        color: colors.black,
        textAlign: 'left',
        fontFamily: FontBoldR,
    },
    subtitle: {
        fontSize: font14,
        color: colors.black,
        textAlign: 'left',
        letterSpacing: resAvarage(0.1),
        width: resWidth(85),
        fontFamily: FontMedium,
    },
    heading: {
        fontFamily: FontMedium,
        fontSize: font12,
        textTransform: 'uppercase',
        lineHeight: font12 * 1.3,
        letterSpacing: resAvarage(0.5),
        color: colors.black,
        width: resWidth(90),
        textAlign: 'left',
    },
    account: {
        fontFamily: FontRegular,
        fontSize: font15,
        color: colors.black,
        textAlign: 'center',
    },
    highlight: {
        color: colors.black,
        fontFamily: FontBold,
        textDecorationLine: 'underline',
    },
    backRow: {
        paddingVertical: resAvarage(0.5),
        marginBottom: resAvarage(0.5),
    },
    backText: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        color: colors.black,
        textDecorationLine: 'underline',
    },
    emailPill: {
        backgroundColor: colors.theme20,
        alignSelf: 'flex-start',
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(0.6),
        borderRadius: scaleSize(10),
        borderWidth: 1,
        borderColor: colors.theme,
        marginTop: resAvarage(0.5),
    },
    emailPillText: {
        fontFamily: FontBold,
        fontSize: font14,
        color: colors.black,
    },
    otpSection: {
        alignItems: 'center',
        marginVertical: resAvarage(1),
    },
    otpBoxesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: resWidth(92),
    },
    otpBox: {
        width: resWidth(13),
        height: resWidth(14),
        borderRadius: scaleSize(10),
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    otpBoxFilled: {
        borderColor: colors.black,
        backgroundColor: '#F8FAF5',
    },
    otpBoxFocused: {
        borderColor: colors.theme,
        borderWidth: 2,
    },
    otpDigitText: {
        fontSize: font24,
        fontFamily: FontBold,
        color: colors.black,
    },
    hiddenOtpInput: {
        position: 'absolute',
        opacity: 0.01,
        width: '100%',
        height: '100%',
    },
    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(0.5),
    },
    resendText: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: colors.black60,
    },
    resendLink: {
        fontSize: font13,
        fontFamily: FontBold,
        color: colors.black,
        textDecorationLine: 'underline',
    },
    resendDisabled: {
        color: colors.black40,
        textDecorationLine: 'none',
    },
});