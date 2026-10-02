import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import MoreHeader from './components/MoreHeader'
import ProfileCard from './components/ProfileCard'
import MoreList from './components/MoreList'
import { aboutList, MoreFeatureList } from '../../../assets/DefaultData'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontMedium } from '../../../utils/fontFamily'
import { font10 } from '../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../utils/responsive'
import LogoutIcon from '../../../assets/images/icons/logout.svg'

export default function More() {
    const aboutListWithLogout = [
        ...aboutList,
        {
            id: 4,
            title: "Logout",
            icon: LogoutIcon
        }
    ];

    return (
        <CommonBg>
            <MoreHeader />
            <ProfileCard />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: resAvarage(2) }}
                contentContainerStyle={{ paddingBottom: resAvarage(3), marginTop: resAvarage(1) }}
            >
                <MoreList title={"More Features"} data={MoreFeatureList} />
                <View style={{ marginTop: resAvarage(2) }} />
                <MoreList title={"About"} data={aboutListWithLogout} />

                <CustomText style={styles.footer} >private · on-device · yours alone</CustomText>
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