import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { resAvarage } from '../../utils/responsive'
import CustomText from '../components/CustomText'
import { FontRegular } from '../../utils/fontFamily'
import { font15, font16 } from '../../utils/fontSizes'
import CommonRippleButton from '../components/CommonRippleButton'
import { colors } from '../../utils/colors'
import { navigate } from '../../navigation/NavigationUtils'

export const CommonListCard = ({ item }: any) => {

    const handleNext = () => {
        if (item?.id === 1) {
            return navigate("JournalList")
        } else if (item?.id === 2) {
            return navigate("Breathing")
        } else if (item?.id === 3) {
            return navigate("RecoveryRoom")
        } else if (item?.id === 4) {
            return navigate("MindGames")
        } else if (item?.id === 5) {
            return navigate("AudioLibrary")
        } else if (item?.id === 6) {
            return navigate("SelfAssignment")
        } else if (item?.id === 7) {
            return navigate("Dashboard")
        } else if (item?.id === 8) {
            return navigate("HealthConusel")
        } else if (item?.id === 9) {
            return navigate("PerformanceCoach")
        } else if (item?.id === 10) {
            return navigate("ResourceCenter")
        } else if (item?.id === 11) {
            return navigate("ChatList")
        } else if (item?.id === 12) {
            return navigate("Arena")
        } else if (item?.id === 13) {
            return navigate("CourseList")
        }
    }


    const Icon = item?.icon
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={handleNext} style={styles.row} >
            <Icon width={resAvarage(8)} height={resAvarage(8)} />
            <CustomText style={styles.title} >{item?.title}</CustomText>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: resAvarage(2),
        paddingVertical: resAvarage(2)
    },
    title: {
        fontFamily: FontRegular,
        fontSize: font16,
        lineHeight: font16 * 1.3
    }
})