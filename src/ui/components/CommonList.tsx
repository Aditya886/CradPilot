// import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
// import React, { useRef, useEffect } from 'react';
// import { FontBold, FontRegular } from '../../../utils/fontFamily';
// import { font15, font16 } from '../../../utils/fontSizes';
// import { resWidth, scaleSize } from '../../../utils/responsive';
// import SkeletonComponent from '../../../utils/SkeletonComponent';
// import CustomText from '../CustomText';
// import { colors } from '../../../utils/colors';

// export default function CommonList({
//     selected,
//     setSelected,
//     data,
//     itemStyle,
//     style,
//     containerStyle,
//     // all,
//     load,
// }: any) {
//     const flatListRef = useRef<FlatList>(null);
//     const isSelected = (item: any) => {
//         if (selected?.id === item?.id) return true;
//         if (item?.name === 'All' && !selected?.id) return true;
//         return false;
//     };

//     return (
//         <View>
//             <FlatList
//                 // ref={flatListRef}
//                 data={data}
//                 horizontal
//                 scrollEnabled={!load}
//                 showsHorizontalScrollIndicator={false}
//                 style={style}
//                 contentContainerStyle={[styles.main, containerStyle]}
//                 renderItem={({ item }: any) =>
//                     load ? (
//                         <SkeletonComponent
//                             height={resWidth(8)}
//                             width={resWidth(20)}
//                             borderRadius={resWidth(80)}
//                             style={{
//                                 marginRight: scaleSize(10),
//                                 marginVertical: scaleSize(22),
//                                 borderWidth: 1,
//                                 borderColor: colors.bgColor,
//                             }}
//                         />
//                     ) : (
//                         <TouchableOpacity
//                             activeOpacity={0.5}
//                             onPress={() => setSelected(item)}
//                             style={[
//                                 styles.buttonView,
//                                 isSelected(item) && {
//                                     borderColor: colors.primery,
//                                 },
//                                 itemStyle
//                             ]}
//                         >
//                             <CustomText
//                                 style={[
//                                     styles.text,
//                                     isSelected(item) && { color: colors.primery },
//                                 ]}
//                             >
//                                 {item?.name}
//                             </CustomText>
//                         </TouchableOpacity>
//                     )
//                 }
//                 keyExtractor={(item) => item?.id?.toString() || 'all'}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     main: {
//         // flex: 1,
//         // paddingLeft: scaleSize(20),
//     },
//     buttonView: {
//         borderRadius: resWidth(100),
//         marginVertical: scaleSize(20),
//         borderWidth: 1,
//         borderColor: colors.borderColor,
//         paddingHorizontal: scaleSize(18),
//         paddingVertical: scaleSize(9),
//         marginRight: scaleSize(10),
//     },
//     text: {
//         fontSize: font15,
//         fontFamily: FontBold,
//         color: colors.textBlack,
//     },
// });

import {
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useRef } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import { font14, font15 } from '../../utils/fontSizes';
import { resWidth, scaleSize, resAvarage } from '../../utils/responsive';
import SkeletonComponent from '../../utils/SkeletonComponent';
import CustomText from './CustomText';



export default function CommonList({
    selected,
    setSelected,
    data,
    itemStyle,
    style,
    containerStyle,
    load,
}: any) {
    const flatListRef = useRef<FlatList>(null);

    const isSelected = (item: any) => {
        if (selected?.id === item?.id) return true;
        if (item?.name === 'All' && !selected?.id) return true;
        return false;
    };

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={data}
                horizontal
                scrollEnabled={!load}
                showsHorizontalScrollIndicator={false}
                style={style}
                contentContainerStyle={[styles.main, containerStyle]}
                renderItem={({ item }: any) =>
                    load ? (
                        <SkeletonComponent
                            height={resWidth(8)}
                            width={resWidth(20)}
                            borderRadius={resWidth(80)}
                            style={{
                                marginRight: scaleSize(10),
                                marginVertical: scaleSize(22),
                                borderWidth: 1,
                                borderColor: colors.bgColor,
                            }}
                        />
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setSelected(item)}
                        >
                            {isSelected(item) ? (
                                <LinearGradient
                                    colors={[colors.black, colors.black]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.buttonView,
                                        styles.selectedButton,
                                        itemStyle,
                                    ]}
                                >
                                    <View style={{
                                        paddingHorizontal: scaleSize(18),
                                        paddingVertical: scaleSize(11),
                                    }} >
                                        <CustomText
                                            style={[
                                                styles.text,
                                                styles.selectedText,
                                            ]}
                                        >
                                            {item?.name}
                                        </CustomText>
                                    </View>
                                </LinearGradient>
                            ) : (
                                <View
                                    style={[
                                        styles.buttonView,
                                        itemStyle,
                                    ]}
                                >

                                    <View style={[styles.row, {
                                        paddingHorizontal: !!item?.count ? scaleSize(5) : scaleSize(18),
                                        paddingVertical: scaleSize(11),
                                    }, !!item?.count && { paddingLeft: scaleSize(18), paddingVertical: scaleSize(7) }]}>
                                        <CustomText style={styles.text}>
                                            {item?.name}
                                        </CustomText>

                                        {!!item?.count && (
                                            <View style={styles.countView}>
                                                <CustomText style={styles.countText}>
                                                    {item?.count}
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                }
                keyExtractor={(item) =>
                    item?.id?.toString() || 'all'
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        paddingHorizontal: resAvarage(3),
        gap: resAvarage(2)
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    countView: {
        width: resWidth(7),
        height: resWidth(7),
        borderRadius: resAvarage(50),
        backgroundColor: colors.black30,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: scaleSize(8),
    },
    countText: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.textBlack,
    },

    buttonView: {
        borderRadius: resWidth(100),
        marginTop: scaleSize(15),
        marginBottom: scaleSize(20),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.black10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    selectedButton: {
        borderWidth: 0,
    },

    text: {
        fontSize: font15,
        fontFamily: FontMedium,
        color: colors.textBlack,
    },

    selectedText: {
        color: colors.white,
    },
});