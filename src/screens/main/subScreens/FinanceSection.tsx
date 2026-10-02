import React, { useState, useCallback } from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import IncomeHomeCard from '../bottomTabs/components/IncomeHomeCard'
import HomeAccount from '../bottomTabs/components/HomeAccount'
import Recent from '../bottomTabs/components/Recent'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontMedium } from '../../../utils/fontFamily'
import { font10 } from '../../../utils/fontSizes'
import { resWidth, resAvarage } from '../../../utils/responsive'
import { query } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'

export default function FinanceSection() {
    const [showFooter, setShowFooter] = useState(false);

    const checkData = () => {
        try {
            const loans = query('SELECT id FROM loans') || [];
            const payments = query('SELECT id FROM payments') || [];
            setShowFooter(loans.length > 3 || payments.length > 3);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkData();
        }, [])
    );

    return (
        <CommonBg>
            <InsightHeader title={"Finance Center"} subtitle={"Every Transaction"} />
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                <IncomeHomeCard />
                <HomeAccount />
                <Recent />
                {showFooter && <CustomText style={styles.footer} >on-device · offline · private</CustomText>}
            </ScrollView>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(18),
        color: colors.black60,
        fontFamily: FontMedium
    }
})