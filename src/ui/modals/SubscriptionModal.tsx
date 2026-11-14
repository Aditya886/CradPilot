import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font15, font16, font18, font20 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import { subscriptionService, SubscriptionModalOptions } from '../../services/subscriptionService';
import { useAppSelector } from '../../utils/hooks';
import CloseIcon from '../../assets/images/icons/close.svg';
import { showFlashMessage } from '../../utils/flashMessage';

interface SubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    reason?: 'storage_limit' | 'delete_locked' | 'export_locked' | 'mode_locked' | 'manage';
}

export default function SubscriptionModal({
    visible,
    onClose,
    title,
    subtitle,
    reason = 'manage',
}: SubscriptionModalProps) {
    const isPremium = useAppSelector(state => state.app.isPremium);
    const purpose = useAppSelector(state => state.app.purpose);
    const transformY = useRef(new Animated.Value(resHeight(100))).current;

    const [entriesCount, setEntriesCount] = useState(0);

    useEffect(() => {
        if (visible) {
            setEntriesCount(subscriptionService.getTotalEntriesCount());
            Animated.timing(transformY, {
                duration: 300,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        } else {
            transformY.setValue(resHeight(100));
        }
    }, [visible]);

    const close = () => {
        Animated.timing(transformY, {
            toValue: resHeight(100),
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleTogglePlan = async () => {
        const nextState = !isPremium;
        await subscriptionService.setPremium(nextState);
        showFlashMessage(
            nextState
                ? 'Welcome to CredPilot Pro! All features unlocked.'
                : 'Switched to Free tier for demonstration.',
            'success'
        );
        close();
    };

    const getReasonAlert = () => {
        if (isPremium) return null;
        switch (reason) {
            case 'storage_limit':
                return {
                    title: '15-Entry Limit Reached',
                    desc: 'Free accounts are limited to 15 total records. Upgrade to Pro for unlimited storage.',
                };
            case 'delete_locked':
                return {
                    title: 'Record Deletion Locked',
                    desc: 'Deleting entries is disabled on the Free tier. Upgrade to Pro to delete records.',
                };
            case 'export_locked':
                return {
                    title: 'Export & Import Locked',
                    desc: 'Offline Excel and PDF backup/restore are available exclusively on CredPilot Pro.',
                };
            case 'mode_locked':
                return {
                    title: 'App Mode Locked',
                    desc: 'Free accounts have access to their signup mode only. Upgrade to unlock all 3 modes.',
                };
            default:
                return null;
        }
    };

    const reasonInfo = getReasonAlert();

    const planFeatures = [
        {
            title: 'Storage & Entries',
            free: '15 Entries Max',
            pro: 'Unlimited Entries',
            isProBetter: true,
        },
        {
            title: 'Record Deletion',
            free: 'Locked',
            pro: 'Full Delete Access',
            isProBetter: true,
        },
        {
            title: 'App Modes',
            free: '1 Mode Only',
            pro: 'All 3 Modes (Tuition, Finance, Local)',
            isProBetter: true,
        },
        {
            title: 'Export & Import',
            free: 'Locked',
            pro: 'Excel (.xlsx) & PDF Backups',
            isProBetter: true,
        },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.sheetContainer,
                                { transform: [{ translateY: transformY }] },
                            ]}
                        >
                            {/* Drag Bar */}
                            <View style={styles.handleBar} />

                            {/* Header */}
                            <View style={styles.headerRow}>
                                <View style={styles.headerTextGroup}>
                                    <View style={styles.titleBadgeRow}>
                                        <CustomText style={styles.sheetTitle}>CredPilot Pro</CustomText>
                                        <View style={[styles.planBadge, isPremium ? styles.planBadgePro : styles.planBadgeFree]}>
                                            <CustomText style={[styles.planBadgeText, isPremium && styles.planBadgeProText]}>
                                                {isPremium ? 'PRO ACTIVE ⭐' : 'FREE PLAN'}
                                            </CustomText>
                                        </View>
                                    </View>
                                    <CustomText style={styles.sheetSubtitle}>
                                        {subtitle || (isPremium ? 'All features & storage unlocked' : 'Manage your subscription & storage limits')}
                                    </CustomText>
                                </View>
                                <TouchableOpacity activeOpacity={0.7} onPress={close} style={styles.closeBtn}>
                                    <CloseIcon width={resAvarage(2.6)} height={resAvarage(2.6)} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                {/* Reason Alert Banner */}
                                {reasonInfo && (
                                    <View style={styles.reasonBanner}>
                                        <CustomText style={styles.reasonTitle}>{reasonInfo.title}</CustomText>
                                        <CustomText style={styles.reasonDesc}>{reasonInfo.desc}</CustomText>
                                    </View>
                                )}

                                {/* Storage Usage Meter */}
                                <View style={styles.meterCard}>
                                    <View style={styles.meterHeader}>
                                        <CustomText style={styles.meterLabel}>STORAGE USAGE</CustomText>
                                        <CustomText style={styles.meterValue}>
                                            {isPremium ? `${entriesCount} Entries (Unlimited)` : `${entriesCount} / 15 Entries`}
                                        </CustomText>
                                    </View>
                                    <View style={styles.progressBarTrack}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                {
                                                    width: isPremium
                                                        ? '100%'
                                                        : `${Math.min(100, (entriesCount / 15) * 100)}%`,
                                                    backgroundColor: isPremium
                                                        ? colors.theme
                                                        : entriesCount >= 15
                                                        ? colors.textRed
                                                        : colors.black,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <CustomText style={styles.meterFootnote}>
                                        {isPremium
                                            ? 'You have unlimited storage capacity on CredPilot Pro.'
                                            : entriesCount >= 15
                                            ? 'Storage limit reached. Upgrade to Pro to add more records.'
                                            : `${15 - entriesCount} entry slots remaining on the Free plan.`}
                                    </CustomText>
                                </View>

                                {/* Plan Comparison Card */}
                                <View style={styles.comparisonCard}>
                                    <View style={styles.comparisonHeader}>
                                        <CustomText style={styles.comparisonTitle}>FEATURE COMPARISON</CustomText>
                                    </View>

                                    {planFeatures.map((feat, idx) => (
                                        <View key={idx} style={[styles.featureRow, idx > 0 && styles.featureRowDivider]}>
                                            <CustomText style={styles.featureName}>{feat.title}</CustomText>
                                            <View style={styles.featureValues}>
                                                <View style={styles.featureFreeCol}>
                                                    <CustomText style={styles.featureFreeText}>{feat.free}</CustomText>
                                                </View>
                                                <View style={styles.featureProCol}>
                                                    <CustomText style={styles.featureProText}>{feat.pro}</CustomText>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* CTA Action */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleTogglePlan}
                                    style={[styles.actionBtn, isPremium && styles.actionBtnDowngrade]}
                                >
                                    <CustomText style={[styles.actionBtnText, isPremium && styles.actionBtnDowngradeText]}>
                                        {isPremium ? 'Switch to Free Tier (Demo)' : 'Upgrade to CredPilot Pro ⭐'}
                                    </CustomText>
                                </TouchableOpacity>

                                <TouchableOpacity activeOpacity={0.7} onPress={close} style={styles.cancelLink}>
                                    <CustomText style={styles.cancelLinkText}>Maybe Later</CustomText>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: colors.bgWhite,
        borderTopLeftRadius: scaleSize(24),
        borderTopRightRadius: scaleSize(24),
        paddingHorizontal: resAvarage(4),
        paddingTop: scaleSize(12),
        paddingBottom: scaleSize(24),
        maxHeight: '92%',
    },
    handleBar: {
        width: resWidth(12),
        height: scaleSize(4),
        backgroundColor: colors.black20,
        borderRadius: scaleSize(2),
        alignSelf: 'center',
        marginBottom: scaleSize(14),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleSize(12),
    },
    headerTextGroup: {
        flex: 1,
        paddingRight: scaleSize(12),
    },
    titleBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scaleSize(8),
    },
    sheetTitle: {
        fontSize: font20,
        fontFamily: FontBold,
        color: colors.black,
    },
    sheetSubtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: scaleSize(3),
    },
    planBadge: {
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(2),
        borderRadius: resAvarage(100),
    },
    planBadgeFree: {
        backgroundColor: colors.black10,
    },
    planBadgePro: {
        backgroundColor: colors.theme,
    },
    planBadgeText: {
        fontFamily: FontBold,
        fontSize: font10,
        color: colors.black70,
    },
    planBadgeProText: {
        color: colors.black,
    },
    closeBtn: {
        padding: scaleSize(8),
        borderRadius: resAvarage(100),
        backgroundColor: colors.bgColor,
    },
    scrollContent: {
        gap: scaleSize(14),
        paddingBottom: scaleSize(16),
    },
    reasonBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: scaleSize(14),
        padding: scaleSize(12),
        borderWidth: 1,
        borderColor: '#FCD34D',
        gap: scaleSize(2),
    },
    reasonTitle: {
        fontSize: font12,
        fontFamily: FontBold,
        color: '#92400E',
    },
    reasonDesc: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#78350F',
        lineHeight: font12 * 1.35,
    },
    meterCard: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(16),
        padding: scaleSize(14),
        gap: scaleSize(8),
    },
    meterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    meterLabel: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black60,
        letterSpacing: 0.5,
    },
    meterValue: {
        fontSize: font12,
        fontFamily: FontBold,
        color: colors.black,
    },
    progressBarTrack: {
        height: scaleSize(8),
        borderRadius: scaleSize(4),
        backgroundColor: colors.black10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: scaleSize(4),
    },
    meterFootnote: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black60,
    },
    comparisonCard: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(16),
        padding: scaleSize(14),
        gap: scaleSize(10),
    },
    comparisonHeader: {
        paddingBottom: scaleSize(4),
        borderBottomWidth: 1,
        borderBottomColor: colors.black10,
    },
    comparisonTitle: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black60,
        letterSpacing: 0.5,
    },
    featureRow: {
        gap: scaleSize(4),
    },
    featureRowDivider: {
        paddingTop: scaleSize(8),
        borderTopWidth: 1,
        borderTopColor: colors.black10,
    },
    featureName: {
        fontSize: font12,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    featureValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    featureFreeCol: {
        flex: 1,
    },
    featureFreeText: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black50,
    },
    featureProCol: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    featureProText: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black,
    },
    actionBtn: {
        height: scaleSize(50),
        borderRadius: resAvarage(100),
        backgroundColor: colors.theme,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        marginTop: scaleSize(4),
    },
    actionBtnText: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
    },
    actionBtnDowngrade: {
        backgroundColor: colors.bgColor,
        borderWidth: 1.5,
        borderColor: colors.black20,
        elevation: 0,
        shadowOpacity: 0,
    },
    actionBtnDowngradeText: {
        color: colors.black80,
    },
    cancelLink: {
        alignItems: 'center',
        paddingVertical: scaleSize(6),
    },
    cancelLinkText: {
        fontSize: font13,
        fontFamily: FontMedium,
        color: colors.black60,
    },
});
