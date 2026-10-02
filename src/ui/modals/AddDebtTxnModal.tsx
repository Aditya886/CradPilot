import { View, Modal, StyleSheet, Animated, TouchableWithoutFeedback, ViewStyle, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font12, font13, font14, font15, font16, font18 } from '../../utils/fontSizes';
import { resHeight, resAvarage, resWidth, scaleSize } from '../../utils/responsive';
import CustomText from '../components/CustomText';
import CustomInput from '../components/CustomInput';
import ButtonSlider from '../components/ButtonSlider';
import Cross from '../../assets/images/icons/cross.svg';
import Down from '../../assets/images/icons/down.svg';
import CalendarModal from './CalendarModal';
import { insert } from '../../storage/local/sqlite';
import Toast from 'react-native-toast-message';
import { syncNotifications } from '../../services/localNotificationService';

// Inline Svg for Calendar Icon
import Svg, { Rect, Path } from 'react-native-svg';
const CalendarIcon = (props: any) => (
    <Svg width={resAvarage(4)} height={resAvarage(4)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
        <Path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
);

interface AddDebtTxnModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    persons: Array<{ id: number; name: string; phone: string }>;
    onAddSuccess: () => void;
    onAddPersonPress: () => void;
}

export default function AddDebtTxnModal({
    show,
    setShow,
    persons,
    onAddSuccess,
    onAddPersonPress,
}: AddDebtTxnModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(100))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('You Lent'); // 'You Lent', 'You Borrowed', 'Settle'
    const [method, setMethod] = useState('Cash'); // 'Cash', 'UPI', 'Bank', 'Card'
    const [date, setDate] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [notes, setNotes] = useState('');
    const [showPersonDropdown, setShowPersonDropdown] = useState(false);

    const types = ['You Lent', 'You Borrowed', 'Settle'];
    const methods = ['Cash', 'UPI', 'Bank', 'Card'];

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

    const isButtonDisabled = !selectedPerson || !amount.trim() || !date.trim();

    useEffect(() => {
        console.log('[AddDebtTxnModal] useEffect show changed:', show);
        if (show) {
            if (persons && persons.length === 1) {
                setSelectedPerson(persons[0]);
            } else {
                setSelectedPerson(null);
            }
            setAmount('');
            setType('You Lent');
            setMethod('Cash');
            setDate(new Date().toLocaleDateString('en-GB'));
            setNotes('');
            setShowPersonDropdown(false);

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

    const handleSave = () => {
        if (isButtonDisabled) return;

        const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Amount',
                text2: 'Please enter a valid amount.',
            });
            return;
        }

        // Map UI type to database type
        let dbType = 'outgoing';
        if (type === 'You Borrowed') {
            dbType = 'incoming';
        } else if (type === 'Settle') {
            dbType = 'done';
        }

        try {
            insert('debt_transactions', {
                person_id: selectedPerson.id,
                amount: parsedAmount,
                type: dbType,
                date: date.trim(),
                mode: method,
                notes: notes.trim() || null,
            });

            // Sync notifications
            syncNotifications();

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Transaction added successfully!',
            });

            onAddSuccess();
            close();
        } catch (error) {
            console.error('Error adding debt transaction:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to record transaction.',
            });
        }
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
                                <CustomText style={styles.title}>Add Transaction</CustomText>
                                <TouchableOpacity onPress={close} activeOpacity={0.7} style={styles.closeBtn}>
                                    <Cross width={resAvarage(3.5)} height={resAvarage(3.5)} fill={colors.black} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                                <View style={styles.dropdownContainer}>
                                    <View style={styles.dropdownLabelRow}>
                                        <CustomText style={styles.label}>Select Person</CustomText>
                                        <TouchableOpacity onPress={onAddPersonPress} activeOpacity={0.7} style={styles.addPersonInlineBtn}>
                                            <CustomText style={styles.addPersonInlineText}>+ Add New</CustomText>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => setShowPersonDropdown(!showPersonDropdown)}
                                        style={styles.dropdownTrigger}
                                    >
                                        <CustomText style={{ 
                                            fontFamily: FontMedium, 
                                            fontSize: font14, 
                                            color: selectedPerson ? colors.black : colors.black60 
                                        }}>
                                            {selectedPerson ? selectedPerson.name : "Select contact"}
                                        </CustomText>
                                        <Down width={resAvarage(3.5)} height={resAvarage(3.5)} fill={colors.black} />
                                    </TouchableOpacity>

                                    {showPersonDropdown && (
                                        <View style={styles.dropdownList}>
                                            {persons.length === 0 ? (
                                                <CustomText style={styles.dropdownEmptyText}>No persons added yet.</CustomText>
                                            ) : (
                                                <ScrollView style={{ maxHeight: resHeight(18) }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                                    {persons.map((p) => (
                                                        <TouchableOpacity
                                                            key={p.id}
                                                            style={styles.dropdownItem}
                                                            onPress={() => {
                                                                setSelectedPerson(p);
                                                                setShowPersonDropdown(false);
                                                            }}
                                                        >
                                                            <CustomText style={styles.dropdownItemText}>{p.name}</CustomText>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                        </View>
                                    )}
                                </View>

                                <CustomInput
                                    label="Amount"
                                    placeholder="₹"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                    containerWidth={resWidth(82)}
                                />

                                <ButtonSlider
                                    label="Transaction Type"
                                    options={types}
                                    value={type}
                                    onSelect={setType}
                                    sliderWidth={resWidth(82)}
                                />

                                <ButtonSlider
                                    label="Payment Mode"
                                    options={methods}
                                    value={method}
                                    onSelect={setMethod}
                                    sliderWidth={resWidth(82)}
                                />

                                <CustomInput
                                    label="Transaction date"
                                    placeholder="dd/mm/yyyy"
                                    value={date}
                                    onChangeText={handleDateChangeText}
                                    onPress={() => setShowCalendar(true)}
                                    Sufix={CalendarIcon}
                                    containerWidth={resWidth(82)}
                                />

                                <CustomInput
                                    label="Notes (optional)"
                                    placeholder="Add descriptions..."
                                    value={notes}
                                    onChangeText={setNotes}
                                    containerWidth={resWidth(82)}
                                />
                            </ScrollView>

                            <View style={styles.footer}>
                                <TouchableOpacity onPress={close} activeOpacity={0.8} style={styles.cancelBtn}>
                                    <CustomText style={styles.cancelBtnText}>Cancel</CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    activeOpacity={isButtonDisabled ? 1 : 0.8}
                                    disabled={isButtonDisabled}
                                    style={[styles.recordBtn, isButtonDisabled && { backgroundColor: colors.black30 }]}
                                >
                                    <CustomText style={styles.recordBtnText}>Add Transaction</CustomText>
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
                title="Select Transaction Date"
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
        gap: resAvarage(3),
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
    scrollContent: {
        gap: resAvarage(3),
        paddingBottom: resAvarage(5),
    },
    dropDownBox: {
        width: resWidth(82),
        alignSelf: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: resWidth(4),
        marginTop: resAvarage(1),
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black70,
    },
    recordBtn: {
        flex: 1,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.white,
    },
    dropdownContainer: {
        width: resWidth(82),
        alignSelf: 'center',
        gap: resAvarage(1),
        marginBottom: resAvarage(1),
    },
    dropdownLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        borderRadius: scaleSize(8),
        paddingHorizontal: resWidth(4),
        height: resWidth(12),
        backgroundColor: colors.white,
    },
    dropdownList: {
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        borderRadius: scaleSize(8),
        backgroundColor: colors.white,
        maxHeight: resHeight(20),
        marginTop: resAvarage(0.5),
        overflow: 'hidden',
        zIndex: 999,
    },
    dropdownItem: {
        paddingVertical: resAvarage(2.5),
        paddingHorizontal: resWidth(4),
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(20, 20, 20, 0.05)',
    },
    dropdownItemText: {
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.black,
    },
    dropdownEmptyText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: colors.black60,
        textAlign: 'center',
        paddingVertical: resAvarage(4),
    },
    addPersonInlineBtn: {
        paddingVertical: resAvarage(0.5),
        paddingHorizontal: resWidth(2),
    },
    addPersonInlineText: {
        fontFamily: FontSemiBold,
        fontSize: font13,
        color: colors.textTheme,
    },
});
