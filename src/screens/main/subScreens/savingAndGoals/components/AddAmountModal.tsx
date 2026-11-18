import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font12, font13, font14, font16, font20 } from '../../../../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../../../../utils/responsive';
import { ShowToast } from '../../../../../utils/CustomToast/ToastManager';
import { update, insert } from '../../../../../storage/local/sqlite';
import { useAddContributionMutation } from '../../../../../API';
import { GoalItem } from './GoalCard';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke="#141414" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

interface AddAmountModalProps {
    visible: boolean;
    goal: GoalItem | null;
    initialMode?: 'add' | 'deduct';
    onClose: () => void;
    onSuccess: () => void;
}

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];

export default function AddAmountModal({
    visible,
    goal,
    initialMode = 'add',
    onClose,
    onSuccess,
}: AddAmountModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(resHeight(30))).current;
    const [addContributionApi, { isLoading: isSubmitting }] = useAddContributionMutation();

    const [mode, setMode] = useState<'add' | 'deduct'>('add');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>('amount');

    useEffect(() => {
        if (visible) {
            setMode(initialMode);
            setAmount('');
            setNotes('');
            setFocusedField('amount');

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, initialMode]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: resHeight(25),
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    const handleChipPress = (val: number) => {
        setAmount(val.toString());
    };

    const handleSubmit = async () => {
        if (!goal) return;

        const parsedAmount = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            ShowToast('Please enter a valid amount', 'error');
            return;
        }

        const currentSaved = goal.saved || 0;

        if (mode === 'deduct') {
            if (parsedAmount > currentSaved) {
                ShowToast(`Cannot deduct more than currently saved (₹${currentSaved.toLocaleString('en-IN')})`, 'error');
                return;
            }
            const newSaved = Math.max(0, currentSaved - parsedAmount);
            const newStatus = newSaved < goal.target && goal.status === 'done' ? 'active' : (goal.status || 'active');

            const payload = {
                id: String(goal.id),
                amount: -parsedAmount,
                notes: notes.trim() || 'Amount deducted',
            };

            const res: any = await addContributionApi(payload);
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                ShowToast(res?.data?.message || `Deducted ₹${parsedAmount.toLocaleString('en-IN')} from paid amount for ${goal.title}`, 'info');

                try {
                    update('goals', goal.id, {
                        saved: newSaved,
                        status: newStatus,
                    });
                } catch (err) {}

                try {
                    insert('goal_contributions', {
                        goal_id: goal.id,
                        amount: -parsedAmount,
                        date: new Date().toLocaleDateString('en-GB'),
                        notes: notes.trim() || 'Amount deducted',
                    });
                } catch (err) {}

                handleClose();
                onSuccess();
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to update amount', 'error');
                return;
            }
        } else {
            // Mode === 'add'
            const newSaved = currentSaved + parsedAmount;
            const newStatus = newSaved >= goal.target ? 'done' : (goal.status || 'active');

            const payload = {
                id: String(goal.id),
                amount: parsedAmount,
                notes: notes.trim() || 'Amount added to paid',
            };

            const res: any = await addContributionApi(payload);
            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                ShowToast(res?.data?.message || `Added ₹${parsedAmount.toLocaleString('en-IN')} to paid amount for ${goal.title}`, 'success');

                try {
                    update('goals', goal.id, {
                        saved: newSaved,
                        status: newStatus,
                    });
                } catch (err) {}

                try {
                    insert('goal_contributions', {
                        goal_id: goal.id,
                        amount: parsedAmount,
                        date: new Date().toLocaleDateString('en-GB'),
                        notes: notes.trim() || 'Amount added to paid',
                    });
                } catch (err) {}

                handleClose();
                onSuccess();
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to update amount', 'error');
                return;
            }
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.dialogCard,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <ScrollView
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <CustomText style={styles.headerTitle} numberOfLines={1}>
                                {mode === 'add' ? 'Add amount' : 'Deduct amount'}
                            </CustomText>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleClose}
                                style={styles.closeBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>

                        {/* Mode Segment Switcher */}
                        <View style={styles.modeSwitcher}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setMode('add')}
                                style={[
                                    styles.modeTab,
                                    mode === 'add' && styles.activeModeTab,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.modeTabText,
                                        mode === 'add' && styles.activeModeTabText,
                                    ]}
                                >
                                    + Add
                                </CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setMode('deduct')}
                                style={[
                                    styles.modeTab,
                                    mode === 'deduct' && styles.activeModeTab,
                                ]}
                            >
                                <CustomText
                                    style={[
                                        styles.modeTabText,
                                        mode === 'deduct' && styles.activeModeTabText,
                                    ]}
                                >
                                    - Deduct
                                </CustomText>
                            </TouchableOpacity>
                        </View>

                        {/* Goal Name Hint */}
                        {goal && (
                            <CustomText style={styles.goalHint} numberOfLines={1}>
                                For: <CustomText style={styles.goalHintBold}>{goal.title}</CustomText> (Saved: ₹{(goal.saved || 0).toLocaleString('en-IN')})
                            </CustomText>
                        )}

                        {/* Amount Input */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'amount' && styles.focusedInput,
                            ]}
                            placeholder="Amount"
                            placeholderTextColor="#8E8E93"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            onFocus={() => setFocusedField('amount')}
                            autoFocus
                        />

                        {/* Quick Amount Suggestion Chips */}
                        <View style={styles.chipsRow}>
                            {QUICK_AMOUNTS.map((val) => {
                                const isSelected = amount === val.toString();
                                return (
                                    <TouchableOpacity
                                        key={val}
                                        activeOpacity={0.75}
                                        onPress={() => handleChipPress(val)}
                                        style={[
                                            styles.chip,
                                            isSelected && styles.selectedChip,
                                        ]}
                                    >
                                        <CustomText
                                            style={[
                                                styles.chipText,
                                                isSelected && styles.selectedChipText,
                                            ]}
                                        >
                                            ₹{val.toLocaleString('en-IN')}
                                        </CustomText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Optional Notes Input */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'notes' && styles.focusedInput,
                            ]}
                            placeholder="Note e.g. Salary, gift, expense (optional)"
                            placeholderTextColor="#8E8E93"
                            value={notes}
                            onChangeText={setNotes}
                            onFocus={() => setFocusedField('notes')}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleSubmit}
                            style={styles.actionButton}
                        >
                            <CustomText style={styles.actionButtonText}>
                                {mode === 'add' ? 'Add amount' : 'Deduct amount'}
                            </CustomText>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: resWidth(4),
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    dialogCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: resAvarage(5),
        paddingHorizontal: resWidth(5),
        paddingTop: resAvarage(3),
        paddingBottom: resAvarage(3),
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        maxHeight: resHeight(85),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: resAvarage(2),
    },
    headerTitle: {
        flex: 1,
        fontSize: font20,
        fontFamily: FontBold,
        color: '#141414',
    },
    closeBtn: {
        padding: 4,
    },
    modeSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 3,
        marginBottom: 14,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    activeModeTab: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    modeTabText: {
        fontSize: font13,
        fontFamily: FontMedium,
        color: '#666666',
    },
    activeModeTabText: {
        color: '#141414',
        fontFamily: FontBold,
    },
    goalHint: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: '#777777',
        marginBottom: 12,
    },
    goalHintBold: {
        fontFamily: FontSemiBold,
        color: '#141414',
    },
    input: {
        height: 52,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#141414',
        marginBottom: 14,
    },
    focusedInput: {
        borderColor: '#141414',
        backgroundColor: '#FFFFFF',
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        backgroundColor: '#FFFFFF',
    },
    selectedChip: {
        backgroundColor: '#141414',
        borderColor: '#141414',
    },
    chipText: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: '#141414',
    },
    selectedChipText: {
        color: '#FFFFFF',
    },
    actionButton: {
        height: 52,
        backgroundColor: '#0D0D0D',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    actionButtonText: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: '#FFFFFF',
    },
});
