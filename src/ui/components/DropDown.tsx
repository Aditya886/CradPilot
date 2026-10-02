import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import React, { useState, useRef } from 'react';
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from 'react-native-popup-menu';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../utils/colors';
import { resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from './CustomText';
import Down from "../../assets/images/icons/down.svg";
import { font13, font14, font15, font16 } from '../../utils/fontSizes';
import { FontRegular } from '../../utils/fontFamily';

const CloseIcon = ({ size = 8, color = colors.bgColor }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: 1.5, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: 1.5, height: size, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
};

export default function DropDown({
  data,
  label,
  labelStyle,
  placeholder,
  prefix,
  selected,
  setSelected,
  bottomText,
  boxStyle,
  listStyle,
  listWidth,
  textStyle,
  height,
  multiple = false,
}: any) {

  const [canScrollDown, setCanScrollDown] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isSelected = multiple
    ? Array.isArray(selected) && selected.length > 0
    : selected && (typeof selected === 'object' ? Object.keys(selected).length > 0 : selected !== '');

  const getDisplayName = (item: any, includePrefix: boolean = false) => {
    let displayText = '';

    if (!item || typeof item !== 'object') {
      displayText = item || 'Unknown';
    } else if (item?.name && typeof item.name === 'string') {
      displayText = item.name;
    } else if (item?.title && typeof item.title === 'string') {
      displayText = item.title;
    } else if (item?.time && typeof item.time === 'string') {
      displayText = item.time;
    } else {
      displayText = 'Select option'; // 👈 fallback for {}
    }

    if (includePrefix && prefix) {
      displayText = displayText + " " + prefix;
    }

    return displayText;
  };

  const getSelectedDisplayText = () => {
    if (multiple && Array.isArray(selected) && selected.length > 0) {
      return selected.map(item => getDisplayName(item, true)).join(', ');
    }
    if (selected && (typeof selected === 'object' ? Object.keys(selected).length > 0 : selected !== '')) {
      return getDisplayName(selected, true);
    }
    return placeholder;
  };

  const handleSelect = (item: any) => {
    if (multiple) {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const exists = currentSelected.some((x: any) => {
        if (typeof x === 'object' && typeof item === 'object') {
          return (x?._id && x?._id === item?._id) || (x?.name && x?.name === item?.name) || (x?.title && x?.title === item?.title);
        }
        return x === item;
      });

      let nextSelected;
      if (exists) {
        nextSelected = currentSelected.filter((x: any) => {
          if (typeof x === 'object' && typeof item === 'object') {
            return !((x?._id && x?._id === item?._id) || (x?.name && x?.name === item?.name) || (x?.title && x?.title === item?.title));
          }
          return x !== item;
        });
      } else {
        nextSelected = [...currentSelected, item];
      }
      setSelected(nextSelected);
    } else {
      setSelected(item);
    }
  };

  const handleContentSizeChange = (width: number, heights: number) => {
    const maxHeight = height ? height : resWidth(60);
    setCanScrollDown(heights > maxHeight);
  };

  const optionsStyles = {
    optionsContainer: {
      borderRadius: 8,
      marginTop: resWidth(13),
      padding: 5,
      width: listWidth ?? resWidth(94),
      maxHeight: height ? height : resWidth(70),
      borderWidth: 0.5,
      borderColor: colors.white30,
      backgroundColor: colors.lightBgColor,
      overflow: 'hidden',
      ...listStyle,
    },
  };

  return (
    <View style={styles.main}>

      {/* Label */}
      {label ? (
        <CustomText style={[styles.label, labelStyle]}>
          {label}
        </CustomText>
      ) : null}

      <Menu>

        {/* 🔥 Trigger */}
        <MenuTrigger>
          <View style={[
            styles.box,
            {
              width: '100%',
              minHeight: resWidth(12),
              paddingVertical: multiple && isSelected ? resWidth(1.5) : 0,
              borderColor: isSelected ? colors.white40 : colors.white30,
            },
            multiple ? { height: 'auto' } : { height: resWidth(12) },
            boxStyle
          ]}>
            {multiple && Array.isArray(selected) && selected.length > 0 ? (
              <View style={styles.chipsContainer}>
                {selected.map((item: any, idx: number) => (
                  <View key={idx} style={styles.chip}>
                    <CustomText style={styles.chipText}>
                      {getDisplayName(item)}
                    </CustomText>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.chipClose}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                    >
                      <CloseIcon size={resWidth(2)} color={colors.bgColor} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <CustomText
                numberOfLines={1}
                style={[
                  styles.triggerText,
                  { color: isSelected ? colors.textWhite : (colors.white70 || '#A0A0A0') },
                  textStyle
                ]}
              >
                {getSelectedDisplayText()}
              </CustomText>
            )}

            <Down width={resAvarage(3.5)} height={resAvarage(3.5)} style={{ marginLeft: resWidth(2) }} />
          </View>
        </MenuTrigger>

        {/* 🔽 Options */}
        <MenuOptions customStyles={optionsStyles}>
          <View>
            <FlatList
              ref={flatListRef}
              data={data}
              keyExtractor={(item, index) => item?._id || index.toString()}
              renderItem={({ item }) => {
                const itemSelected = multiple
                  ? (Array.isArray(selected) && selected.some((x: any) => {
                    if (typeof x === 'object' && typeof item === 'object') {
                      return (x?._id && x?._id === item?._id) || (x?.name && x?.name === item?.name) || (x?.title && x?.title === item?.title);
                    }
                    return x === item;
                  }))
                  : (selected === item || (selected && typeof selected === 'object' && typeof item === 'object' && (selected._id === item._id || selected.name === item.name)));

                return (
                  <MenuOption
                    onSelect={() => {
                      handleSelect(item);
                      return !multiple; // Returning false keeps menu open in react-native-popup-menu
                    }}
                    closeOnSelect={!multiple}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: resWidth(4) }}>
                      <CustomText style={[styles.optionText, itemSelected && { color: colors.btnColor }]}>
                        {getDisplayName(item, true)}
                      </CustomText>
                      {multiple && itemSelected && (
                        <CustomText style={{ color: colors.btnColor, fontSize: font15 }}>✓</CustomText>
                      )}
                    </View>
                  </MenuOption>
                );
              }}
              onContentSizeChange={handleContentSizeChange}
            />
            {/* Bottom scroll indicator */}
            {canScrollDown && (
              <View style={[styles.scrollIndicator, styles.bottomIndicator]}>
                <Down width={resAvarage(3)} height={resAvarage(3)} />
              </View>
            )}
          </View>
        </MenuOptions>
      </Menu>
      {bottomText && <CustomText style={styles.bottomtext} >{bottomText}</CustomText>}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomtext: {
    fontSize: font14,
    fontFamily: FontRegular,
    color: colors.white70,
    marginTop: scaleSize(6),
    width: resWidth(94),
    alignSelf: 'center',
  },
  main: {
    marginVertical: resWidth(2),
    width: resWidth(94),
    alignSelf: 'center',
  },
  label: {
    color: colors.white,
    fontSize: font16,
    fontFamily: FontRegular,
    lineHeight: font16 * 1.3,
    marginBottom: scaleSize(6),
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.white30,
    borderRadius: scaleSize(8),
    paddingHorizontal: resWidth(4),
  },
  triggerText: {
    flex: 1,
  },
  optionText: {
    fontSize: font16,
    paddingVertical: resWidth(2),
    color: colors.textWhite,
  },
  bottomIndicator: {
    bottom: 5,
    zIndex: 1000,
    alignSelf: 'center',
    borderRadius: 10,
  },
  scrollIcon: {
    width: scaleSize(15),
    height: scaleSize(15),
    resizeMode: 'contain',
  },
  scrollIndicator: {
    position: 'absolute',
    height: resWidth(5),
    width: resWidth(10),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topIndicator: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    paddingRight: resWidth(2),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBgColor,
    borderRadius: resWidth(1.5),
    paddingHorizontal: resWidth(2.5),
    paddingVertical: resWidth(1),
    margin: resWidth(0.8),
  },
  chipText: {
    fontSize: font13,
    color: colors.textWhite,
    fontFamily: FontRegular,
  },
  chipClose: {
    marginLeft: resWidth(1.5),
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: 999,
    width: resWidth(4.2),
    height: resWidth(4.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
});