import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from "react-native"
import React, { useState, useEffect, useRef } from "react"
import { navigate } from "../../navigation/NavigationUtils"
import CustomButton from "../../ui/components/CustomButton"
import CustomText from "../../ui/components/CustomText"
import { colors } from "../../utils/colors"
import { FontRegular, FontMedium, FontSemiBold, FontBold, FontBoldR } from "../../utils/fontFamily"
import { font10, font11, font12, font13, font14, font15, font16, font18, font24, font32 } from "../../utils/fontSizes"
import { resAvarage, resWidth, scaleSize } from "../../utils/responsive"
import CustomInput from "../../ui/components/CustomInput"
import { useAppDispatch } from "../../utils/hooks"
import { setCurrentUser, setCurrentUserEmail, setCurrentProfileName, setCurrentProfileImage, setAppPurpose, setIsPremium, AppPurpose } from "../../storage/redux/silce/AuthSlice"
import { subscriptionService } from "../../services/subscriptionService"
import { useSendSignupOtpMutation, useVerifySignupMutation, extractApiErrorMessage } from "../../API"
import Down from "../../assets/images/icons/down.svg"
import Check from "../../assets/images/icons/check.svg"
import LinearGradient from "react-native-linear-gradient"
import User from "../../assets/images/icons/user.svg"
import Lock from "../../assets/images/icons/password.svg"
import Log from "../../assets/images/icons/login.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, masterInsert, switchUserDatabase } from "../../storage/local/sqlite"
import AsyncStorageUtils from "../../utils/storage"
import { loginOneSignalUser } from "../../services/oneSignalService"
import Svg, { Path, Rect } from 'react-native-svg'

const MailIcon = (props: any) => (
    <Svg width={resAvarage(2.6)} height={resAvarage(2.6)} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={2} y={4} width={20} height={16} rx={2} />
        <Path d="M22 7l-10 7L2 7" />
    </Svg>
);

export const Signup = () => {
    const dispatch = useAppDispatch()
    const [step, setStep] = useState<1 | 2>(1)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [purpose, setPurpose] = useState<AppPurpose>('local')
    const [showPurposeDropdown, setShowPurposeDropdown] = useState(false)

    // OTP verification states
    const [otp, setOtp] = useState("")
    const [timer, setTimer] = useState(45)
    const otpInputRef = useRef<TextInput>(null)

    const [sendOtpApi, { isLoading: isSendingOtp }] = useSendSignupOtpMutation()
    const [verifySignupApi, { isLoading: isVerifyingSignup }] = useVerifySignupMutation()

    const purposeOptions: { id: AppPurpose; title: string; subtitle: string; badge: string }[] = [
        {
            id: 'local',
            title: 'Local / Personal Use',
            subtitle: 'Personal debts, lending, borrowing & ledger',
            badge: 'Debts on Home',
        },
        {
            id: 'tution',
            title: 'Tuition Center',
            subtitle: 'Students, batches, attendance & tuition fees',
            badge: 'Tuition on Home',
        },
        {
            id: 'finance',
            title: 'Finance & Loans',
            subtitle: 'Borrowers, moneylending, interest & payments',
            badge: 'Finance on Home',
        },
    ];

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

    const handleSendOtp = async () => {
        if (!name.trim()) {
            ShowToast("Please enter your name", "error");
            return;
        }
        if (!email.trim() || !validateEmail(email)) {
            ShowToast("Please enter a valid email address", "error");
            return;
        }
        if (password.length < 6) {
            ShowToast("Password must be at least 6 characters", "error");
            return;
        }
        if (password !== confirmPassword) {
            ShowToast("Passwords do not match", "error");
            return;
        }

        const cleanEmail = email.trim().toLowerCase();

        // 1. Check local SQLite duplicate
        const existing = masterQuery("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [cleanEmail, cleanEmail]);
        if (existing && existing.length > 0) {
            ShowToast("An account with this email already exists", "error");
            return;
        }

        try {
            // Send OTP via Backend API
            const res: any = await sendOtpApi({
                email: cleanEmail,
                password,
                fullName: name.trim(),
                appPurpose: purpose,
            });

            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                setOtp("");
                setStep(2);
                setTimer(45);
                ShowToast(res?.data?.message || `Verification code sent to ${cleanEmail}`, "success");

                setTimeout(() => {
                    otpInputRef.current?.focus();
                }, 300);
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || "Failed to send verification code", "error");
                return;
            }
        } catch (e) {
            console.error("OTP send error:", e);
            ShowToast("Failed to initiate verification", "error");
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;
        const cleanEmail = email.trim().toLowerCase();
        try {
            const res: any = await sendOtpApi({
                email: cleanEmail,
                password,
                fullName: name.trim(),
                appPurpose: purpose,
            });

            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                ShowToast(res?.data?.message || `New verification code sent to ${cleanEmail}`, "success");
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

    const handleVerifyAndCreateAccount = async () => {
        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6) {
            ShowToast("Please enter the 6-digit verification code", "error");
            return;
        }

        const cleanEmail = email.trim().toLowerCase();
        let token: string | null = null;
        let createdUser: any = null;

        // Try backend verification
        const res: any = await verifySignupApi({
            email: cleanEmail,
            otp: cleanOtp,
        });

        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            token = res.data?.data?.token || res.data?.token;
            createdUser = res.data?.data?.user || res.data?.user;
            if (token) {
                await AsyncStorageUtils.setItem('token', token);
            }
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || "Invalid verification code. Please check and try again.", "error");
            return;
        }

        try {
            const rawPrefix = cleanEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || `user_${Date.now()}`;
            let finalUsername = createdUser?.id || rawPrefix;

            // Ensure username uniqueness locally
            const checkU = masterQuery("SELECT id FROM users WHERE username = ?", [finalUsername]);
            if (checkU && checkU.length > 0) {
                finalUsername = `${rawPrefix}_${Math.floor(Math.random() * 900) + 100}`;
            }

            // Insert new user into masterDb
            masterInsert("users", {
                username: finalUsername,
                email: cleanEmail,
                password: password,
                display_name: name.trim(),
                app_purpose: purpose,
                is_premium: 0,
                recovery_type: 'email',
                recovery_answer: cleanEmail,
            });

            // Initialize user database
            switchUserDatabase(finalUsername);

            const userSession = {
                username: finalUsername,
                email: cleanEmail,
                displayName: name.trim(),
                profileImage: null,
                appPurpose: purpose,
                isPremium: false,
                token: token,
            };

            // Save session to storage
            await AsyncStorageUtils.setItem('user_session', userSession);

            // Hydrate Redux store
            dispatch(setCurrentUser(userSession.username));
            dispatch(setCurrentUserEmail(userSession.email));
            dispatch(setCurrentProfileName(userSession.displayName));
            dispatch(setCurrentProfileImage(userSession.profileImage));
            dispatch(setAppPurpose(purpose));
            dispatch(setIsPremium(false));
            subscriptionService.init(false, purpose);

            // Identify user in OneSignal
            loginOneSignalUser(userSession.username, userSession.email);

            ShowToast("Account verified and created successfully!", "success");
            navigate("BottomTab");
        } catch (e) {
            console.error("Account creation error:", e);
            ShowToast(extractApiErrorMessage(e, "Failed to create account"), "error");
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
                            /* STEP 1: REGISTRATION DETAILS */
                            <View style={{ gap: resAvarage(2) }}>
                                <View style={{ gap: resAvarage(1), marginBottom: resAvarage(2) }}>
                                    <CustomText style={styles.heading}>
                                        Begin gently
                                    </CustomText>
                                    <CustomText style={styles.title}>Create your account.</CustomText>
                                    <CustomText style={styles.subtitle}>Sign up with your email to begin your reflection.</CustomText>
                                </View>

                                <View style={{ gap: resAvarage(0) }}>
                                    <CustomInput
                                        label={"Full Name"}
                                        Prefix={User}
                                        placeholder={"Your full name"}
                                        value={name}
                                        onChangeText={setName}
                                    />

                                    <CustomInput
                                        label={"Email Address"}
                                        Prefix={MailIcon}
                                        placeholder={"name@example.com"}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    {/* Purpose Selection Dropdown */}
                                    <View style={styles.purposeWrapper}>
                                        <CustomText style={styles.purposeLabel}>App Purpose</CustomText>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => setShowPurposeDropdown(prev => !prev)}
                                            style={[styles.purposeTrigger, showPurposeDropdown && styles.purposeTriggerActive]}
                                        >
                                            <View style={styles.purposeTriggerContent}>
                                                <View style={styles.purposeTag}>
                                                    <CustomText style={styles.purposeTagText}>
                                                        {purposeOptions.find(p => p.id === purpose)?.badge || 'Mode'}
                                                    </CustomText>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <CustomText style={styles.purposeTitle}>
                                                        {purposeOptions.find(p => p.id === purpose)?.title}
                                                    </CustomText>
                                                    <CustomText style={styles.purposeSubtitle} numberOfLines={1}>
                                                        {purposeOptions.find(p => p.id === purpose)?.subtitle}
                                                    </CustomText>
                                                </View>
                                            </View>
                                            <View style={[styles.dropdownArrow, showPurposeDropdown && styles.dropdownArrowOpen]}>
                                                <Down width={resAvarage(2.5)} height={resAvarage(2.5)} />
                                            </View>
                                        </TouchableOpacity>

                                        {showPurposeDropdown && (
                                            <View style={styles.purposeMenu}>
                                                {purposeOptions.map(option => {
                                                    const isSelected = purpose === option.id;
                                                    return (
                                                        <TouchableOpacity
                                                            key={option.id}
                                                            activeOpacity={0.75}
                                                            onPress={() => {
                                                                setPurpose(option.id);
                                                                setShowPurposeDropdown(false);
                                                            }}
                                                            style={[
                                                                styles.purposeMenuItem,
                                                                isSelected && styles.purposeMenuItemSelected,
                                                            ]}
                                                        >
                                                            <View style={styles.purposeMenuRow}>
                                                                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                                                                    {isSelected && <View style={styles.radioDot} />}
                                                                </View>
                                                                <View style={{ flex: 1 }}>
                                                                    <View style={styles.menuItemHeader}>
                                                                        <CustomText style={[styles.menuItemTitle, isSelected && styles.menuItemTitleActive]}>
                                                                            {option.title}
                                                                        </CustomText>
                                                                        <View style={[styles.menuBadge, isSelected && styles.menuBadgeActive]}>
                                                                            <CustomText style={[styles.menuBadgeText, isSelected && styles.menuBadgeTextActive]}>
                                                                                {option.badge}
                                                                            </CustomText>
                                                                        </View>
                                                                    </View>
                                                                    <CustomText style={styles.menuItemSubtitle}>
                                                                        {option.subtitle}
                                                                    </CustomText>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        )}
                                    </View>

                                    <CustomInput
                                        label={"Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"At least 6 characters"}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <CustomInput
                                        label={"Confirm Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"Re-enter password"}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>

                                <View style={{ marginTop: resAvarage(2) }}>
                                    <CustomButton
                                        loading={isSendingOtp}
                                        disabled={isSendingOtp}
                                        onPress={handleSendOtp}
                                        style={{ marginBottom: resAvarage(3) }}
                                        title={"Continue to Verification"}
                                        Sufix={Log}
                                    />
                                    <CustomText style={styles.account}>
                                        {"Already have an account?" + "  "}
                                        <CustomText onPress={() => navigate("Login")} style={[styles.account, styles.highlight]}>
                                            {"Sign in"}
                                        </CustomText>
                                    </CustomText>
                                </View>
                            </View>
                        ) : (
                            /* STEP 2: OTP VERIFICATION */
                            <View style={{ gap: resAvarage(2.5) }}>
                                <View style={{ gap: resAvarage(1), marginBottom: resAvarage(1) }}>
                                    <TouchableOpacity onPress={() => setStep(1)} style={styles.backRow} activeOpacity={0.7}>
                                        <CustomText style={styles.backText}>← Edit Information</CustomText>
                                    </TouchableOpacity>
                                    <CustomText style={styles.heading}>
                                        Security Check
                                    </CustomText>
                                    <CustomText style={styles.title}>Verify your email.</CustomText>
                                    <CustomText style={styles.subtitle}>
                                        Enter the 6-digit code sent to:
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
                                        loading={isVerifyingSignup}
                                        disabled={isVerifyingSignup}
                                        onPress={handleVerifyAndCreateAccount}
                                        style={{ marginBottom: resAvarage(3) }}
                                        title={"Verify & Create Account"}
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
};

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
    // Purpose selection styles
    purposeWrapper: {
        marginVertical: resAvarage(1),
        width: resWidth(94),
        alignSelf: 'center',
    },
    purposeLabel: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black,
        marginBottom: resAvarage(0.8),
    },
    purposeTrigger: {
        backgroundColor: colors.white,
        borderRadius: scaleSize(12),
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(1.8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    purposeTriggerActive: {
        borderColor: colors.theme,
    },
    purposeTriggerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
        flex: 1,
    },
    purposeTag: {
        backgroundColor: colors.theme,
        paddingHorizontal: resAvarage(1.8),
        paddingVertical: resAvarage(0.5),
        borderRadius: resAvarage(100),
    },
    purposeTagText: {
        fontSize: font10,
        fontFamily: FontBold,
        color: colors.black,
    },
    purposeTitle: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
    purposeSubtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.3),
    },
    dropdownArrow: {
        marginLeft: resAvarage(2),
    },
    dropdownArrowOpen: {
        transform: [{ rotate: '180deg' }],
    },
    purposeMenu: {
        backgroundColor: colors.white,
        borderRadius: scaleSize(12),
        marginTop: resAvarage(1),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.1)',
        paddingVertical: resAvarage(1),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    purposeMenuItem: {
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(1.8),
    },
    purposeMenuItemSelected: {
        backgroundColor: 'rgba(205, 250, 39, 0.12)',
    },
    purposeMenuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
    },
    radioCircle: {
        width: resAvarage(3),
        height: resAvarage(3),
        borderRadius: resAvarage(100),
        borderWidth: 1.5,
        borderColor: colors.black40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: colors.black,
    },
    radioDot: {
        width: resAvarage(1.6),
        height: resAvarage(1.6),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
    },
    menuItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuItemTitle: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    menuItemTitleActive: {
        fontFamily: FontBold,
    },
    menuItemSubtitle: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.2),
    },
    menuBadge: {
        backgroundColor: 'rgba(20, 20, 20, 0.06)',
        paddingHorizontal: resAvarage(1.5),
        paddingVertical: resAvarage(0.3),
        borderRadius: resAvarage(100),
    },
    menuBadgeActive: {
        backgroundColor: colors.theme,
    },
    menuBadgeText: {
        fontSize: font10,
        fontFamily: FontMedium,
        color: colors.black70,
    },
    menuBadgeTextActive: {
        fontFamily: FontBold,
        color: colors.black,
    },
});