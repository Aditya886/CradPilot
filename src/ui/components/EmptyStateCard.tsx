import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import CustomText from './CustomText'
import { colors } from '../../utils/colors'
import { resAvarage, resWidth } from '../../utils/responsive'
import { FontMedium, FontSemiBold } from '../../utils/fontFamily'
import { font12, font14, font16 } from '../../utils/fontSizes'

interface EmptyStateCardProps {
    title: string;
    subtitle: string;
    Icon: any; // SVG Icon component
    btnTitle?: string;
    onPressBtn?: () => void;
    style?: any;
}

export default function EmptyStateCard({
    title,
    subtitle,
    Icon,
    btnTitle,
    onPressBtn,
    style
}: EmptyStateCardProps) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.iconContainer}>
                {Icon && <Icon width={resAvarage(6)} height={resAvarage(6)} fill={colors.black50} />}
            </View>
            <CustomText style={styles.title}>{title}</CustomText>
            <CustomText style={styles.subtitle}>{subtitle}</CustomText>
            {btnTitle && onPressBtn && (
                <TouchableOpacity onPress={onPressBtn} activeOpacity={0.8} style={styles.btn}>
                    <CustomText style={styles.btnText}>{btnTitle}</CustomText>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        borderWidth: 1,
        borderColor: colors.black20,
        paddingVertical: resAvarage(4.5),
        paddingHorizontal: resAvarage(3),
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: resAvarage(3),
        marginVertical: resAvarage(1),
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    iconContainer: {
        width: resAvarage(11),
        height: resAvarage(11),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: resAvarage(2),
    },
    title: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: colors.black,
        marginBottom: resAvarage(0.5),
        textAlign: 'center',
    },
    subtitle: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        textAlign: 'center',
        lineHeight: font12 * 1.4,
        marginBottom: resAvarage(2.5),
        paddingHorizontal: resWidth(4),
    },
    btn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(1.5),
        paddingHorizontal: resWidth(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    }
});
