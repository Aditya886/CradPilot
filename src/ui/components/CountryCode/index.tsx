import React, { JSX } from 'react';
import {
  FlatList,
  TextInput,
  View,
  Text,
  Animated,
  Dimensions,
  TextStyle,
  SafeAreaView,
  Image,
  StyleSheet,
  TouchableOpacity,
  I18nManager,
} from 'react-native';
// import Modal from '../modals/AppModal';
import {
  CountryItem,
  ItemTemplateProps,
  Style,
  ListHeaderComponentProps,
} from './types/Types';
import {useKeyboardStatus} from './helpers/useKeyboardStatus';
import {CountryButton} from './components/CountryButton';
import {countriesRemover} from './helpers/countriesRemover';
import {removeDiacritics} from './helpers/diacriticsRemover';
// import {colors} from '../../Theme';
// import {Images} from '../../Theme';
// import Image from './Image';
// import Touchable from '../Touchable';
// import { responsiveWidth } from '../../utils/contants';
// import {FontFamily, Fontsize, responsiveWidth} from '../../Theme';
// import AppModal from '../Modals/AppModal';
import {resHeight, resWidth, scaleSize} from './../../../utils/responsive';
import AppModal from './AppModal';
import {colors} from './../../../utils/colors';
import {FontSemiBold, FontMedium} from './../../../utils/fontFamily';
import {font16, font19} from './../../../utils/fontSizes';
import CustomImage from './../CustomImage';
import {icons} from '../../../utils/AppImages';

export {countryCodes} from './constants/countryCodes';
export {CountryButton} from './components/CountryButton';
export type {
  CountryItem,
  ItemTemplateProps,
  Style,
  ListHeaderComponentProps,
} from './types/Types';

const height = Dimensions.get('window').height;

interface Props {
  excludedCountries?: string[];
  showOnly?: string[];
  popularCountries?: string[];
  style?: Style;
  enableModalAvoiding?: boolean;
  disableBackdrop?: boolean;
  onBackdropPress?: (...args: any) => any;
  itemTemplate?: (props: ItemTemplateProps) => JSX.Element;
  ListHeaderComponent?: (props: ListHeaderComponentProps) => JSX.Element;
  onRequestClose?: (...args: any) => any;
  inputPlaceholder?: string;
  inputPlaceholderTextColor?: TextStyle['color'];
  searchMessage?: string;
  androidWindowSoftInputMode?: string;
  initialState?: string;
  onClose?: (...args: any) => any;
}

export const CountryPicker = ({
  onClose,
  full,
  popularCountries,
  inputPlaceholder,
  inputPlaceholderTextColor,
  searchMessage,
  lang = 'en',
  style,
  enableModalAvoiding,
  androidWindowSoftInputMode,
  onBackdropPress,
  disableBackdrop,
  excludedCountries,
  initialState,
  onRequestClose,
  showOnly,
  ListHeaderComponent,
  itemTemplate: ItemTemplate = CountryButton,
  ...rest
}: any) => {
  let filteredCodes = countriesRemover(excludedCountries);

  const [searchValue, setSearchValue] = React.useState<string>(
    initialState || '',
  );

  const codes = React.useMemo(() => {
    let newCodes = filteredCodes;

    if (showOnly?.length) {
      newCodes = filteredCodes?.filter(country => {
        return showOnly?.find((short:any) => country?.code === short?.toUpperCase());
      });
    }
    newCodes.sort((a, b) =>
      a?.name[lang || 'en'].localeCompare(b?.name[lang || 'en']),
    );

    return newCodes;
  }, [showOnly, excludedCountries, lang]);

  const resultCountries = React.useMemo(() => {
    const lowerSearchValue = searchValue.toLowerCase();

    return codes.filter(country => {
      if (
        country?.dial_code.includes(searchValue) ||
        country?.name[lang || 'en'].toLowerCase().includes(lowerSearchValue) ||
        removeDiacritics(country?.name[lang || 'en'].toLowerCase()).includes(
          lowerSearchValue,
        )
      ) {
        return country;
      }
    });
  }, [searchValue]);

  const renderItem = ({item, index}: {item: CountryItem; index: number}) => {
    let itemName = item?.name[lang];
    let checkName = itemName?.length ? itemName : item?.name['en'];
    return (
      <TouchableOpacity style={styles.itemView} onPress={() => onClose(item)}>
        <Text style={styles.flagText}>{item.flag}</Text>
        <Text style={styles.itemText}>{checkName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <AppModal
      isOpen={true}
      backdropOpacity={0}
      swipeToClose={true}
      animationDuration={300}
      backButtonClose={true}
      backdropPressToClose={true}
      
      // style={{height: resHeight(97), width: '100%'}}
      position={'top'}
      onClosed={() => onClose()}>
      <SafeAreaView  style={[styles.container, {paddingTop: resWidth(5)}]}>
        <View  style={styles.inputContainer}>
          <TextInput
            keyboardShouldPersistTaps
            style={[styles.inputStyle, 
              { textAlign: I18nManager.isRTL ? "right" : "left" }
            ]}
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder={inputPlaceholder || 'Search your country'}
            placeholderTextColor={colors.textBlack41}
            testID="countryCodesPickerSearchInput"
            {...rest}
          />
          <TouchableOpacity
          style={[styles.close]}
          onPress={() => onClose()}>
          <CustomImage
            source={icons.close}
            style={[styles.searchIcon]}
            // type={'1'}
            resizeMode="contain"
          />
        </TouchableOpacity>
        </View>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={resultCountries || codes}
          // contentContainerStyle={{flex:1}}
          // style={{flex:1}}
          keyExtractor={(item, index) => '' + item + index}
          keyboardShouldPersistTaps="always"
          renderItem={renderItem}
        />
      </SafeAreaView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  close:{
    // alignSelf: 'flex-end',
    height: resWidth(7),
    width: resWidth(7),
    margin: scaleSize(10), 
    // marginBottom: 10, 
    // marginRight: 10,
    // position:'absolute',
    // backgroundColor:"red",
    backgroundColor: colors.btnColor,
    padding: scaleSize(9),
    // top: -10,
    borderRadius: scaleSize(200)

  },
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: resWidth(7.5),
    // borderTopRightRadius: scaleSize(40),
    margin: resWidth(4)
    // borderRadius: scaleSize(30),
    // overflow:'hidden'
    // backgroundColor: 'red',
  },

  itemText: {
    color: colors.textBlack,
    fontFamily: FontSemiBold,
    fontSize: font16,
    marginLeft: '5%',
  },

  flagText: {
    // fontSize: Fontsize.font9,
  },

  itemView: {
    paddingHorizontal: '5%',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.textBlack41,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(15),
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // height: responsiveWidth(13),
    // borderWidth: 1,
    // borderColor: colors.bgColor,
    // marginTop: scaleSize(15),
    marginBottom: scaleSize(15),
    borderRadius: scaleSize(40),
    // marginHorizontal: '2%',
    paddingHorizontal: scaleSize(10),
  },

  searchIcon: {
    width: '100%',
    height: '100%',
  },

  inputStyle: {
    flex: 1,
    padding: scaleSize(5),
    // height: '100%',
    paddingHorizontal: scaleSize(30),
    color: colors.textBlack,
    fontFamily: FontMedium,
    fontSize: font16,
    borderWidth: 1,
    borderRadius: scaleSize(40),
    borderColor: colors.textBlack41,
    // marginLeft:responsiveWidth(4)
  },
});
