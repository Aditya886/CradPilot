import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font12, font13, font14, font15, font16, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import Cross from '../../assets/images/icons/cross.svg';
import { formatINR } from '../../utils/FormatUtil';
import CalendarModal from './CalendarModal';

// Inline Svg for Calendar Icon
import Svg, { Rect, Path } from 'react-native-svg';
const CalendarIcon = (props: any) => (
    <Svg width={resAvarage(4)} height={resAvarage(4)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
        <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
);

interface AddPaymentModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    outstandingInterest: number;
    remainingPrincipal: number;
    defaultAmount?: number;
    onRecordPayment: (data: {
        amount: number;
        date: string;
        method: string;
        allocation: string;
        notes: string;
    }) => void;
}

export default function AddLoanPaymentModal({
    show,
    setShow,
    outstandingInterest,
    remainingPrincipal,
    defaultAmount,
    onRecordPayment,
}: AddPaymentModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [method, setMethod] = useState('Cash');
    const [allocation, setAllocation] = useState('Auto');
    const [notes, setNotes] = useState('');

    const methods = ['Cash', 'UPI', 'Bank', 'Cheque', 'Other'];
    const allocations = ['Auto', 'Principal', 'Interest', 'Custom'];

    const handleDateChangeText = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        cleaned = cleaned.substring(0, 8);
        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
        }
        if (cleaned.length > 4) {
            formatted = formatted.substring(0, 5) + '/' + cleaned.substring(4);
        }
        setDate(formatted);
    };

    const isButtonDisabled = !amount.trim() || !date.trim();

    useEffect(() => {
        if (show) {
            // Reset to defaults
            setAmount(defaultAmount ? String(defaultAmount) : '');
            setDate(new Date().toLocaleDateString('en-GB')); // e.g. "17/08/2026"
            setMethod('Cash');
            setAllocation('Auto');
            setNotes('');

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
    }, [show]);

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

    const handleRecord = () => {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return;
        }

        const currentTime = () => {
            const d = new Date();
            let hours = d.getHours();
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        };

        const finalDateTime = `${date.trim()} ${currentTime()}`;

        onRecordPayment({
            amount: parsedAmount,
            date: finalDateTime,
            method,
            allocation,
            notes,
        });
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
                                <CustomText style={styles.title}>Record payment</CustomText>
                                <TouchableOpacity onPress={close} activeOpacity={0.7} style={styles.closeBtn}>
                                    <Cross width={resAvarage(3.5)} height={resAvarage(3.5)} fill={colors.black} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                <View style={styles.formGroup}>
                                    <CustomText style={styles.label}>Amount received</CustomText>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={setAmount}
                                        style={styles.inputActive}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <CustomText style={styles.label}>Date</CustomText>
                                    <View style={styles.dateInputContainer}>
                                        <TextInput
                                            value={date}
                                            onChangeText={handleDateChangeText}
                                            keyboardType="numeric"
                                            placeholder="dd/mm/yyyy"
                                            placeholderTextColor={colors.black40}
                                            style={styles.dateInput}
                                        />
                                        <TouchableOpacity onPress={() => setShowCalendar(true)} activeOpacity={0.7}>
                                            <CalendarIcon style={styles.calendarIcon} stroke={colors.black} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <CustomText style={styles.label}>Payment method</CustomText>
                                    <View style={styles.pillContainer}>
                                        {methods.map((m) => {
                                            const active = method === m;
                                            return (
                                                <TouchableOpacity
                                                    key={m}
                                                    onPress={() => setMethod(m)}
                                                    activeOpacity={0.8}
                                                    style={[styles.pill, active && styles.pillActive]}
                                                >
                                                    <CustomText style={[styles.pillText, active && styles.pillTextActive]}>
                                                        {m}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <CustomText style={styles.label}>Allocate to</CustomText>
                                    <View style={styles.pillContainer}>
                                        {allocations.map((a) => {
                                            const active = allocation === a;
                                            return (
                                                <TouchableOpacity
                                                    key={a}
                                                    onPress={() => setAllocation(a)}
                                                    activeOpacity={0.8}
                                                    style={[styles.pill, active && styles.pillActive]}
                                                >
                                                    <CustomText style={[styles.pillText, active && styles.pillTextActive]}>
                                                        {a}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    <CustomText style={styles.helpText}>
                                        Clears due interest first, then reduces principal.
                                    </CustomText>
                                </View>

                                <View style={styles.formGroup}>
                                    <CustomText style={styles.label}>Notes (optional)</CustomText>
                                    <TextInput
                                        placeholder="Any context worth remembering..."
                                        placeholderTextColor={colors.black40}
                                        multiline
                                        numberOfLines={3}
                                        value={notes}
                                        onChangeText={setNotes}
                                        style={styles.notesInput}
                                    />
                                    <CustomText style={styles.helpText}>
                                        e.g. Paid after reminder · Cheque #12345
                                    </CustomText>
                                </View>

                                <View style={styles.banner}>
                                    <CustomText style={styles.bannerText}>
                                        {`Outstanding interest: ${formatINR(outstandingInterest)} · Remaining principal: ${formatINR(remainingPrincipal)}`}
                                    </CustomText>
                                </View>
                            </ScrollView>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={close} activeOpacity={0.8} style={styles.cancelBtn}>
                                    <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRecord}
                                    activeOpacity={isButtonDisabled ? 1 : 0.8}
                                    disabled={isButtonDisabled}
                                    style={[styles.recordBtn, isButtonDisabled && { backgroundColor: colors.black30 }]}
                                >
                                    <CustomText style={styles.recordBtnText}>Record payment</CustomText>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>

            <CalendarModal
                show={showCalendar}
                setShow={setShowCalendar}
                value={date}
                onSelectDate={setDate}
                title="Select Payment Date"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'flex-end',
    },
    box: {
        backgroundColor: colors.bgWhite,
        borderTopLeftRadius: scaleSize(16),
        borderTopRightRadius: scaleSize(16),
        width: '100%',
        maxHeight: '90%',
        paddingVertical: resAvarage(5),
        paddingHorizontal: resAvarage(5),
        gap: resAvarage(4),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: resAvarage(1),
    },
    title: {
        fontFamily: FontBold,
        fontSize: font18,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(1),
    },
    scrollContent: {
        gap: resAvarage(4.5),
        paddingBottom: resAvarage(3),
    },
    formGroup: {
        gap: resAvarage(1.8),
    },
    label: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black60,
    },
    inputActive: {
        borderWidth: 1.5,
        borderColor: colors.black,
        borderRadius: resAvarage(3.5),
        paddingVertical: resAvarage(3),
        paddingHorizontal: resAvarage(4),
        fontFamily: FontMedium,
        fontSize: font15,
        color: colors.black,
        backgroundColor: 'rgba(20, 20, 20, 0.02)',
    },
    dateInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        borderRadius: resAvarage(3.5),
        backgroundColor: 'rgba(20, 20, 20, 0.02)',
        paddingHorizontal: resAvarage(4),
    },
    dateInput: {
        flex: 1,
        paddingVertical: resAvarage(3),
        fontFamily: FontMedium,
        fontSize: font15,
        color: colors.black,
    },
    calendarIcon: {
        marginLeft: resAvarage(2),
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(20, 20, 20, 0.03)',
        borderRadius: resAvarage(5),
        padding: resAvarage(1),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.05)',
    },
    pill: {
        flex: 1,
        minWidth: '18%',
        paddingVertical: resAvarage(2),
        borderRadius: resAvarage(4),
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillActive: {
        backgroundColor: colors.black,
    },
    pillText: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black70,
    },
    pillTextActive: {
        color: colors.white,
    },
    helpText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
        paddingLeft: resAvarage(1),
    },
    notesInput: {
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        borderRadius: resAvarage(3.5),
        backgroundColor: 'rgba(20, 20, 20, 0.02)',
        paddingVertical: resAvarage(3),
        paddingHorizontal: resAvarage(4),
        fontFamily: FontRegular,
        fontSize: font14,
        color: colors.black,
        textAlignVertical: 'top',
    },
    banner: {
        backgroundColor: colors.theme,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        paddingHorizontal: resAvarage(5),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(1),
    },
    bannerText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: colors.textTheme,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: resWidth(3),
        marginTop: resAvarage(1.5),
    },
    cancelBtn: {
        borderRadius: resAvarage(100),
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        paddingVertical: resAvarage(2.5),
        paddingHorizontal: resWidth(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black70,
    },
    recordBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(2.5),
        paddingHorizontal: resWidth(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    },
});
