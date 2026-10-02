import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomText from './CustomText'
import { colors } from '../../utils/colors'

export default function RatingText({box, rating, review}:any) {
  return (
    <View>
      <CustomText variant="subtitle" style={[styles.rating, box && {color: colors.textWhite}]}>
           { rating? `⭐ ${rating}` :  `⭐ ${4.5}`}
           <CustomText variant="body" style={[styles.review, box && {color: colors.borderDarkColor}]}>
             {review ? ` (${review} review) ` : ` (1.7k review) `}
           </CustomText>
        </CustomText>
    </View>
  )
}

const styles = StyleSheet.create({
    rating:{
        color: colors.bgColor
    },
    review:{
        color: colors.textGray
    },
})
