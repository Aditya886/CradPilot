import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import CustomImage from './CustomImage'
import CustomText from './CustomText'
import { icons } from '../../utils/AppImages'
import { scaleSize } from '../../utils/responsive'
import { colors } from '../../utils/colors'

const Rating = ({rating, review}:any) => {
  return (
    <View style={styles.main}>
        <CustomImage resizeMode='contain' source={icons.star} style={styles.star}/>
        <CustomText variant="body" style={styles.rating}>{rating}</CustomText>
        <CustomText variant="caption" style={styles.review}>{`(${review})`}</CustomText>
    </View>
  )
}

const styles = StyleSheet.create({
    main:{
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
    },
    star:{
        width: scaleSize(13),
        height: scaleSize(13),
    },
    rating:{
        marginLeft: scaleSize(4),
    },
    review:{
        color: colors.textBlack41,
        marginLeft: scaleSize(4),
    },
})

export default Rating
