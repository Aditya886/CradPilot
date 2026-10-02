import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { colors } from '../../utils/colors'
import { FontRegular } from '../../utils/fontFamily'
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive'
import { font15, font16, font18 } from '../../utils/fontSizes'
import CustomImage from './CustomImage'
import { icons } from '../../utils/AppImages'
import CustomText from './CustomText'
import Close from "../../assets/images/icons/cross.svg"
import Search from "../../assets/images/icons/search.svg"

const CustomSearch = ({ setSearch, search, isSearch, style, placeholder, onClose }: any) => {
  const searchInputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (isSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus(); // Opens the keyboard by focusing on TextInput
      }, 100);
    }
  }, [isSearch])
  return (
    <View style={[styles.searchContainer, style]}>
      <Search width={resAvarage(4)} height={resAvarage(4)} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        ref={searchInputRef}
        allowFontScaling={false}
        maxFontSizeMultiplier={1}
        placeholderTextColor={colors.textBlack}
        cursorColor={colors.theme}
        value={search}
        onChangeText={setSearch}
      />
      {/* <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Close width={resAvarage(5)} height={resAvarage(5)} />
      </TouchableOpacity> */}
    </View>
  )
}

const SearchButton = ({ style, placeholder }: any) => {
  return (
    <View style={[styles.searchContainer, style]}>
      {/* <CustomImage style={styles.search} source={icons.search} /> */}
      <Search width={resAvarage(5)} height={resAvarage(5)} />
      <View
        style={styles.searchButton}
      >
        <CustomText style={styles.text}>{`${placeholder}`}</CustomText>
      </View>
    </View>
  )
}

export { CustomSearch, SearchButton }

const styles = StyleSheet.create({
  text: {
    color: colors.textBlack,
    marginLeft: scaleSize(5)
  },
  search: {
    marginHorizontal: scaleSize(5),
    width: scaleSize(20),
    height: scaleSize(20),
  },
  closeButton: {
    marginHorizontal: scaleSize(8),
    // width: scaleSize(15),
    // height: scaleSize(15),
  },
  close: {
    // marginHorizontal: scaleSize(5),
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    marginHorizontal: resAvarage(3),
    borderRadius: resAvarage(100),
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(2),
    marginTop: resAvarage(4),
    marginBottom: resAvarage(3),
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    color: colors.textBlack,
    fontSize: font18,
    lineHeight: font18 * 1.4,
    fontFamily: FontRegular,
    // paddingVertical: scaleSize(2),
    marginHorizontal: scaleSize(10),
    justifyContent: "center"
  },
  searchButton: {
    // flex: 1,
    color: colors.textBlack,
    fontSize: font16,
    height: scaleSize(40),
    width: resWidth(75),
    fontFamily: FontRegular,
    paddingVertical: scaleSize(2),
    marginHorizontal: scaleSize(6),
    justifyContent: "center"
  },
  searchIcon: {
    marginRight: scaleSize(20),
  },
})
