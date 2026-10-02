import { Animated, StyleSheet, View } from "react-native"
import CustomImage from "../../ui/components/CustomImage"
import { assets } from "../../utils/AppImages"
import { resAvarage, resHeight, resWidth } from "../../utils/responsive"
import { useEffect, useRef } from "react"
import { navigate, resetAndNavigate } from "../../navigation/NavigationUtils"
import { useAppDispatch } from "../../utils/hooks"
import { setHasLaunched, setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from "../../storage/redux/silce/AuthSlice"
import LinearGradient from "react-native-linear-gradient"
import { colors } from "../../utils/colors"
import { BlurView } from '@sbaiahmed1/react-native-blur';
import AsyncStorageUtils from "../../utils/storage"
import { loginOneSignalUser } from "../../services/oneSignalService"
import { syncNotifications } from "../../services/localNotificationService"
import { switchUserDatabase } from "../../storage/local/sqlite"

export const Splash = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-resWidth(100))).current;
    const dispatch = useAppDispatch();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 5, // controls the bounce/overshoot (lower = more bounce)
                tension: 70,  // controls speed/stiffness
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await AsyncStorageUtils.getItem('user_session');
                dispatch(setHasLaunched(true));

                if (session && session.username) {
                    console.log('[Splash] Restoring user session:', session.username);
                    // Switch to user DB
                    switchUserDatabase(session.username);

                    // Hydrate Redux state
                    dispatch(setCurrentUser(session.username));
                    dispatch(setCurrentProfileName(session.displayName || session.username));
                    dispatch(setCurrentProfileImage(session.profileImage || null));

                    // OneSignal and local notifications sync
                    loginOneSignalUser(session.username);
                    syncNotifications();

                    // Navigate directly to app
                    resetAndNavigate("BottomTab");
                } else {
                    console.log('[Splash] No active session, redirecting to Login');
                    resetAndNavigate("Login");
                }
            } catch (e) {
                console.error('[Splash] Session restoration error:', e);
                resetAndNavigate("Login");
            }
        };

        const timer = setTimeout(() => {
            checkSession();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.main, { opacity: fadeAnim, }]} >
            <LinearGradient colors={[colors.theme30, colors.white, colors.white]} style={{ ...StyleSheet.absoluteFill, ...styles.main }} >
                <BlurView
                    blurType="light"
                    blurAmount={0}
                    style={[styles.main, { zIndex: 95 }]}
                />
                <View style={styles.ring1} />
                <View style={styles.ring2} />
                <Animated.View style={[styles.imageContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <CustomImage style={styles.image} source={assets.dollar} />
                </Animated.View>
            </LinearGradient>
            {/* <CustomImage source={assets.logo} resizeMode='contain' style={styles.logo} /> */}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    ring1: {
        width: resWidth(65),
        height: resWidth(65),
        borderRadius: resAvarage(10),
        position: "absolute",
        backgroundColor: colors.theme20,
        zIndex: 80
    },
    ring2: {
        width: resWidth(55),
        height: resWidth(55),
        borderRadius: resAvarage(8),
        position: "absolute",
        backgroundColor: colors.theme40,
        zIndex: 90
    },
    imageContainer: {
        width: resWidth(50),
        height: resWidth(50),
        position: "absolute",
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: resAvarage(8),
        elevation: 5,
    },
    main: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bg: {
        width: resWidth(100),
        height: resHeight(100),
        position: "absolute",
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.45,
    },
    logo: {
        width: resAvarage(35),
        height: resAvarage(35),
    },
})