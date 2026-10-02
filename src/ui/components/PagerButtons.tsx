import React, { useRef, useState, useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../../utils/colors';
import { scaleSize } from '../../utils/responsive';
import { FontBold } from '../../utils/fontFamily';
import CustomText from './CustomText';

export default function PagerButtons({ active, setActive }: { active: boolean; setActive: (val: boolean) => void }) {
    return (
        <View style={styles.container}>
            <Button
                buttons={['Upcoming', 'Past Bookings']}
                active={active}
                onClick={setActive}
            />
        </View>
    );
}

function Button({ buttons, onClick, active }: any) {
    const [btnContainerWidth, setWidth] = useState(0);
    const btnWidth = btnContainerWidth / buttons.length;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const toValue = active ? 0 : btnWidth;
        Animated.spring(translateX, {
            toValue,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    }, [active, btnWidth]);

    return (
        <View
            style={styles.btnContainer}
            onLayout={e => setWidth(e.nativeEvent.layout.width - 2)}>
            {buttons.map((btn: string, i: number) => (
                <TouchableOpacity
                    key={btn}
                    style={styles.btn}
                    onPress={() => onClick(i === 0)}>
                    <CustomText variant="subtitle" style={styles.inActivebtn}>{btn}</CustomText>
                </TouchableOpacity>
            ))}
            <Animated.View
                style={[
                    styles.animatedBtnContainer,
                    { width: btnWidth - 4, transform: [{ translateX }] },
                ]}>
                <View style={[styles.animatedBtn, { width: btnWidth }]}>
                    <CustomText variant="subtitle" style={styles.btnTextActive}>
                        {active ? buttons[0] : buttons[1]}
                    </CustomText>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scaleSize(30),
        paddingTop: scaleSize(20),
        paddingBottom: scaleSize(20)
    },
    btnContainer: {
        height: scaleSize(40),
        borderRadius: 100,
        overflow: 'hidden',
        flexDirection: 'row',
        backgroundColor: colors.borderColor,
        width: '100%',
    },
    btn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animatedBtnContainer: {
        height: scaleSize(35),
        flexDirection: 'row',
        position: 'absolute',
        overflow: 'hidden',
        margin: scaleSize(2.5),
        borderRadius: 100,
        backgroundColor: colors.bgWhite,
    },
    animatedBtn: {
        height: scaleSize(35),
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTextActive: {
        color: colors.btnColor,
        fontFamily: FontBold,
    },
    inActivebtn: {
        color: colors.textBlack,
        fontFamily: FontBold,
    },
});
