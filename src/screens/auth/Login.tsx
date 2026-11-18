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
import { setCurrentUser, setCurrentUserEmail, setCurrentProfileName, setCurrentProfileImage, setAppPurpose, setIsPremium } from "../../storage/redux/silce/AuthSlice"
import { subscriptionService } from "../../services/subscriptionService"
import { useLoginMutation, extractApiErrorMessage } from "../../API"
import LinearGradient from "react-native-linear-gradient"
import Lock from "../../assets/images/icons/password.svg"
import Log from "../../assets/images/icons/login.svg"
import { ShowToast } from "../../utils/CustomToast/ToastManager"
import { masterQuery, switchUserDatabase } from "../../storage/local/sqlite"
import AsyncStorageUtils from "../../utils/storage"
import { loginOneSignalUser } from "../../services/oneSignalService"
import Svg, { Path, Rect } from 'react-native-svg'

const MailIcon = (props: any) => (
    <Svg width={resAvarage(2.6)} height={resAvarage(2.6)} viewBox="0 0 24 24" fill="none" stroke={colors.black} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={2} y={4} width={20} height={16} rx={2} />
        <Path d="M22 7l-10 7L2 7" />
    </Svg>
);

export const Login = () => {
    const dispatch = useAppDispatch()
    const route = useRoute<any>()
    const { flow } = route.params || {}
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loginApi, { isLoading: isLoggingIn }] = useLoginMutation()

    useEffect(() => {
        if (flow) {
            setEmail(flow);
        }
    }, [flow]);

    const handleLogin = async () => {
        if (!email.trim()) {
            ShowToast("Please enter your email", "error");
            return;
        }
        if (!password) {
            ShowToast("Please enter your password", "error");
            return;
        }

        try {
            const cleanQuery = email.trim().toLowerCase();
            let token: string | null = null;
            let loggedUser: any = null;

            // Attempt backend API login
            const res: any = await loginApi({ email: cleanQuery, password });
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                token = res.data?.data?.token || res.data?.token;
                loggedUser = res.data?.data?.user || res.data?.user;
                if (token) {
                    await AsyncStorageUtils.setItem('token', token);
                }
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || "Invalid credentials", "error");
                return;
            }

            let username = loggedUser?.username || loggedUser?.id || cleanQuery;
            let displayName = loggedUser?.fullName || userRecordName(cleanQuery);
            let profileImage = loggedUser?.profileImage || null;
            let appPurpose = loggedUser?.appPurpose || 'local';
            let isPremium = Boolean(loggedUser?.isPremium);

            // If backend didn't return user, fallback to local SQLite
            if (!loggedUser) {
                const localUser = masterQuery(
                    "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
                    [cleanQuery, cleanQuery]
                );

                if (!localUser || localUser.length === 0) {
                    ShowToast("Account not found with this email", "error");
                    return;
                }

                if (localUser[0].password !== password) {
                    ShowToast("Incorrect password", "error");
                    return;
                }

                username = localUser[0].username || cleanQuery;
                displayName = localUser[0].display_name || localUser[0].username;
                profileImage = localUser[0].profile_image || null;
                appPurpose = localUser[0].app_purpose || 'local';
                isPremium = Boolean(localUser[0].is_premium);
            } else {
                // Keep local SQLite master cache in sync
                try {
                    const localExists = masterQuery("SELECT id FROM users WHERE LOWER(email) = ?", [cleanQuery]);
                    if (!localExists || localExists.length === 0) {
                        masterQuery(
                            "INSERT INTO users (username, email, password, display_name, app_purpose, is_premium) VALUES (?, ?, ?, ?, ?, ?)",
                            [username, cleanQuery, password, displayName, appPurpose, isPremium ? 1 : 0]
                        );
                    }
                } catch (e) {}
            }

            // Switch to user database
            switchUserDatabase(username);

            const userSession = {
                username: username,
                email: cleanQuery,
                displayName: displayName,
                profileImage: profileImage,
                appPurpose: appPurpose,
                isPremium: isPremium,
                token: token,
            };

            // Save session to local storage
            await AsyncStorageUtils.setItem('user_session', userSession);

            // Save user in redux
            dispatch(setCurrentUser(userSession.username));
            dispatch(setCurrentUserEmail(userSession.email));
            dispatch(setCurrentProfileName(userSession.displayName));
            dispatch(setCurrentProfileImage(userSession.profileImage));
            dispatch(setAppPurpose(userSession.appPurpose));
            dispatch(setIsPremium(userSession.isPremium));
            subscriptionService.init(userSession.isPremium, userSession.appPurpose);

            // Identify user with OneSignal
            loginOneSignalUser(userSession.username, userSession.email);

            ShowToast("Logged in successfully", "success");
            navigate("BottomTab");
        } catch (e) {
            console.error("Login error:", e);
            ShowToast(extractApiErrorMessage(e, "Failed to log in"), "error");
        }
    };

    function userRecordName(emailStr: string) {
        return emailStr.split('@')[0] || 'User';
    }

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
                                <CustomText style={styles.subtitle} >Sign in with your email to continue.</CustomText>
                            </View>
                            <View style={{ gap: resAvarage(0) }}>
                                <CustomInput
                                    label={"Email Address"}
                                    Prefix={MailIcon}
                                    placeholder={"name@example.com"}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
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
                            <TouchableOpacity onPress={() => navigate("ForgotPassword", { prefilledEmail: email.trim() })} activeOpacity={0.7}>
                                <CustomText style={styles.for} >{"Forgot password?"}</CustomText>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <CustomButton 
                                loading={isLoggingIn}
                                disabled={isLoggingIn}
                                onPress={handleLogin} 
                                style={{ marginBottom: resAvarage(3) }} 
                                title={"Sign in"} 
                                Sufix={Log} 
                            />
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