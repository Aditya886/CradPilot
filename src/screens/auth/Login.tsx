import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import React, { useState, useEffect } from "react"
import { useRoute } from "@react-navigation/native"
import { navigate } from "../../navigation/NavigationUtils"
import CustomButton from "../../ui/components/CustomButton"
import CustomText from "../../ui/components/CustomText"
import { colors } from "../../utils/colors"
import { FontRegular, FontMedium, FontBoldR } from "../../utils/fontFamily"
import { font12, font14, font15, font32 } from "../../utils/fontSizes"
import { resAvarage, resWidth } from "../../utils/responsive"
import CustomInput from "../../ui/components/CustomInput"
import { useAppDispatch } from "../../utils/hooks"
import { setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from "../../storage/redux/silce/AuthSlice"
import LinearGradient from "react-native-linear-gradient"
import User from "../../assets/images/icons/user.svg"
import Lock from "../../assets/images/icons/password.svg"
import Log from "../../assets/images/icons/login.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, switchUserDatabase } from "../../storage/local/sqlite"
import AsyncStorageUtils from "../../utils/storage"
import { loginOneSignalUser } from "../../services/oneSignalService"
import { syncNotifications } from "../../services/localNotificationService"

export const Login = () => {
    const dispatch = useAppDispatch()
    const route = useRoute<any>()
    const { flow } = route.params || {}
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if (flow) {
            setName(flow);
        }
    }, [flow]);

    const handleLogin = async () => {
        if (!name.trim()) {
            ShowToast("Please enter your name", "error");
            return;
        }
        if (!password) {
            ShowToast("Please enter your password", "error");
            return;
        }

        try {
            const user = masterQuery("SELECT * FROM users WHERE username = ? LIMIT 1", [name.trim().toLowerCase()]);
            if (!user || user.length === 0) {
                ShowToast("User not found", "error");
                return;
            }

            if (user[0].password !== password) {
                ShowToast("Incorrect password", "error");
                return;
            }

            // Switch to user database
            switchUserDatabase(name.trim().toLowerCase());

            const userSession = {
                username: name.trim().toLowerCase(),
                displayName: user[0].display_name || user[0].username,
                profileImage: user[0].profile_image || null
            };

            // Save session to local storage
            await AsyncStorageUtils.setItem('user_session', userSession);

            // Save user in redux
            dispatch(setCurrentUser(userSession.username));
            dispatch(setCurrentProfileName(userSession.displayName));
            dispatch(setCurrentProfileImage(userSession.profileImage));

            // Sync services
            loginOneSignalUser(userSession.username);
            syncNotifications();

            ShowToast("Logged in successfully", "success");
            navigate("BottomTab");
        } catch (e) {
            console.error("Login error:", e);
            ShowToast("Failed to log in", "error");
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
                                Welcome back
                            </CustomText>
                            <View style={{ gap: resAvarage(1), marginBottom: resAvarage(3) }} >
                                <CustomText style={styles.title} >Your money, made calm.</CustomText>
                                <CustomText style={styles.subtitle} >Sign in to continue your reflection.</CustomText>
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
                            </View>
                            <TouchableOpacity onPress={() => navigate("ForgotPassword")} activeOpacity={0.7}>
                                <CustomText style={styles.for} >{"Forgot password?"}</CustomText>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <CustomButton onPress={handleLogin} style={{ marginBottom: resAvarage(3) }} title={"Sign in"} Sufix={Log} />
                            <CustomText style={styles.account} >
                                {"Don't have an account?" + "  "}
                                <CustomText onPress={() => navigate("Signup")} style={[styles.account, styles.highlight]}>
                                    {"Sign up"}
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
        letterSpacing: resAvarage(0.2),
        fontFamily: FontMedium,
    },
    for: {
        fontSize: font15,
        color: colors.black,
        textAlign: 'left',
        fontFamily: FontRegular,
        marginTop: resAvarage(1.5),
        textDecorationLine: 'underline'
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
})