import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontRegular } from '../../../../../utils/fontFamily';
import { font14, font17 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import Svg, { Circle } from 'react-native-svg';

const TargetIcon = () => (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#444444" strokeWidth="1.6" />
        <Circle cx="12" cy="12" r="6" stroke="#444444" strokeWidth="1.6" />
        <Circle cx="12" cy="12" r="2" fill="#444444" />
    </Svg>
);

interface EmptyGoalsCardProps {
    title?: string;
    subtitle?: string;
}

export default function EmptyGoalsCard({
    title = 'No goals here yet',
    subtitle = 'Create one to start tracking progress.',
}: EmptyGoalsCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconWrapper}>
                <TargetIcon />
            </View>
            <CustomText style={styles.title}>{title}</CustomText>
            <CustomText style={styles.subtitle}>{subtitle}</CustomText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        paddingVertical: resAvarage(5),
        paddingHorizontal: resWidth(4),
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: resAvarage(1),
    },
    iconWrapper: {
        marginBottom: resAvarage(1.5),
    },
    title: {
        fontSize: font17,
        fontFamily: FontBold,
        color: '#141414',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#777777',
        textAlign: 'center',
    },
});

