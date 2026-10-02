import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import CustomImage from '../components/CustomImage'
import { icons } from '../../utils/AppImages'
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive'
import { colors } from '../../utils/colors'
import { goBack } from '../../navigation/NavigationUtils'
import { useAppSelector } from '../../utils/hooks'
import CustomText from '../components/CustomText'
import { font18 } from '../../utils/fontSizes'
import Back from "../../assets/images/icons/back.svg"

export default function BackButton({ style, onPress, black, noText, title, icon }: any) {
  return (
    <TouchableOpacity onPress={onPress ? onPress : () => goBack()} activeOpacity={50} style={[styles.button, style]} >
      <Back width={resAvarage(4)} height={resAvarage(4)} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: resAvarage(20),
    height: resAvarage(20),

    padding: scaleSize(10),
    flexDirection: "row",
    alignItems: 'center',
    backgroundColor: colors.bgGray
    // borderRadius: scaleSize(10),
    // borderWidth: 1,
    // borderColor: colors.textBlack
  },
  backIcon: {
    width: resWidth(6),
    height: resWidth(6),
    // backgroundColor:"red"
  }
})