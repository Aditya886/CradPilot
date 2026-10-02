import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    Animated,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import { font12, font14, font15, font18 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../utils/responsive';

const CloseIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

export interface AddSpendModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    people?: string[];
    onAddSpend?: (data: {
        title: string;
        amount: number;
        paidBy: string;
        payerAmounts?: { person: string; amount: number }[];
    }) => void;
}

export default function AddSpendModal({
    show,
    setShow,
    people = ['a', 'b', 'me'],
    onAddSpend,
}: AddSpendModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(50))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
    const [payerAmounts, setPayerAmounts] = useState<{ [person: string]: string }>({});
    const [titleFocused, setTitleFocused] = useState(false);
    const [amountFocused, setAmountFocused] = useState(false);
    const [focusedPayer, setFocusedPayer] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            setTitle('');
            setAmount('');
            const initialPayer = people && people.length > 0 ? [people[0]] : ['a'];
            setSelectedPayers(initialPayer);
            setPayerAmounts({});

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(transformY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [show, people]);

    const close = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(transformY, {
                toValue: resHeight(50),
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => setShow(false));
    };

    const togglePayer = (person: string) => {
        let updated: string[];
        if (selectedPayers.includes(person)) {
            if (selectedPayers.length === 1) {
                return;
            }
            updated = selectedPayers.filter(p => p !== person);
        } else {
            updated = [...selectedPayers, person];
        }
        setSelectedPayers(updated);

        if (updated.length > 1) {
            const total = parseFloat(amount);
            if (!isNaN(total) && total > 0) {
                const equalShare = (total / updated.length).toFixed(2);
                const newPayerAmounts: { [key: string]: string } = {};
                updated.forEach(p => {
                    newPayerAmounts[p] = equalShare;
                });
                setPayerAmounts(newPayerAmounts);
            }
        } else {
            setPayerAmounts({});
        }
    };

    const handleTotalAmountChange = (text: string) => {
        setAmount(text);
        const total = parseFloat(text);
        if (selectedPayers.length > 1 && !isNaN(total) && total > 0) {
            const equalShare = (total / selectedPayers.length).toFixed(2);
            const newPayerAmounts: { [key: string]: string } = {};
            selectedPayers.forEach(p => {
                newPayerAmounts[p] = equalShare;
            });
            setPayerAmounts(newPayerAmounts);
        }
    };

    const handlePayerAmountChange = (person: string, text: string) => {
        const newPayerAmounts = { ...payerAmounts, [person]: text };
        setPayerAmounts(newPayerAmounts);

        let sum = 0;
        selectedPayers.forEach(p => {
            const val = parseFloat(newPayerAmounts[p]);
            if (!isNaN(val)) {
                sum += val;
            }
        });
        setAmount(sum > 0 ? sum.toString() : '');
    };

    const handleAdd = () => {
        const parsedAmount = parseFloat(amount);
        if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
            return;
        }

        if (selectedPayers.length > 1) {
            const breakdown = selectedPayers.map(p => ({
                person: p,
                amount: parseFloat(payerAmounts[p]) || 0,
            })).filter(p => p.amount > 0);

            onAddSpend?.({
                title: title.trim(),
                amount: parsedAmount,
                paidBy: selectedPayers.join(', '),
                payerAmounts: breakdown,
            });
        } else {
            onAddSpend?.({
                title: title.trim(),
                amount: parsedAmount,
                paidBy: selectedPayers[0] || 'a',
            });
        }

        close();
    };

    const parsedTotal = parseFloat(amount);
    const isMultiple = selectedPayers.length > 1;

    let isSubmitDisabled = !title.trim() || !amount.trim() || isNaN(parsedTotal) || parsedTotal <= 0 || selectedPayers.length === 0;

    if (isMultiple) {
        const sumPayers = selectedPayers.reduce((acc, p) => acc + (parseFloat(payerAmounts[p]) || 0), 0);
        if (sumPayers <= 0) {
            isSubmitDisabled = true;
        }
    }

    return (
        <Modal
            transparent
            visible={show}
            animationType="none"
            onRequestClose={close}
        >
            <TouchableWithoutFeedback onPress={close}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    transform: [{ translateY: transformY }],
                                },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <CustomText style={styles.headerTitle}>Add spend</CustomText>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={close}
                                    style={styles.closeBtn}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <CloseIcon color={colors.black} size={resAvarage(3.2)} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                {/* Inputs */}
                                <View
                                    style={[
                                        styles.inputContainer,
                                        titleFocused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="What for? (flights, dinner...)"
                                        placeholderTextColor="#8E8E93"
                                        value={title}
                                        onChangeText={setTitle}
                                        onFocus={() => setTitleFocused(true)}
                                        onBlur={() => setTitleFocused(false)}
                                        allowFontScaling={false}
                                    />
                                </View>

                                <View
                                    style={[
                                        styles.inputContainer,
                                        amountFocused && styles.inputFocused,
                                        { marginTop: resAvarage(1.8) },
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Amount (₹)"
                                        placeholderTextColor="#8E8E93"
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={handleTotalAmountChange}
                                        onFocus={() => setAmountFocused(true)}
                                        onBlur={() => setAmountFocused(false)}
                                        allowFontScaling={false}
                                    />
                                </View>

                                {/* PAID BY section */}
                                <CustomText style={styles.sectionLabel}>PAID BY</CustomText>
                                <View style={styles.chipsRow}>
                                    {people.map((person) => {
                                        const isSelected = selectedPayers.includes(person);
                                        return (
                                            <TouchableOpacity
                                                key={person}
                                                activeOpacity={0.8}
                                                onPress={() => togglePayer(person)}
                                                style={[
                                                    styles.chip,
                                                    isSelected ? styles.chipSelected : styles.chipUnselected,
                                                ]}
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.chipText,
                                                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                                                    ]}
                                                >
                                                    {person}
                                                </CustomText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* MULTIPLE PAYERS BREAKDOWN */}
                                {isMultiple && (
                                    <View style={styles.multiplePayersSection}>
                                        <CustomText style={styles.sectionLabel}>PAYER BREAKDOWN</CustomText>
                                        {selectedPayers.map((person) => {
                                            const isFocused = focusedPayer === person;
                                            return (
                                                <View key={person} style={styles.payerAmountBlock}>
                                                    <CustomText style={styles.payerNameLabel}>{person}</CustomText>
                                                    <View
                                                        style={[
                                                            styles.inputContainer,
                                                            isFocused && styles.inputFocused,
                                                            { marginTop: resAvarage(0.5) },
                                                        ]}
                                                    >
                                                        <TextInput
                                                            style={styles.input}
                                                            placeholder={`Amount paid by ${person} (₹)`}
                                                            placeholderTextColor="#8E8E93"
                                                            keyboardType="numeric"
                                                            value={payerAmounts[person] || ''}
                                                            onChangeText={(text) => handlePayerAmountChange(person, text)}
                                                            onFocus={() => setFocusedPayer(person)}
                                                            onBlur={() => setFocusedPayer(null)}
                                                            allowFontScaling={false}
                                                        />
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleAdd}
                                    disabled={isSubmitDisabled}
                                    style={[
                                        styles.submitBtn,
                                        isSubmitDisabled && styles.submitBtnDisabled,
                                    ]}
                                >
                                    <CustomText style={styles.submitBtnText}>Add</CustomText>
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: resAvarage(3),
    },
    card: {
        width: resWidth(92),
        maxHeight: resHeight(80),
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: resAvarage(3),
    },
    headerTitle: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
    },
    closeBtn: {
        padding: resAvarage(0.5),
    },
    inputContainer: {
        backgroundColor: '#F7F8FA',
        borderRadius: resAvarage(3),
        borderWidth: 1.2,
        borderColor: 'transparent',
        paddingHorizontal: resAvarage(3.5),
        height: resAvarage(7.5),
        justifyContent: 'center',
    },
    inputFocused: {
        borderColor: colors.black,
        backgroundColor: colors.white,
    },
    input: {
        fontSize: font15,
        fontFamily: FontRegular,
        color: colors.black,
        padding: 0,
    },
    sectionLabel: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        letterSpacing: resAvarage(0.3),
        textTransform: 'uppercase',
        marginTop: resAvarage(2.5),
        marginBottom: resAvarage(1.5),
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: resAvarage(2),
        marginBottom: resAvarage(2.5),
    },
    chip: {
        minWidth: resAvarage(7.5),
        height: resAvarage(7.5),
        borderRadius: resAvarage(100),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: resAvarage(3),
    },
    chipSelected: {
        backgroundColor: colors.black,
    },
    chipUnselected: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E8EBEF',
    },
    chipText: {
        fontSize: font14,
        fontFamily: FontMedium,
    },
    chipTextSelected: {
        color: colors.white,
    },
    chipTextUnselected: {
        color: colors.black,
    },
    multiplePayersSection: {
        marginBottom: resAvarage(2),
    },
    payerAmountBlock: {
        marginBottom: resAvarage(1.5),
    },
    payerNameLabel: {
        fontSize: font14,
        fontFamily: FontBold,
        color: colors.black,
        marginTop: resAvarage(0.5),
    },
    submitBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        height: resAvarage(8),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(1.5),
    },
    submitBtnDisabled: {
        opacity: 0.5,
    },
    submitBtnText: {
        color: colors.white,
        fontSize: font15,
        fontFamily: FontMedium,
    },
});

