import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Keyboard,
    StyleSheet,
    Platform,
    Animated,
    TouchableOpacity,
    Text,
    FlatList,
    Pressable,
    Modal,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../utils/colors';
import { resAvarage, resWidth, scaleSize } from '../utils/responsive';

// Import Screens

// Import SVG Icons
import HomeIcon from '../assets/images/icons/home.svg';
import SHomeIcon from '../assets/images/icons/homeS.svg';
import DebIcon from '../assets/images/icons/debts.svg';
import SDebIcon from '../assets/images/icons/debtsS.svg';
import MoreIcon from '../assets/images/icons/more.svg';
import SMoreIcon from '../assets/images/icons/MoreS.svg';
import { font12, font13, font14, font15, font16 } from '../utils/fontSizes';
import { FontMedium, FontRegular, FontSemiBold } from '../utils/fontFamily';
import Plus from '../assets/images/icons/add.svg';
import Debts from '../screens/main/bottomTabs/Debts';
import More from '../screens/main/bottomTabs/More';
import Home from '../screens/main/bottomTabs/Home';
import CustomText from '../ui/components/CustomText';

import LoanIcon from '../assets/images/icons/loan.svg';
import AddTxnIcon from '../assets/images/icons/plus.svg';
import SavingsIcon from '../assets/images/icons/bill.svg';
import BudgetIcon from '../assets/images/icons/budget.svg';
import CloseIcon from '../assets/images/icons/close.svg';
import NextIcon from '../assets/images/icons/next.svg';
import { ShowToast } from '../utils/CustomToast/ToastManager';

const Tab = createBottomTabNavigator();

const renderCustomTabBar = (props: any) => <CustomTabBar {...props} />;

function CustomTabBar({ state, navigation }: any) {
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const rotationAnim = useRef<any>(new Animated.Value(0)).current;
    const animatedValues = useRef(
        state.routes.map(() => new Animated.Value(1)),
    ).current;

    const [showAddBox, setShowAddBox] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true),
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false),
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        Animated.timing(rotationAnim, {
            toValue: showAddBox ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [showAddBox]);

    if (keyboardVisible) return null;

    const handleCenterButtonPress = () => {
        setShowAddBox(prev => !prev);
    };

    const rotateInterpolate = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '315deg'],
    });

    const getIcon = (routeName: string, isFocused: boolean) => {
        const iconSize = resAvarage(3.5);

        const icons: any = {
            Home: { inactive: HomeIcon, active: SHomeIcon },
            Debts: { inactive: DebIcon, active: SDebIcon },
            More: { inactive: MoreIcon, active: SMoreIcon },
        };


        const IconComponent = isFocused
            ? icons[routeName]?.active
            : icons[routeName]?.inactive;

        if (!IconComponent) return null;

        return <IconComponent width={iconSize} height={iconSize} />;
    };

    const options = [
        { id: 'new_loan', title: 'Add New Loan', icon: LoanIcon },
        { id: 'add_txn', title: 'Add Txn', icon: AddTxnIcon },
        { id: 'savings_goals', title: 'Add Savings & Goals', icon: SavingsIcon },
        { id: 'emi_loans', title: 'Add EMI & Loans', icon: LoanIcon },
        { id: 'schedule_budgets', title: 'Schedule Budgets', icon: BudgetIcon },
    ];

    const handleOptionPress = (id: string) => {
        setShowAddBox(false);
        if (id === 'new_loan') {
            navigation.navigate("NewLoan");
        } else if (id === 'add_txn') {
            navigation.navigate("Debts", { openAddTxn: true });
        } else {
            ShowToast("Coming Soon", "info");
        }
    };

    return (
        <>
            <Modal
                visible={showAddBox}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAddBox(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowAddBox(false)}
                >
                    <View style={styles.modalContainer}>
                        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.modalHeader}>
                                <CustomText style={styles.modalTitle}>Quick Actions</CustomText>
                                <TouchableOpacity onPress={() => setShowAddBox(false)}>
                                    <CloseIcon width={resAvarage(2.5)} height={resAvarage(2.5)} />
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                renderItem={({ item }) => {
                                    const Icon = item.icon;
                                    return (
                                        <TouchableOpacity
                                            style={styles.optionRow}
                                            onPress={() => handleOptionPress(item.id)}
                                        >
                                            <View style={styles.optionLeft}>
                                                <View style={styles.optionIconContainer}>
                                                    <Icon width={resAvarage(3.5)} height={resAvarage(3.5)} />
                                                </View>
                                                <CustomText style={styles.optionText}>{item.title}</CustomText>
                                            </View>
                                            <NextIcon width={resAvarage(3)} height={resAvarage(3)} />
                                        </TouchableOpacity>
                                    );
                                }}
                                ItemSeparatorComponent={() => <View style={styles.separator} />}
                            />
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            <View style={styles.tabBar}>
                {/* <LinearGradient
                    colors={[
                        'transparent',
                        'rgba(236, 84, 84, 0.02)',
                        'rgba(0,0,0,0.08)',
                    ]}
                    style={styles.linearGradientShadow}
                    pointerEvents="none"
                /> */}

                <TouchableOpacity
                    style={styles.centerButton}
                    onPress={handleCenterButtonPress}
                    activeOpacity={0.8}>
                    <Animated.View
                        style={[
                            styles.centerButtonInner,
                            {
                                transform: [{ rotate: rotateInterpolate }],
                            },
                        ]}>
                        <Plus width={resAvarage(6)} height={resAvarage(6)} />
                    </Animated.View>
                </TouchableOpacity>

                <View style={styles.tabsContainer}>
                    {state.routes.map((route: any, index: any) => {
                        const isFocused = state.index === index;
                        const scale = animatedValues[index];

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                Animated.timing(scale, {
                                    toValue: 0.8,
                                    duration: 100,
                                    useNativeDriver: true,
                                }).start(() => {
                                    navigation.navigate(route.name);
                                    Animated.spring(scale, {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        tension: 150,
                                        friction: 5,
                                    }).start();
                                });
                            }
                        };

                        return (
                            <Pressable
                                key={index}
                                onPress={onPress}
                                style={[
                                    styles.tabItem,
                                    isFocused && styles.tabItemActive,
                                ]}>
                                <View style={styles.iconContainer}>
                                    <Animated.View
                                        style={{ transform: [{ scale: scale }] }}>
                                        {getIcon(route.name, isFocused)}
                                    </Animated.View>
                                </View>
                                {isFocused && <Text
                                    style={[
                                        styles.tabLabel,
                                        isFocused && styles.tabLabelActive,
                                    ]}>
                                    {route.name}
                                </Text>}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </>
    );
}

export default function BottomTab() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
            }}
            tabBar={renderCustomTabBar}>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Debts" component={Debts} />
            <Tab.Screen name="More" component={More} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tagBox: {
        paddingHorizontal: resWidth(2),
        paddingVertical: resAvarage(0.5),
        borderRadius: scaleSize(5),
        marginTop: resAvarage(1),
        alignSelf: "flex-start"
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font15
    },
    subtitle: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.white60,
        lineHeight: font13 * 1.3
    },
    box: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(15),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(3),
        margin: resAvarage(2)
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: resAvarage(2),
        paddingVertical: resAvarage(2)
    },
    linearGradientShadow: {
        position: 'absolute',
        top: -resWidth(3),
        left: 0,
        right: 0,
        height: resWidth(3),
        zIndex: 10,
    },
    popupContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? resAvarage(14) : resAvarage(12),
        top: 0,
        right: 0,
        left: 0,
        backgroundColor: colors.black50,
        zIndex: 999,
        justifyContent: 'flex-end'
    },

    popupBox: {
        width: '100%',
        backgroundColor: '#2A2645',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    popupText: {
        color: '#fff',
        fontSize: 16,
    },
    tabBar: {
        flexDirection: 'row',
        // backgroundColor: '#1D1A31',
        justifyContent: 'center',
        borderTopWidth: 1,
        gap: resAvarage(3),
        borderTopColor: colors.white30,
        paddingBottom: Platform.OS === 'ios' ? resWidth(4) : 0,
        marginBottom: Platform.OS === 'ios' ? resAvarage(8) : resAvarage(5),
        marginHorizontal: Platform.OS === 'ios' ? resAvarage(2) : resAvarage(2),
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    tabsContainer: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.white90,
        borderWidth: 1,
        borderColor: colors.black20,
        // marginHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
        // paddingHorizontal: resWidth(2),
        borderRadius: resAvarage(10),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
    },
    tabItem: {
        flexDirection: "row",
        backgroundColor: colors.black90,
        borderRadius: resAvarage(100),
        padding: resAvarage(1.5),
        marginHorizontal: resWidth(2),
        justifyContent: 'center',
    },
    tabItemActive: {
        opacity: 1,
        backgroundColor: colors.black,
        alignItems: "center",
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(1.5),
        gap: resAvarage(1)
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: font14,
        fontFamily: FontMedium,
        textAlign: 'center',
        color: colors.white90,
        // marginTop: scaleSize(5),
    },
    tabLabelActive: {
        color: colors.theme,
    },
    centerButton: {
        alignSelf: 'center',
        width: resAvarage(8),
        height: resAvarage(8),
        borderRadius: resAvarage(4),
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    centerButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusIcon: {
        fontSize: resAvarage(5),
        color: '#fff',
        fontWeight: '300',
        lineHeight: resAvarage(5),
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        width: '90%',
        paddingHorizontal: resAvarage(6),
        paddingBottom: Platform.OS === 'ios' ? resAvarage(12) : resAvarage(15),
    },
    modalContent: {
        backgroundColor: colors.bgWhite,
        borderRadius: resAvarage(4),
        padding: resAvarage(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(2),
        paddingBottom: resAvarage(1.5),
        borderBottomWidth: 1,
        borderBottomColor: colors.black10,
    },
    modalTitle: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: resAvarage(1.8),
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
    },
    optionIconContainer: {
        backgroundColor: colors.black10,
        borderRadius: resAvarage(100),
        padding: resAvarage(1.2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
    },
    separator: {
        height: 1,
        backgroundColor: colors.black10,
    },
});
