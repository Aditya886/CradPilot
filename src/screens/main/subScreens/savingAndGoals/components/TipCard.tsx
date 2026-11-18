import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontRegular } from '../../../../../utils/fontFamily';
import { font12 } from '../../../../../utils/fontSizes';
import { colors } from '../../../../../utils/colors';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import Svg, { Path } from 'react-native-svg';

const TrendingUpIcon = () => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
            d="M23 6L13.5 15.5L8.5 10.5L1 18"
            stroke="#141414"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M17 6H23V12"
            stroke="#141414"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default function TipCard() {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <TrendingUpIcon />
            </View>
            <CustomText style={styles.tipText}>
                Small, regular contributions beat occasional large ones. Add to a goal the same day your income lands.
            </CustomText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(4),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        paddingHorizontal: resWidth(4),
        paddingVertical: resAvarage(2),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: resAvarage(2),
        marginBottom: resAvarage(4),
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.theme,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: resWidth(3.5),
    },
    tipText: {
        flex: 1,
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#444444',
        lineHeight: font12 * 1.45,
    },
});

