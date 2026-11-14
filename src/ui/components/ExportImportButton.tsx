import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from './CustomText';
import { colors } from '../../utils/colors';
import { FontBold } from '../../utils/fontFamily';
import { font11, font12, font18 } from '../../utils/fontSizes';
import { resAvarage } from '../../utils/responsive';
import { subscriptionService } from '../../services/subscriptionService';

interface ExportImportButtonProps {
    onPress: () => void;
    label?: string;
    variant?: 'pill' | 'icon' | 'outline';
}

export default function ExportImportButton({
    onPress,
    label = 'Export / Import',
    variant = 'pill',
}: ExportImportButtonProps) {
    const handlePress = () => {
        if (!subscriptionService.canUseExportImport()) {
            return;
        }
        onPress();
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            style={[
                styles.btn,
                variant === 'outline' ? styles.btnOutline : styles.btnPill,
            ]}
        >
            <View style={styles.contentRow}>
                <CustomText style={styles.icon}>⇅</CustomText>
                {/* <CustomText style={styles.label}>{label}</CustomText> */}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        paddingHorizontal: resAvarage(1),
        paddingVertical: resAvarage(0.8),
        borderRadius: resAvarage(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnPill: {
        backgroundColor: colors.theme,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    btnOutline: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.black20,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(0.8),
    },
    icon: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
    },
    label: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black,
        letterSpacing: resAvarage(0.05),
    },
});
