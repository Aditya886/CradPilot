import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily'
import { font12, font16 } from '../../../../utils/fontSizes'
import { resAvarage, scaleSize } from '../../../../utils/responsive'
import { formatINR } from '../../../../utils/FormatUtil'

import DeleteIcon from '../../../../assets/images/icons/delete.svg'

export interface PlanItemData {
    id: string
    title: string
    type: 'Single' | 'Group'
    peopleCount?: number
    itemsCount: number
    spent: number
    total: number
    tagText?: string
    statusVariant?: 'left' | 'settled' | 'over'
}

interface PlanCardProps {
    item: PlanItemData
    onPress?: (item: PlanItemData) => void
    onDelete?: (item: PlanItemData) => void
}

export default function PlanCard({ item, onPress, onDelete }: PlanCardProps) {
    const isOver = item.statusVariant === 'over' || item.spent > item.total
    const isSettled = item.statusVariant === 'settled'

    let tagLabel = item.tagText
    if (!tagLabel) {
        if (isSettled) {
            tagLabel = 'Settled'
        } else if (isOver) {
            tagLabel = `${formatINR(item.spent - item.total)} over`
        } else {
            tagLabel = `${formatINR(Math.max(0, item.total - item.spent))} left`
        }
    }

    const pillBg = isSettled
        ? '#EAECEF'
        : isOver
        ? '#FDE8E8'
        : '#EDFAC2'

    const pillTextColor = isSettled
        ? '#717886'
        : isOver
        ? colors.textRed
        : '#1F2E05'

    const progressPercent = isOver
        ? 100
        : Math.min(100, Math.max(0, (item.spent / (item.total || 1)) * 100))

    const progressColor = isOver ? colors.textRed : colors.theme

    const subtitle = item.type === 'Single'
        ? `Single budget · ${item.itemsCount} items`
        : `${item.peopleCount || 3} people · ${item.itemsCount} items`

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && { opacity: 0.92 }
            ]}
            onPress={() => onPress && onPress(item)}
        >
            <View style={styles.topRow}>
                <View style={styles.titleContainer}>
                    <CustomText style={styles.title}>{item.title}</CustomText>
                    <CustomText style={styles.subtitle}>{subtitle}</CustomText>
                </View>
                <View style={styles.rightActions}>
                    <View style={[styles.pill, { backgroundColor: pillBg }]}>
                        <CustomText style={[styles.pillText, { color: pillTextColor }]}>
                            {tagLabel}
                        </CustomText>
                    </View>
                    {onDelete && (
                        <Pressable
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                            }}
                            style={styles.deleteBtn}
                        >
                            <DeleteIcon width={resAvarage(3.5)} height={resAvarage(3.5)} />
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${progressPercent}%`,
                            backgroundColor: progressColor
                        }
                    ]}
                />
            </View>

            <View style={styles.bottomRow}>
                <CustomText style={styles.spentText}>
                    {`${formatINR(item.spent)} spent`}
                </CustomText>
                <CustomText style={styles.totalText}>
                    {`of ${formatINR(item.total)}`}
                </CustomText>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(3.5),
        paddingVertical: resAvarage(3),
        marginHorizontal: resAvarage(3),
        marginBottom: resAvarage(2.5),
        borderWidth: 1,
        borderColor: '#E8EBEF',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        marginRight: resAvarage(2),
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
    },
    deleteBtn: {
        padding: resAvarage(0.5),
    },
    title: {
        fontSize: font16,
        fontFamily: FontBold,
        color: colors.black,
    },
    subtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: resAvarage(0.5),
    },
    pill: {
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(0.6),
        borderRadius: resAvarage(100),
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillText: {
        fontSize: font12,
        fontFamily: FontMedium,
    },
    progressTrack: {
        height: scaleSize(7),
        backgroundColor: '#ECEFF1',
        borderRadius: resAvarage(100),
        marginVertical: resAvarage(2.5),
        overflow: 'hidden',
        width: '100%',
    },
    progressFill: {
        height: '100%',
        borderRadius: resAvarage(100),
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    spentText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black80,
    },
    totalText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
    },
})
