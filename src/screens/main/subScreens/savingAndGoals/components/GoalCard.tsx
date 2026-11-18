import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font12, font13, font16 } from '../../../../../utils/fontSizes';
import { colors } from '../../../../../utils/colors';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { formatINR } from '../../../../../utils/FormatUtil';
import GrayDelete from '../../../../../assets/images/icons/grayDelete.svg';
import Svg, { Path } from 'react-native-svg';

export interface GoalItem {
    id: number;
    title: string;
    saved: number;
    target: number;
    days?: number;
    timeline?: string;
    status?: string;
    created_at?: string;
}

interface GoalCardProps {
    item: GoalItem;
    onMinusPress: (goal: GoalItem) => void;
    onPlusPress: (goal: GoalItem) => void;
    onAddContributionPress: (goal: GoalItem) => void;
    onToggleComplete: (goal: GoalItem) => void;
    onDeletePress: (goal: GoalItem) => void;
}

const MinusIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M5 12H19" stroke="#141414" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
);

const PlusIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5V19M5 12H19" stroke="#141414" strokeWidth="2.2" strokeLinecap="round" />
    </Svg>
);

const CheckIcon = () => (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke="#141414" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export default function GoalCard({
    item,
    onMinusPress,
    onPlusPress,
    onAddContributionPress,
    onToggleComplete,
    onDeletePress,
}: GoalCardProps) {
    const pct = item.target > 0 ? Math.round((item.saved / item.target) * 100) : 0;
    const isCompleted = item.status === 'done' || pct >= 100;

    const timelineText = item.timeline
        ? item.timeline
        : item.days
        ? `${item.days} days`
        : '';

    return (
        <View style={styles.card}>
            {/* Top Row: Title + % Badge + Delete */}
            <View style={styles.topRow}>
                <CustomText style={styles.title} numberOfLines={1}>
                    {item.title}
                </CustomText>

                <View style={styles.topRight}>
                    <View style={styles.pctBadge}>
                        <CustomText style={styles.pctText}>{`${pct}%`}</CustomText>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => onDeletePress(item)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <GrayDelete width={18} height={18} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Subtitle: ₹28,000 of ₹60,000 · 4 months */}
            <CustomText style={styles.subtext}>
                {`${formatINR(item.saved)} of ${formatINR(item.target)}${
                    timelineText ? ` · ${timelineText}` : ''
                }`}
            </CustomText>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${Math.min(100, Math.max(0, pct))}%` },
                    ]}
                />
            </View>

            {/* Actions Row: [-] [+] [Add contribution] [✓ Complete] */}
            <View style={styles.actionsRow}>
                {/* Minus Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onMinusPress(item)}
                    style={styles.circleBtn}
                >
                    <MinusIcon />
                </TouchableOpacity>

                {/* Plus Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onPlusPress(item)}
                    style={styles.circleBtn}
                >
                    <PlusIcon />
                </TouchableOpacity>

                {/* Add Contribution Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onAddContributionPress(item)}
                    style={styles.capsuleBtn}
                >
                    <CustomText style={styles.capsuleBtnText}>Add contribution</CustomText>
                </TouchableOpacity>

                {/* Complete Button */}
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onToggleComplete(item)}
                    style={[
                        styles.capsuleBtn,
                        isCompleted && styles.completedCapsuleBtn,
                    ]}
                >
                    <CheckIcon />
                    <CustomText style={styles.capsuleBtnText}>
                        {isCompleted ? 'Completed' : 'Complete'}
                    </CustomText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4.5),
        borderWidth: 1,
        borderColor: '#ECECEC',
        padding: resWidth(4.5),
        marginBottom: resAvarage(2),
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
        fontSize: font16,
        fontFamily: FontBold,
        color: '#141414',
        marginRight: 8,
    },
    topRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pctBadge: {
        backgroundColor: colors.theme,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 10,
    },
    pctText: {
        fontSize: font12,
        fontFamily: FontBold,
        color: '#141414',
    },
    deleteButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtext: {
        fontSize: font13,
        fontFamily: FontRegular,
        color: '#666666',
        marginTop: 4,
        marginBottom: 12,
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#EBEBEB',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#141414',
        borderRadius: 3,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    circleBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    capsuleBtn: {
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        gap: 4,
    },
    completedCapsuleBtn: {
        backgroundColor: '#F3F4F6',
        borderColor: '#D1D5DB',
    },
    capsuleBtnText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#141414',
    },
});

