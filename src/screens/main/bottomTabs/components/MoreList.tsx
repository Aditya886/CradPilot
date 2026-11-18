import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { font10, font11, font12, font14 } from '../../../../utils/fontSizes'
import { resAvarage, resWidth, scaleSize } from '../../../../utils/responsive'
import Next from "../../../../assets/images/icons/next.svg"
import { colors } from '../../../../utils/colors'
import { navigate, resetAndNavigate } from '../../../../navigation/NavigationUtils'
import { ShowToast } from '../../../../utils/CustomToast/ToastManager'
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks'
import { setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from '../../../../storage/redux/silce/AuthSlice'
import AsyncStorageUtils from '../../../../utils/storage'
import { logoutOneSignalUser } from '../../../../services/oneSignalService'
import { subscriptionService } from '../../../../services/subscriptionService'
import { checkForAppUpdates } from '../../../../services/inAppUpdateService'

export default function MoreList({ data, title, onLogoutPress, onSubscriptionPress }: any) {
    const dispatch = useAppDispatch();
    const currentPurpose = useAppSelector(state => state.app.purpose) || 'local';
    const isPremium = useAppSelector(state => state.app.isPremium) || false;

    const getPurposeName = (p: string) => {
        if (p === 'local') return 'Local Use';
        if (p === 'tution') return 'Tuition Center';
        if (p === 'finance') return 'Finance & Loans';
        return 'Local Use';
    };

    const handlePress = async (item: any) => {
        if (item?.title === "Logout") {
            if (onLogoutPress) {
                onLogoutPress();
                return;
            }
            try {
                await AsyncStorageUtils.removeItem('user_session');
                logoutOneSignalUser();
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

        if (item?.id === 'subscription' || item?.title === "Subscription") {
            if (onSubscriptionPress) {
                onSubscriptionPress();
            } else {
                subscriptionService.showUpgradeModal({ reason: 'manage' });
            }
            return;
        }

        const isMoreFeatures = title === 'More Features';
        const isSubscription = item?.id === 'subscription' || item?.title === 'Subscription';
        const isInsights = item?.id === 'insights' || item?.title === 'Insights';
        const belongsToCurrent = isSubscription || isInsights || (item?.purposes && item.purposes.includes(currentPurpose));
        const isItemLocked = isMoreFeatures && !isPremium && !belongsToCurrent;

        if (isItemLocked) {
            subscriptionService.showUpgradeModal({
                title: `${item.title} Locked`,
                subtitle: `Your account is set to ${getPurposeName(currentPurpose)}. On the Free plan, other modes are locked. Upgrade to CredPilot Pro to unlock all modes and switch anytime!`,
                reason: 'mode_locked',
            });
            return;
        }

        if (item?.id === 'insights' || item?.title === "Insights") {
            navigate("Insights");
        } else if (item?.title === "Savings & Goals") {
            navigate("SavingAndGoals");
        } else if (item?.title === "EMI & Loans") {
            navigate("EmiLoans");
        } else if (item?.title === "Plans & Trips") {
            navigate("PlanTrip");
        } else if (item?.title === "Tution" || item?.title === "Tuition Center") {
            navigate("TutionSection");
        } else if (item?.title === "Debts Ledger") {
            navigate("Debts");
        } else if (item?.title === "Finance & Loans") {
            navigate("FinanceSection");
        } else if (item?.title === "Terms & conditions") {
            navigate("WebViewScreen", {
                title: "Terms & Conditions",
                subtitle: "Agreement & Rules",
                url: "https://credpilot.vercel.app/#/terms",
            });
        } else if (item?.title === "Privacy Policy") {
            navigate("WebViewScreen", {
                title: "Privacy Policy",
                subtitle: "Legal & Data Policy",
                url: "https://credpilot.vercel.app/#/privacy",
            });
        } else if (item?.title === "About CredPilot") {
            checkForAppUpdates(true);
        }
    };

    const filteredData = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        if (title === 'More Features') {
            return data.filter((item: any) => {
                // 1. Remove Home banking
                if (item?.id === 'home_banking' || item?.title === 'Home Banking') {
                    return false;
                }

                // 2. Hide whichever section is active on the Home screen
                if (currentPurpose === 'local' && (item?.id === 'debts' || item?.purposeType === 'local')) {
                    return false;
                }
                if (currentPurpose === 'finance' && (item?.id === 'finance' || item?.purposeType === 'finance')) {
                    return false;
                }
                if (currentPurpose === 'tution' && (item?.id === 'tution' || item?.purposeType === 'tution')) {
                    return false;
                }

                // Show all other features (unlocked for active type, and locked PRO for other types)
                return true;
            });
        }

        return data;
    }, [data, title, currentPurpose]);

    return (
        <View style={styles.main}>
            <CustomText style={styles.header}>{title}</CustomText>
            <FlatList
                data={filteredData}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ gap: resAvarage(1.5), marginVertical: resAvarage(2), paddingHorizontal: resAvarage(3) }}
                renderItem={({ item }: any) => {
                    const Icon = item?.icon;
                    const isMoreFeatures = title === 'More Features';
                    const isSubscription = item?.id === 'subscription' || item?.title === 'Subscription';
                    const isInsights = item?.id === 'insights' || item?.title === 'Insights';
                    const belongsToCurrent = isSubscription || isInsights || (item?.purposes && item.purposes.includes(currentPurpose));
                    const isLocked = isMoreFeatures && !isPremium && !belongsToCurrent;

                    return (
                        <TouchableOpacity
                            onPress={() => handlePress(item)}
                            activeOpacity={0.7}
                            style={[
                                styles.card,
                                isSubscription && styles.subscriptionCard,
                            ]}
                        >
                            <View style={styles.row}>
                                <View style={[
                                    styles.icon,
                                    isSubscription && { backgroundColor: colors.theme },
                                    item?.title === "Logout" && { backgroundColor: colors.black },
                                ]}>
                                    <Icon width={resAvarage(4)} height={resAvarage(4)} />
                                </View>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: resAvarage(1) }}>
                                        <CustomText style={[styles.title, isSubscription && { fontFamily: FontBold }]}>
                                            {item?.title}
                                        </CustomText>
                                        {isSubscription && (
                                            <View style={[styles.badge, { backgroundColor: isPremium ? '#10B981' : colors.theme }]}>
                                                <CustomText style={styles.badgeText}>
                                                    {isPremium ? 'PRO ACTIVE' : 'UPGRADE'}
                                                </CustomText>
                                            </View>
                                        )}
                                        {isLocked && (
                                            <View style={[styles.badge, { backgroundColor: colors.theme }]}>
                                                <CustomText style={[styles.badgeText, { color: colors.black }]}>
                                                    PRO
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                    {item?.subtitle && (
                                        <CustomText style={styles.subtitle}>
                                            {isSubscription
                                                ? (isPremium ? 'All features & unlimited storage active' : '15-entry limit · Tap to unlock unlimited')
                                                : item?.subtitle}
                                        </CustomText>
                                    )}
                                </View>
                            </View>
                            <Next width={resAvarage(4)} height={resAvarage(4)} />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    main: {},
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: resAvarage(2),
        flex: 1,
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
    subscriptionCard: {
        borderWidth: 1.5,
        borderColor: colors.theme,
        backgroundColor: '#FCFDF5',
    },
    badge: {
        paddingHorizontal: resAvarage(1),
        paddingVertical: resAvarage(0.3),
        borderRadius: scaleSize(6),
    },
    badgeText: {
        fontSize: font10,
        fontFamily: FontBold,
        color: colors.black,
        letterSpacing: resAvarage(0.05),
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
        width: resWidth(55)
    },
})