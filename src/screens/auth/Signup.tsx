import { ScrollView, StyleSheet, TouchableOpacity, View, Clipboard } from "react-native"
import React, { useState, useEffect } from "react"
import { navigate } from "../../navigation/NavigationUtils"
import ButtonSlider from "../../ui/components/ButtonSlider"
import CustomButton from "../../ui/components/CustomButton"
import CustomText from "../../ui/components/CustomText"
import { colors } from "../../utils/colors"
import { FontRegular, FontMedium, FontSemiBold, FontBold, FontBoldR } from "../../utils/fontFamily"
import { font12, font14, font15, font16, font32 } from "../../utils/fontSizes"
import { resAvarage, resWidth } from "../../utils/responsive"
import CustomInput from "../../ui/components/CustomInput"
import { useAppDispatch } from "../../utils/hooks"
import { setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from "../../storage/redux/silce/AuthSlice"
import LinearGradient from "react-native-linear-gradient"
import User from "../../assets/images/icons/user.svg"
import Lock from "../../assets/images/icons/password.svg"
import Log from "../../assets/images/icons/login.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, masterInsert, switchUserDatabase } from "../../storage/local/sqlite"
import AsyncStorageUtils from "../../utils/storage"
import { loginOneSignalUser } from "../../services/oneSignalService"
import { syncNotifications } from "../../services/localNotificationService"

const generateRecoveryCodes = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codes = [];
    for (let i = 0; i < 4; i++) {
        const len = Math.floor(Math.random() * 5) + 6; // Random length between 6 and 10
        let code = '';
        for (let j = 0; j < len; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        codes.push(code);
    }
    return codes;
};

export const Signup = () => {
    const dispatch = useAppDispatch()
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [recoveryType, setRecoveryType] = useState<'QA' | 'code'>('QA')
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

    useEffect(() => {
        if (recoveryType === 'code') {
            setRecoveryCodes(generateRecoveryCodes());
        }
    }, [recoveryType]);

    const handleSignup = async () => {
        if (!name.trim()) {
            ShowToast("Please enter your name", "error");
            return;
        }
        if (password.length < 4) {
            ShowToast("Password must be at least 4 characters", "error");
            return;
        }
        if (password !== confirmPassword) {
            ShowToast("Passwords do not match", "error");
            return;
        }
        if (recoveryType === 'QA') {
            if (!question.trim()) {
                ShowToast("Please enter a recovery question", "error");
                return;
            }
            if (!answer.trim()) {
                ShowToast("Please enter the recovery answer", "error");
                return;
            }
        }

        try {
            // Check if user already exists
            const existing = masterQuery("SELECT id FROM users WHERE username = ?", [name.trim().toLowerCase()]);
            if (existing && existing.length > 0) {
                ShowToast("Username already exists", "error");
                return;
            }

            // Insert new user
            masterInsert("users", {
                username: name.trim().toLowerCase(),
                password: password,
                recovery_type: recoveryType,
                recovery_question: recoveryType === 'QA' ? question.trim() : null,
                recovery_answer: recoveryType === 'QA' ? answer.trim().toLowerCase() : null,
                recovery_codes: recoveryType === 'code' ? recoveryCodes.join(',') : null,
                display_name: name.trim()
            });

            // Initialize user database
            switchUserDatabase(name.trim().toLowerCase());

            const userSession = {
                username: name.trim().toLowerCase(),
                displayName: name.trim(),
                profileImage: null
            };

            // Save session to local storage
            await AsyncStorageUtils.setItem('user_session', userSession);

            // Save user in redux store
            dispatch(setCurrentUser(userSession.username));
            dispatch(setCurrentProfileName(userSession.displayName));
            dispatch(setCurrentProfileImage(userSession.profileImage));

            // Sync services
            loginOneSignalUser(userSession.username);
            syncNotifications();

            ShowToast("Account created successfully", "success");
            navigate("BottomTab");
        } catch (e) {
            console.error("Signup error:", e);
            ShowToast("Failed to create account", "error");
        }
    };

    return (
        <View style={styles.main} >
            <LinearGradient colors={[colors.theme40, colors.bgColor, colors.bgColor]} style={styles.main} >
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
                        <View style={{ gap: resAvarage(2) }}>
                            <View style={{ gap: resAvarage(1), marginBottom: resAvarage(3) }} >
                                <CustomText style={styles.heading} >
                                    Begin gently
                                </CustomText>
                                <CustomText style={styles.title} >A quieter way with money.</CustomText>
                                <CustomText style={styles.subtitle} >Create your private space. Everything stays on this device.</CustomText>
                            </View>
                            <View style={{ gap: resAvarage(0) }}>
                                <CustomInput
                                    label={"Name"}
                                    Prefix={User}
                                    placeholder={"Your name"}
                                    value={name}
                                    onChangeText={setName}
                                />
                                <CustomInput
                                    label={"Password"}
                                    Prefix={Lock}
                                    secure
                                    placeholder={"Your Password"}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <CustomInput
                                    label={"Confirm Password"}
                                    Prefix={Lock}
                                    secure
                                    placeholder={"Confirm Password"}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />

                                <View style={{ marginTop: resAvarage(2), marginBottom: resAvarage(2) }}>
                                    <ButtonSlider
                                        label="Recovery Method"
                                        options={['Question & Answer', 'Recovery Codes']}
                                        value={recoveryType === 'QA' ? 'Question & Answer' : 'Recovery Codes'}
                                        onSelect={(val) => setRecoveryType(val === 'Question & Answer' ? 'QA' : 'code')}
                                        sliderWidth={resWidth(93)}
                                    />
                                </View>

                                {recoveryType === 'QA' ? (
                                    <View style={{ gap: resAvarage(0) }}>
                                        <CustomInput
                                            label={"Security Question"}
                                            placeholder={"e.g., What is your pet's name?"}
                                            value={question}
                                            onChangeText={setQuestion}
                                        />
                                        <CustomInput
                                            label={"Answer"}
                                            placeholder={"Your answer"}
                                            value={answer}
                                            onChangeText={setAnswer}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.codesBox}>
                                        <CustomText style={styles.warningText}>
                                            ⚠️ WARNING: Please copy, save, or take a screenshot of these recovery codes. They are required to recover your account if you forget your password.
                                        </CustomText>
                                        <View style={styles.codesList}>
                                            {recoveryCodes.map((code, index) => (
                                                <View key={index} style={styles.codeItem}>
                                                    <CustomText style={styles.codeText}>{code}</CustomText>
                                                </View>
                                            ))}
                                        </View>
                                        <TouchableOpacity
                                            style={styles.copyAllBtn}
                                            activeOpacity={0.8}
                                            onPress={() => {
                                                Clipboard.setString(recoveryCodes.join('\n'));
                                                ShowToast("Recovery codes copied to clipboard!", "success");
                                            }}
                                        >
                                            <CustomText style={styles.copyAllBtnText}>Copy All Codes</CustomText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View>
                            <CustomButton onPress={handleSignup} style={{ marginBottom: resAvarage(3) }} title={"Sign up"} Sufix={Log} />
                            <CustomText style={styles.account} >
                                {"Already have an account?" + "  "}
                                <CustomText onPress={() => navigate("Login")} style={[styles.account, styles.highlight]}>
                                    {"Sign in"}
                                </CustomText>
                            </CustomText>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
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
        width: resWidth(80),
        fontFamily: FontMedium,
    },
    highlight: {
        color: colors.black
    },
    account: {
        fontFamily: FontRegular,
        fontSize: font15,
        color: colors.black,
        textAlign: 'center',
    },
    heading: {
        fontFamily: FontMedium,
        fontSize: font12,
        textTransform: 'uppercase',
        lineHeight: font12 * 1.3,
        letterSpacing: resAvarage(0.5),
        color: colors.black,
        width: resWidth(90),
        textAlign: 'left'
    },
    main: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
        marginTop: resAvarage(2),
        marginBottom: resAvarage(1),
    },
    recoveryToggleRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.black20,
        borderRadius: resAvarage(20),
        overflow: 'hidden',
        marginBottom: resAvarage(2),
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: resAvarage(2.5),
        borderRadius: resAvarage(18),
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    toggleBtnActive: {
        backgroundColor: colors.black,
    },
    toggleBtnText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
    },
    toggleBtnTextActive: {
        color: colors.theme,
    },
    codesBox: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.black20,
        borderRadius: resAvarage(6),
        padding: resAvarage(3),
        marginTop: resAvarage(1),
        gap: resAvarage(2),
    },
    warningText: {
        fontSize: font12,
        fontFamily: FontBold,
        color: colors.textRed,
        lineHeight: font12 * 1.4,
    },
    codesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: resAvarage(1.5),
        justifyContent: 'space-between',
        marginVertical: resAvarage(1.5),
    },
    codeItem: {
        width: '47%',
        backgroundColor: colors.black,
        borderWidth: 1,
        borderColor: colors.black20,
        borderRadius: resAvarage(10),
        paddingVertical: resAvarage(2),
        alignItems: 'center',
    },
    codeText: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.theme,
        letterSpacing: 1,
    },
    copyAllBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(10),
        paddingVertical: resAvarage(2.5),
        alignItems: 'center',
    },
    copyAllBtnText: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        color: colors.white,
    },
})