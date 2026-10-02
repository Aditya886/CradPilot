import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { font12, font14 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import Next from "../../../../assets/images/icons/next.svg"
import { colors } from '../../../../utils/colors'
import { navigate, resetAndNavigate } from '../../../../navigation/NavigationUtils'
import { ShowToast } from '../../../../utils/CustomToast/ToastManager'
import { useAppDispatch } from '../../../../utils/hooks'
import { setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from '../../../../storage/redux/silce/AuthSlice'
import AsyncStorageUtils from '../../../../utils/storage'
import { logoutOneSignalUser } from '../../../../services/oneSignalService'
import { cancelAllLocalNotifications } from '../../../../services/localNotificationService'

export default function MoreList({ data, title }: any) {
    const dispatch = useAppDispatch();
    const handlePress = async (item: any) => {
        if (item?.title === "Logout") {
            try {
                // Clear user session from storage
                await AsyncStorageUtils.removeItem('user_session');

                // Call OneSignal and local notifications logout/clear
                logoutOneSignalUser();
                await cancelAllLocalNotifications();

                // Clear Redux state
                dispatch(setCurrentUser(null));
                dispatch(setCurrentProfileName(null));
                dispatch(setCurrentProfileImage(null));

                resetAndNavigate("Login");
            } catch (e) {
                console.error('[MoreList] Error during logout:', e);
                resetAndNavigate("Login");
            }
            return;
        }
        if (item?.title === "Savings & Goals") {
            ShowToast("Coming Soon", "info");
            // navigate("SavingsAndGoals")
        }
        if (item?.title === "Home Banking") {
            ShowToast("Coming Soon", "info");
            // navigate("FinanceSection")
        }
        if (item?.title === "EMI & Loans") {
            ShowToast("Coming Soon", "info");
            // navigate("EmiAndLoans")
        }
        if (item?.title === "Plans & Trips") {
            navigate("PlanTrip")
        }
        if (item?.title === "Terms & conditions") {
            // navigate("TermsAndConditions")
        }
        if (item?.title === "Privacy Policy") {
            // navigate("PrivacyPolicy")
        }
        if (item?.title === "About CredPilot") {
            // navigate("AboutCredPilot")
        }
    }
    return (
        <View style={styles.main} >
            <CustomText style={styles.header} >{title}</CustomText>
            <FlatList
                data={data}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ gap: resAvarage(1.5), marginVertical: resAvarage(2), paddingHorizontal: resAvarage(3) }}
                renderItem={({ item }: any) => {
                    const Icon = item?.icon
                    return (
                        <TouchableOpacity onPress={() => handlePress(item)} style={styles.card} >
                            <View style={styles.row} >
                                <View style={[styles.icon, item?.title === "Logout" && { backgroundColor: colors.black }]} >
                                    <Icon width={resAvarage(4)} height={resAvarage(4)} />
                                </View>
                                <View>
                                    <CustomText style={styles.title} >{item?.title}</CustomText>
                                    {item?.subtitle && <CustomText style={styles.subtitle} >{item?.subtitle}</CustomText>}
                                </View>
                            </View>
                            <Next width={resAvarage(4)} height={resAvarage(4)} />
                        </TouchableOpacity>
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: resAvarage(2)
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(2),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    icon: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        padding: resAvarage(1.5),
        alignItems: "center",
        justifyContent: 'center'
    },
    header: {
        fontSize: font12,
        fontFamily: FontRegular,
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.2),
        paddingHorizontal: resAvarage(3)
    },
    title: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        letterSpacing: resAvarage(0.2)
    },
    subtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        letterSpacing: resWidth(0.05),
        width: resWidth(60)
    },
})