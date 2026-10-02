import React from 'react';
import {
    Image,
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import CustomText from '../../../../ui/components/CustomText';
import { colors } from '../../../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily';
import { resAvarage, resWidth } from '../../../../utils/responsive';
import { font12, font14, font16, font24, font28 } from '../../../../utils/fontSizes';
import Insight from '../../../../assets/images/icons/insight.svg'
import { useAppSelector } from '../../../../utils/hooks';

type HomeHeaderProps = {
    name?: string;
    profileImage?: ImageSourcePropType | null;
    onPressInsights?: () => void;
    onPressNotifications?: () => void;
};

const getTodayLabel = () => {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).format(new Date());
};

export default function HomeHeader({
    name = 'Aarav',
    profileImage,
    onPressInsights,
    onPressNotifications,
}: HomeHeaderProps) {
    const initial = (name?.trim()?.[0] || 'A').toUpperCase();
    const reduxProfileImage = useAppSelector(state => state.app.currentProfileImage);
    const resolvedProfileImage = profileImage || (reduxProfileImage ? { uri: reduxProfileImage } : null);

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <CustomText style={styles.dateText}>{getTodayLabel()}</CustomText>
                <CustomText style={styles.greetingText}>{`Hi, ${name}`}</CustomText>
            </View>

            <View style={styles.rightSection}>
                <Pressable
                    onPress={onPressInsights}
                    style={({ pressed }) => [
                        styles.actionButton,
                        styles.insightsButton,
                        pressed && styles.pressed,
                    ]}>
                    <Insight width={resAvarage(2.5)} height={resAvarage(2.5)} />
                    <CustomText style={styles.insightsText}>Insights</CustomText>
                </Pressable>

                <View style={styles.avatar}>
                    {resolvedProfileImage ? (
                        <Image source={resolvedProfileImage} style={styles.avatarImage} />
                    ) : (
                        <CustomText style={styles.avatarInitial}>{initial}</CustomText>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: resAvarage(3),
        paddingBottom: resAvarage(2),
    },
    leftSection: {
        flex: 1,
        paddingRight: 12,
    },
    dateText: {
        fontFamily: FontRegular,
        color: colors.black90,
        fontSize: font14,
    },
    greetingText: {
        fontFamily: FontBold,
        fontSize: font24,
        width: resWidth(40),
        color: colors.textBlack,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        paddingHorizontal: 18,
        borderRadius: resAvarage(100),
        borderWidth: 1,
        borderColor: colors.black10,
        paddingVertical: resAvarage(2),
        backgroundColor: colors.bgWhite,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },
    insightsButton: {
        marginRight: 10,
    },
    insightsText: {
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.textBlack,
        marginLeft: 8,
    },
    avatar: {
        width: resWidth(13),
        height: resWidth(13),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        elevation: 8,
        zIndex: 999,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    avatarInitial: {
        fontFamily: FontMedium,
        fontSize: font28,
        lineHeight: font28 * 1.3,
        color: colors.textWhite,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
