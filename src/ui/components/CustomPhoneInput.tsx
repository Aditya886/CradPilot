import { View, Text, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, I18nManager } from 'react-native'
import React from 'react'
import CustomText from './CustomText'
import CustomImage from './CustomImage'
import { icons } from '../../utils/AppImages'
import { scaleSize } from '../../utils/responsive'
import { font12, font14, font17, font20 } from '../../utils/fontSizes'
import { colors } from '../../utils/colors'
import { t } from '../../language/t'

export default function CustomPhoneInput({
  editable = true, // Default to true for backward compatibility
  flag,
  code,
  onPress,
  label,
  style,
  errorText,
  onChangeText,
  value,
  showError,
  errorStyle
}:any) {
  return (
    <View style={[styles.main, style]}>
      {label ? <CustomText variant="label" style={styles.label}>{label}</CustomText> : null}
      <View style={[styles.Row, !editable && styles.disabledRow]}>
        <TouchableOpacity 
          onPress={editable ? onPress : undefined} 
          style={[styles.box, !editable && styles.disabledBox]}
          disabled={!editable}
        >
          <View style={styles.row}>
              <CustomText variant="title" style={[styles.flag, !editable && styles.disabledText]}>{flag}</CustomText>
              <CustomText variant="body" style={[styles.code, !editable && styles.disabledText]}>{code}</CustomText>
          </View>
          <CustomImage 
            source={icons.downArrow} 
            resizeMode='contain' 
            style={[styles.arrow, !editable && styles.disabledArrow]} 
          />
        </TouchableOpacity>
        <TextInput 
          placeholder={t("common.enter_no")}
          value={value}
          allowFontScaling={false}
          maxFontSizeMultiplier={1}
          onChangeText={editable ? onChangeText : undefined}
          maxLength={12}
          keyboardType='number-pad'
          placeholderTextColor={editable ? colors.textBlack41 : colors.textBlack41}
          cursorColor={colors.btnColor}
          editable={editable}
          style={[ 
              styles.box, 
              styles.input,
              !editable && styles.disabledInput,
              { textAlign: I18nManager.isRTL ? "right" : "left" } 
          ]}
        />
      </View>
      {showError && errorText && (
        <CustomText variant="caption" style={[styles.errorText, errorStyle]}>{errorText}</CustomText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
    Row:{
      flexDirection:'row',
      alignItems:'center',
      borderWidth:1,
      borderColor: "#E8E6EA",
      borderRadius: scaleSize(10)
    },
    disabledRow: {
      backgroundColor: '#F5F5F5',
      borderColor: '#D3D3D3',
      opacity: 0.7
    },
    errorText: {
      color: colors.textRed,
      marginTop: scaleSize(6),
    },
    label:{
      marginBottom: scaleSize(10)
    },
    main:{
        marginTop: scaleSize(20)
    },
    input:{
        flex:1
    },
    disabledInput: {
      backgroundColor: 'transparent',
      color: '#999999'
    },
    disabledBox: {
      backgroundColor: 'transparent'
    },
    disabledText: {
      color: '#999999'
    },
    disabledArrow: {
      opacity: 0.5
    },
    flag:{
        color:colors.textBlack,
    },
    code:{
        marginLeft: scaleSize(10),
        color:colors.textBlack
    },
    box:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderRadius: 5,
        color:colors.textBlack,
        paddingHorizontal: scaleSize(15),
        paddingVertical: scaleSize(15),
    },
    row:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    arrow:{
        width: scaleSize(20),
        height: scaleSize(15),
        marginLeft: scaleSize(2)
    }
})
