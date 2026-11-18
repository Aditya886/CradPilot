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
} from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font13, font14, font16, font20 } from '../../../../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../../../../utils/responsive';
import { ShowToast } from '../../../../../utils/CustomToast/ToastManager';
import { update, insert } from '../../../../../storage/local/sqlite';
import { useUpdateGoalMutation } from '../../../../../API';
import { GoalItem } from './GoalCard';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke="#141414" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

interface AddContributionModalProps {
    visible: boolean;
    goal: GoalItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

const QUICK_AMOUNTS = [500, 1000, 5000];

export default function AddContributionModal({
    visible,
    goal,
    onClose,
    onSuccess,
}: AddContributionModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(resHeight(30))).current;
    const [updateGoalApi, { isLoading: isUpdating }] = useUpdateGoalMutation();

    const [amount, setAmount] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (visible) {
            setAmount('');
            setIsFocused(false);

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
    }, [visible]);

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

    const handleAddContribution = async () => {
        if (!goal) return;

        const parsedAmount = parseFloat(amount.replace(/,/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            ShowToast('Please enter a valid amount', 'error');
            return;
        }

        try {
            // "Add contribution means adding in total amount not in paid amount"
            const currentTarget = goal.target || 0;
            const newTarget = currentTarget + parsedAmount;
            const currentSaved = goal.saved || 0;
            const newStatus = currentSaved >= newTarget ? 'done' : 'active';

            // 1. Update Backend API
            const res: any = await updateGoalApi({
                id: String(goal.id),
                body: { target: newTarget },
            });

            if (res?.data?.success || (res?.data && !res?.error)) {
                console.log("res -----", res);
                // 2. Update Goal's total target amount in SQLite
                update('goals', goal.id, {
                    target: newTarget,
                    status: newStatus,
                });

                // Insert into goal_contributions
                try {
                    insert('goal_contributions', {
                        goal_id: goal.id,
                        amount: parsedAmount,
                        date: new Date().toLocaleDateString('en-GB'),
                        notes: 'Added to total amount',
                    });
                } catch (err) {}

                ShowToast(res?.data?.message || `Added ₹${parsedAmount.toLocaleString('en-IN')} to total amount for ${goal.title}`, 'success');
                handleClose();
                onSuccess();
            } else {
                console.log("res error -----", res);
                ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to add contribution', 'error');
                return;
            }
        } catch (error) {
            console.error('[AddContributionModal] Failed to add contribution:', error);
            ShowToast('Failed to add contribution', 'error');
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
                    {/* Header */}
                    <View style={styles.header}>
                        <CustomText style={styles.headerTitle} numberOfLines={1}>
                            Add to {goal?.title || 'goal'}
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

                    {/* Amount Input */}
                    <TextInput
                        style={[
                            styles.input,
                            isFocused && styles.focusedInput,
                        ]}
                        placeholder="Amount"
                        placeholderTextColor="#8E8E93"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
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

                    {/* Button: Add contribution */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleAddContribution}
                        style={styles.actionButton}
                    >
                        <CustomText style={styles.actionButtonText}>Add contribution</CustomText>
                    </TouchableOpacity>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: resAvarage(2.5),
    },
    headerTitle: {
        flex: 1,
        fontSize: font20,
        fontFamily: FontBold,
        color: '#141414',
        marginRight: 8,
    },
    closeBtn: {
        padding: 4,
    },
    input: {
        height: 52,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: font16,
        fontFamily: FontMedium,
        color: '#141414',
        marginBottom: 16,
    },
    focusedInput: {
        borderColor: '#141414',
        backgroundColor: '#FFFFFF',
    },
    chipsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 22,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        backgroundColor: '#FFFFFF',
    },
    selectedChip: {
        backgroundColor: '#141414',
        borderColor: '#141414',
    },
    chipText: {
        fontSize: font13,
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
    },
    actionButtonText: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: '#FFFFFF',
    },
});
