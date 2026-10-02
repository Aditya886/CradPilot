import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import { font12, font14, font15, font18 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../utils/responsive';
import { formatINR } from '../../utils/FormatUtil';

const CloseIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

export interface MemberShare {
    name: string;
    share: number;
    amount: number;
}

export interface SplitFilterModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    totalAmount?: number;
    members?: string[];
    onApplySplit?: (data: { mode: 'Equally' | 'Custom'; memberShares: MemberShare[] }) => void;
}

export default function SplitFilterModal({
    show,
    setShow,
    totalAmount = 10000,
    members = ['a', 'b', 'me'],
    onApplySplit,
}: SplitFilterModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(50))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [mode, setMode] = useState<'Equally' | 'Custom'>('Equally');
    const [shares, setShares] = useState<Record<string, number>>({});

    useEffect(() => {
        if (show) {
            setMode('Equally');
            const initialShares: Record<string, number> = {};
            members.forEach((m) => {
                initialShares[m] = 1;
            });
            setShares(initialShares);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(transformY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [show, members]);

    const close = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(transformY, {
                toValue: resHeight(50),
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => setShow(false));
    };

    const handleShareChange = (member: string, val: string) => {
        const parsed = parseFloat(val);
        const newShare = isNaN(parsed) || parsed < 0 ? 0 : parsed;
        setShares((prev) => ({
            ...prev,
            [member]: newShare,
        }));
    };

    // Calculation helper
    const totalSharesCount = Object.values(shares).reduce((acc, curr) => acc + curr, 0) || 1;
    const equalShareAmount = Math.round(totalAmount / (members.length || 1));

    const calculateMemberAmount = (memberName: string) => {
        if (mode === 'Equally') {
            return equalShareAmount;
        }
        const memberShareRatio = shares[memberName] ?? 1;
        return Math.round((memberShareRatio / totalSharesCount) * totalAmount);
    };

    const handleApply = () => {
        const resultShares: MemberShare[] = members.map((m) => ({
            name: m,
            share: mode === 'Equally' ? 1 : shares[m] ?? 1,
            amount: calculateMemberAmount(m),
        }));

        onApplySplit?.({
            mode,
            memberShares: resultShares,
        });

        close();
    };

    return (
        <Modal
            transparent
            visible={show}
            animationType="none"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    transform: [{ translateY: transformY }],
                                },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <CustomText style={styles.headerTitle}>
                                    {`How to split ${formatINR(totalAmount)}`}
                                </CustomText>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={close}
                                    style={styles.closeBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <CloseIcon color={colors.black} size={resAvarage(3.2)} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                {/* Mode Selection Cards */}
                                <View style={styles.modeRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setMode('Equally')}
                                        style={[
                                            styles.modeCard,
                                            mode === 'Equally' ? styles.modeCardUnselected : styles.modeCardSelected,
                                        ]}
                                    >
                                        <CustomText style={styles.modeTitle}>Equally</CustomText>
                                        <CustomText style={styles.modeSubtitle}>
                                            {`${formatINR(equalShareAmount)} each`}
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setMode('Custom')}
                                        style={[
                                            styles.modeCard,
                                            mode === 'Custom' ? styles.modeCardUnselected : styles.modeCardSelected,
                                        ]}
                                    >
                                        <CustomText style={styles.modeTitle}>Custom shares</CustomText>
                                        <CustomText style={styles.modeSubtitle}>
                                            Someone spent more or less
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                {/* Render SHARES section only when Custom shares mode is selected */}
                                {mode === 'Custom' && (
                                    <>
                                        {/* SHARES Section */}
                                        <CustomText style={styles.sectionLabel}>SHARES</CustomText>
                                        <View style={styles.sharesList}>
                                            {members.map((member) => {
                                                const calculatedAmt = calculateMemberAmount(member);
                                                const currentShareVal = (shares[member] ?? 1).toString();

                                                return (
                                                    <View key={member} style={styles.memberRow}>
                                                        <CustomText style={styles.memberName}>{member}</CustomText>

                                                        <View style={styles.memberRightRow}>
                                                            <CustomText style={styles.memberAmount}>
                                                                {formatINR(calculatedAmt)}
                                                            </CustomText>
                                                            <View style={styles.shareInputBox}>
                                                                <TextInput
                                                                    style={styles.shareInput}
                                                                    keyboardType="numeric"
                                                                    value={currentShareVal}
                                                                    onChangeText={(text) => handleShareChange(member, text)}
                                                                    allowFontScaling={false}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        {/* Explanatory Note */}
                                        <CustomText style={styles.noteText}>
                                            Higher number = bigger share. 2 vs 1 means that person pays twice as much.
                                        </CustomText>
                                    </>
                                )}

                                {/* Apply Split Button */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleApply}
                                    style={styles.submitBtn}
                                >
                                    <CustomText style={styles.submitBtnText}>Apply split</CustomText>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3),
    },
    card: {
        width: resWidth(92),
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(3),
    },
    headerTitle: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(0.5),
    },
    modeRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
        marginBottom: resAvarage(3),
    },
    modeCard: {
        flex: 1,
        borderRadius: resAvarage(3.5),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3),
        minHeight: resAvarage(12),
        justifyContent: 'center',
    },
    modeCardSelected: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: '#E8EBEF',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    modeCardUnselected: {
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    modeTitle: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
        marginBottom: resAvarage(0.5),
    },
    modeSubtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        lineHeight: font12 * 1.3,
    },
    sectionLabel: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        letterSpacing: resAvarage(0.3),
        textTransform: 'uppercase',
        marginBottom: resAvarage(2),
    },
    sharesList: {
        gap: resAvarage(2.5),
        marginBottom: resAvarage(3),
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberName: {
        fontSize: font15,
        fontFamily: FontRegular,
        color: colors.black,
    },
    memberRightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(3),
    },
    memberAmount: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: colors.black60,
    },
    shareInputBox: {
        width: resWidth(18),
        height: resAvarage(6),
        backgroundColor: '#F7F8FA',
        borderRadius: resAvarage(2.5),
        borderWidth: 1,
        borderColor: '#E8EBEF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareInput: {
        fontSize: font15,
        fontFamily: FontMedium,
        color: colors.black,
        textAlign: 'center',
        width: '100%',
        padding: 0,
    },
    noteText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        lineHeight: font12 * 1.3,
        marginBottom: resAvarage(3.5),
    },
    submitBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        height: resAvarage(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: colors.white,
        fontSize: font15,
        fontFamily: FontMedium,
    },
});
