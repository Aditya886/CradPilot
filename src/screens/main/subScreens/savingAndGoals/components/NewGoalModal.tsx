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
import { font14, font16, font20 } from '../../../../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../../../../utils/responsive';
import { ShowToast } from '../../../../../utils/CustomToast/ToastManager';
import { insert } from '../../../../../storage/local/sqlite';
import { useCreateGoalMutation, extractApiErrorMessage } from '../../../../../API';
import Svg, { Path } from 'react-native-svg';

const CloseIcon = () => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke="#141414" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

interface NewGoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewGoalModal({ visible, onClose, onSuccess }: NewGoalModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(resHeight(40))).current;
    const [createGoalApi, { isLoading: isCreating }] = useCreateGoalMutation();

    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [alreadySaved, setAlreadySaved] = useState('');
    const [timeline, setTimeline] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>('name');

    useEffect(() => {
        if (visible) {
            setGoalName('');
            setTargetAmount('');
            setAlreadySaved('');
            setTimeline('');
            setFocusedField('name');

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
                toValue: resHeight(30),
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => onClose());
    };

    const handleCreateGoal = async () => {
        const trimmedName = goalName.trim();
        const parsedTarget = parseFloat(targetAmount.replace(/,/g, ''));
        const parsedSaved = parseFloat(alreadySaved.replace(/,/g, '')) || 0;

        if (!trimmedName) {
            ShowToast('Please enter a goal name', 'error');
            return;
        }

        if (isNaN(parsedTarget) || parsedTarget <= 0) {
            ShowToast('Please enter a valid target amount', 'error');
            return;
        }

        if (parsedSaved < 0) {
            ShowToast('Already saved amount cannot be negative', 'error');
            return;
        }

        const payload = {
            title: trimmedName,
            target: parsedTarget,
            saved: parsedSaved,
            timeline: timeline.trim() || undefined,
        };

        const res: any = await createGoalApi(payload);
        if (res?.data?.success || (res?.data && !res?.error)) {
            console.log("res -----", res);
            ShowToast(res?.data?.message || 'Goal created successfully!', 'success');

            const now = new Date().toISOString();
            const status = parsedSaved >= parsedTarget ? 'done' : 'active';

            try {
                insert('goals', {
                    title: trimmedName,
                    target: parsedTarget,
                    saved: parsedSaved,
                    days: 30,
                    timeline: timeline.trim() || undefined,
                    status: status,
                    created_at: now,
                });
            } catch (err) {}

            handleClose();
            onSuccess();
        } else {
            console.log("res error -----", res);
            ShowToast(res?.error?.data?.message || res?.data?.message || 'Failed to create goal', 'error');
            return;
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
                        {/* Header: Title + Close Icon */}
                        <View style={styles.header}>
                            <CustomText style={styles.headerTitle}>New goal</CustomText>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handleClose}
                                style={styles.closeBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>

                        {/* Input 1: Goal name */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'name' && styles.focusedInput,
                            ]}
                            placeholder="Goal name"
                            placeholderTextColor="#8E8E93"
                            value={goalName}
                            onChangeText={setGoalName}
                            onFocus={() => setFocusedField('name')}
                            autoFocus
                        />

                        {/* Input 2: Target amount */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'target' && styles.focusedInput,
                            ]}
                            placeholder="Target amount"
                            placeholderTextColor="#8E8E93"
                            keyboardType="numeric"
                            value={targetAmount}
                            onChangeText={setTargetAmount}
                            onFocus={() => setFocusedField('target')}
                        />

                        {/* Input 3: Already saved (optional) */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'saved' && styles.focusedInput,
                            ]}
                            placeholder="Already saved (optional)"
                            placeholderTextColor="#8E8E93"
                            keyboardType="numeric"
                            value={alreadySaved}
                            onChangeText={setAlreadySaved}
                            onFocus={() => setFocusedField('saved')}
                        />

                        {/* Input 4: Timeline e.g. 6 months (optional) */}
                        <TextInput
                            style={[
                                styles.input,
                                focusedField === 'timeline' && styles.focusedInput,
                            ]}
                            placeholder="Timeline e.g. 6 months (optional)"
                            placeholderTextColor="#8E8E93"
                            value={timeline}
                            onChangeText={setTimeline}
                            onFocus={() => setFocusedField('timeline')}
                        />

                        {/* Button: Create goal */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleCreateGoal}
                            style={styles.createButton}
                        >
                            <CustomText style={styles.createButtonText}>Create goal</CustomText>
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
        marginBottom: resAvarage(2.5),
    },
    headerTitle: {
        fontSize: font20,
        fontFamily: FontBold,
        color: '#141414',
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
        fontSize: font14,
        fontFamily: FontRegular,
        color: '#141414',
        marginBottom: 14,
    },
    focusedInput: {
        borderColor: '#141414',
        backgroundColor: '#FFFFFF',
    },
    createButton: {
        height: 52,
        backgroundColor: '#0D0D0D',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
    },
    createButtonText: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: '#FFFFFF',
    },
});
