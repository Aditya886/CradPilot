import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import React, { useState } from "react"
import { navigate, goBack } from "../../navigation/NavigationUtils"
import CustomButton from "../../ui/components/CustomButton"
import CustomText from "../../ui/components/CustomText"
import { colors } from "../../utils/colors"
import { FontRegular, FontMedium, FontBoldR } from "../../utils/fontFamily"
import { font12, font14, font15, font16, font32 } from "../../utils/fontSizes"
import { resAvarage, resWidth } from "../../utils/responsive"
import CustomInput from "../../ui/components/CustomInput"
import LinearGradient from "react-native-linear-gradient"
import User from "../../assets/images/icons/user.svg"
import Lock from "../../assets/images/icons/password.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, masterUpdate } from "../../storage/local/sqlite"

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [name, setName] = useState("")
    const [userRecord, setUserRecord] = useState<any>(null)
    const [answer, setAnswer] = useState("")
    const [recoveryCode, setRecoveryCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleCheckUser = () => {
        if (!name.trim()) {
            ShowToast("Please enter your name", "error");
            return;
        }

        try {
            const user = masterQuery("SELECT * FROM users WHERE username = ? LIMIT 1", [name.trim().toLowerCase()]);
            if (!user || user.length === 0) {
                ShowToast("User not found", "error");
                return;
            }
            setUserRecord(user[0]);
            setStep(2);
        } catch (e) {
            console.error("Forgot password user lookup error:", e);
            ShowToast("Failed to lookup user", "error");
        }
    };

    const handleVerify = () => {
        if (userRecord.recovery_type === 'QA') {
            if (!answer.trim()) {
                ShowToast("Please enter your answer", "error");
                return;
            }
            if (userRecord.recovery_answer && answer.trim().toLowerCase() === userRecord.recovery_answer.toLowerCase()) {
                setStep(3);
            } else {
                ShowToast("Incorrect answer", "error");
            }
        } else {
            if (!recoveryCode.trim()) {
                ShowToast("Please enter a recovery code", "error");
                return;
            }
            // Check if entered code is in comma-separated codes
            const savedCodes = (userRecord.recovery_codes || "").split(',');
            if (savedCodes.includes(recoveryCode.trim())) {
                setStep(3);
            } else {
                ShowToast("Incorrect recovery code", "error");
            }
        }
    };

    const handleResetPassword = () => {
        if (newPassword.length < 4) {
            ShowToast("Password must be at least 4 characters", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            ShowToast("Passwords do not match", "error");
            return;
        }

        try {
            masterUpdate("users", userRecord.id, {
                password: newPassword
            });
            ShowToast("Password reset successfully", "success");
            goBack();
        } catch (e) {
            console.error("Password reset update error:", e);
            ShowToast("Failed to reset password", "error");
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
                            <CustomText style={styles.heading} >
                                Account Recovery
                            </CustomText>
                            
                            {step === 1 && (
                                <>
                                    <View style={{ gap: resAvarage(1), marginBottom: resAvarage(3) }} >
                                        <CustomText style={styles.title} >Find your account.</CustomText>
                                        <CustomText style={styles.subtitle} >Enter the username associated with your account.</CustomText>
                                    </View>
                                    <CustomInput
                                        label={"Username"}
                                        Prefix={User}
                                        placeholder={"Your username"}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                    <CustomButton onPress={handleCheckUser} style={{ marginTop: resAvarage(3) }} title={"Next"} />
                                </>
                            )}

                            {step === 2 && userRecord && (
                                <>
                                    <View style={{ gap: resAvarage(1), marginBottom: resAvarage(3) }} >
                                        <CustomText style={styles.title} >Identity verification.</CustomText>
                                        <CustomText style={styles.subtitle}>
                                            {userRecord.recovery_type === 'QA' 
                                                ? "Answer your security question to continue." 
                                                : "Enter one of your 6-10 digit recovery codes."
                                            }
                                        </CustomText>
                                    </View>

                                    {userRecord.recovery_type === 'QA' ? (
                                        <View style={{ gap: resAvarage(0) }}>
                                            <CustomText style={styles.questionText}>
                                                {`Question: ${userRecord.recovery_question}`}
                                            </CustomText>
                                            <CustomInput
                                                label={"Your Answer"}
                                                placeholder={"Enter security answer"}
                                                value={answer}
                                                onChangeText={setAnswer}
                                            />
                                        </View>
                                    ) : (
                                        <CustomInput
                                            label={"Recovery Code"}
                                            placeholder={"Enter recovery code"}
                                            value={recoveryCode}
                                            onChangeText={setRecoveryCode}
                                        />
                                    )}
                                    <CustomButton onPress={handleVerify} style={{ marginTop: resAvarage(3) }} title={"Verify"} />
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <View style={{ gap: resAvarage(1), marginBottom: resAvarage(3) }} >
                                        <CustomText style={styles.title} >Reset password.</CustomText>
                                        <CustomText style={styles.subtitle} >Enter and confirm your new password below.</CustomText>
                                    </View>
                                    <CustomInput
                                        label={"New Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"New Password"}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <CustomInput
                                        label={"Confirm New Password"}
                                        Prefix={Lock}
                                        secure
                                        placeholder={"Confirm Password"}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                    <CustomButton onPress={handleResetPassword} style={{ marginTop: resAvarage(3) }} title={"Reset Password"} />
                                </>
                            )}

                            <TouchableOpacity onPress={() => goBack()} activeOpacity={0.7} style={{ alignSelf: 'center', marginTop: resAvarage(3) }}>
                                <CustomText style={styles.backToLogin}>Back to login</CustomText>
                            </TouchableOpacity>
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
        letterSpacing: resAvarage(0.2),
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
        textAlign: 'left'
    },
    main: {
        flex: 1,
    },
    questionText: {
        fontSize: font15,
        fontFamily: FontMedium,
        color: colors.black,
        marginBottom: resAvarage(1.5),
        paddingHorizontal: resAvarage(1),
    },
    backToLogin: {
        fontSize: font15,
        color: colors.black,
        textDecorationLine: 'underline',
        fontFamily: FontRegular,
    }
})
