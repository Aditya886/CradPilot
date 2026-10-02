import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font12, font14, font16, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import Cross from '../../assets/images/icons/cross.svg';
import { Calendar } from 'react-native-calendars';

interface CalendarModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    value: string;
    onSelectDate: (date: string) => void;
    showClear?: boolean;
    title?: string;
}

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
const toYYYYMMDD = (ddmmyyyy: string) => {
    if (!ddmmyyyy) return '';
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    return '';
};

// Helper to convert YYYY-MM-DD to DD/MM/YYYY
const toDDMMYYYY = (yyyymmdd: string) => {
    if (!yyyymmdd) return '';
    const parts = yyyymmdd.split('-');
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
    return '';
};

export default function CalendarModal({
    show,
    setShow,
    value,
    onSelectDate,
    showClear = false,
    title = 'Select Date'
}: CalendarModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        if (show) {
            // Set initial selected date
            const initialDate = toYYYYMMDD(value) || new Date().toISOString().split('T')[0];
            setSelectedDate(initialDate);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(transformY, {
                duration: 350,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        }
    }, [show, value]);

    const close = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        Animated.timing(transformY, {
            toValue: resHeight(100),
            duration: 250,
            useNativeDriver: true,
        }).start(() => setShow(false));
    };

    const handleConfirm = () => {
        if (selectedDate) {
            onSelectDate(toDDMMYYYY(selectedDate));
        }
        close();
    };

    const handleClear = () => {
        onSelectDate('');
        close();
    };

    return (
        <Modal
            transparent
            visible={show}
            animationType="none"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[styles.main, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.box,
                                { transform: [{ translateY: transformY }] } as ViewStyle,
                            ]}
                        >
                            <View style={styles.header}>
                                <CustomText style={styles.title}>{title}</CustomText>
                                <TouchableOpacity onPress={close} activeOpacity={0.7} style={styles.closeBtn}>
                                    <Cross width={resAvarage(4)} height={resAvarage(4)} fill={colors.black} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.calendarContainer}>
                                <Calendar
                                    current={selectedDate}
                                    onDayPress={(day) => setSelectedDate(day.dateString)}
                                    markedDates={{
                                        [selectedDate]: {
                                            selected: true,
                                            selectedColor: colors.black,
                                            selectedTextColor: colors.white,
                                        }
                                    }}
                                    theme={{
                                        backgroundColor: colors.bgWhite,
                                        calendarBackground: colors.bgWhite,
                                        textSectionTitleColor: colors.black,
                                        selectedDayBackgroundColor: colors.black,
                                        selectedDayTextColor: colors.white,
                                        todayTextColor: colors.black,
                                        dayTextColor: colors.black,
                                        textDisabledColor: colors.black40,
                                        dotColor: colors.theme,
                                        selectedDotColor: colors.white,
                                        arrowColor: colors.black,
                                        disabledArrowColor: colors.black20,
                                        monthTextColor: colors.black,
                                        indicatorColor: colors.black,
                                        textDayFontFamily: FontRegular,
                                        textMonthFontFamily: FontSemiBold,
                                        textDayHeaderFontFamily: FontMedium,
                                        textDayFontSize: font14,
                                        textMonthFontSize: font16,
                                        textDayHeaderFontSize: font12,
                                    }}
                                />
                            </View>

                            <View style={styles.footer}>
                                {showClear && (
                                    <TouchableOpacity onPress={handleClear} activeOpacity={0.8} style={styles.clearBtn}>
                                        <CustomText style={styles.clearBtnText}>Clear</CustomText>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={close} activeOpacity={0.8} style={styles.cancelBtn}>
                                    <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8} style={styles.confirmBtn}>
                                    <CustomText style={styles.confirmBtnText}>Confirm</CustomText>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        backgroundColor: colors.bgWhite,
        borderRadius: scaleSize(12),
        width: resWidth(90),
        paddingVertical: resAvarage(4),
        paddingHorizontal: resAvarage(3),
        gap: resAvarage(2.5),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(1),
    },
    calendarContainer: {
        borderRadius: scaleSize(8),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: resWidth(7),
        marginTop: resAvarage(2),
    },
    clearBtn: {
        marginRight: 'auto',
        borderRadius: resAvarage(100),
        borderWidth: 1.5,
        borderColor: colors.textRed,
        paddingVertical: resAvarage(2),
        paddingHorizontal: resWidth(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.textRed,
    },
    cancelBtn: {
        borderRadius: resAvarage(100),
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        paddingVertical: resAvarage(2),
        paddingHorizontal: resWidth(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black70,
    },
    confirmBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(2),
        paddingHorizontal: resWidth(5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    },
});
