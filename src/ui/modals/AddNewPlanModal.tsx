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
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../utils/fontFamily';
import { font11, font12, font13, font14, font15, font18 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth } from '../../utils/responsive';

const CloseIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
);

const WalletIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="2" y="5" width="20" height="14" rx="2" />
        <Path d="M16 12h.01M2 9h20" />
    </Svg>
);

const GroupPeopleIcon = ({ color = colors.black, size = resAvarage(3.5) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="9" cy="7" r="4" />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
);

const UserPlusIcon = ({ color = colors.black, size = resAvarage(3.8) }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <Circle cx="8.5" cy="7" r="4" />
        <Line x1="20" y1="8" x2="20" y2="14" />
        <Line x1="17" y1="11" x2="23" y2="11" />
    </Svg>
);

export interface AddNewPlanModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onCreatePlan?: (data: {
        title: string;
        type: 'Single' | 'Group';
        budget: number;
        note?: string;
        people?: string[];
    }) => void;
}

export default function AddNewPlanModal({
    show,
    setShow,
    onCreatePlan,
}: AddNewPlanModalProps) {
    const transformY = useRef(new Animated.Value(resHeight(50))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [budgetType, setBudgetType] = useState<'Single' | 'Group'>('Single');
    const [title, setTitle] = useState('');
    const [budget, setBudget] = useState('');
    const [note, setNote] = useState('');
    const [people, setPeople] = useState<string[]>(['', '']);

    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            setBudgetType('Single');
            setTitle('');
            setBudget('');
            setNote('');
            setPeople(['', '']);
            setFocusedInput(null);

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
    }, [show]);

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

    const handleAddPersonInput = () => {
        setPeople((prev) => [...prev, '']);
    };

    const handlePersonNameChange = (index: number, name: string) => {
        setPeople((prev) => {
            const next = [...prev];
            next[index] = name;
            return next;
        });
    };

    const handleCreate = () => {
        const parsedBudget = parseFloat(budget);
        if (!title.trim() || isNaN(parsedBudget) || parsedBudget <= 0) {
            return;
        }

        const validPeople = budgetType === 'Group'
            ? people.map((p, i) => p.trim() || `Person ${i + 1}`)
            : [];

        onCreatePlan?.({
            title: title.trim(),
            type: budgetType,
            budget: parsedBudget,
            note: note.trim() || undefined,
            people: validPeople,
        });

        close();
    };

    const isSubmitDisabled = !title.trim() || !budget.trim() || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0;

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
                                <CustomText style={styles.headerTitle}>New plan</CustomText>
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
                                {/* Mode Selection Cards */}
                                <View style={styles.modeRow}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setBudgetType('Single')}
                                        style={[
                                            styles.modeCard,
                                            budgetType === 'Single' ? styles.modeCardSelected : styles.modeCardUnselected,
                                        ]}
                                    >
                                        <View style={styles.modeHeaderRow}>
                                            <WalletIcon color={colors.black} size={resAvarage(3.5)} />
                                            <CustomText style={styles.modeTitle}>Single budget</CustomText>
                                        </View>
                                        <CustomText style={styles.modeSubtitle}>
                                            Just you — track spend vs budget
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setBudgetType('Group')}
                                        style={[
                                            styles.modeCard,
                                            budgetType === 'Group' ? styles.modeCardSelected : styles.modeCardUnselected,
                                        ]}
                                    >
                                        <View style={styles.modeHeaderRow}>
                                            <GroupPeopleIcon color={colors.black} size={resAvarage(3.5)} />
                                            <CustomText style={styles.modeTitle}>Group budget</CustomText>
                                        </View>
                                        <CustomText style={styles.modeSubtitle}>
                                            Add people, split at the end
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                {/* Standard Inputs */}
                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedInput === 'title' && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Plan name (Goa trip, new phone...)"
                                        placeholderTextColor="#8E8E93"
                                        value={title}
                                        onChangeText={setTitle}
                                        onFocus={() => setFocusedInput('title')}
                                        onBlur={() => setFocusedInput(null)}
                                        allowFontScaling={false}
                                    />
                                </View>

                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedInput === 'budget' && styles.inputFocused,
                                        { marginTop: resAvarage(1.8) },
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Budget (₹)"
                                        placeholderTextColor="#8E8E93"
                                        keyboardType="numeric"
                                        value={budget}
                                        onChangeText={setBudget}
                                        onFocus={() => setFocusedInput('budget')}
                                        onBlur={() => setFocusedInput(null)}
                                        allowFontScaling={false}
                                    />
                                </View>

                                <View
                                    style={[
                                        styles.inputContainer,
                                        focusedInput === 'note' && styles.inputFocused,
                                        { marginTop: resAvarage(1.8) },
                                    ]}
                                >
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Note (optional)"
                                        placeholderTextColor="#8E8E93"
                                        value={note}
                                        onChangeText={setNote}
                                        onFocus={() => setFocusedInput('note')}
                                        onBlur={() => setFocusedInput(null)}
                                        allowFontScaling={false}
                                    />
                                </View>

                                {/* Conditional PEOPLE section for Group budget */}
                                {budgetType === 'Group' && (
                                    <View style={styles.peopleSection}>
                                        <CustomText style={styles.sectionLabel}>PEOPLE</CustomText>
                                        {people.map((pName, index) => (
                                            <View
                                                key={`person-${index}`}
                                                style={[
                                                    styles.inputContainer,
                                                    focusedInput === `person-${index}` && styles.inputFocused,
                                                    { marginBottom: resAvarage(1.8) },
                                                ]}
                                            >
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder={`Person ${index + 1}`}
                                                    placeholderTextColor="#8E8E93"
                                                    value={pName}
                                                    onChangeText={(text) => handlePersonNameChange(index, text)}
                                                    onFocus={() => setFocusedInput(`person-${index}`)}
                                                    onBlur={() => setFocusedInput(null)}
                                                    allowFontScaling={false}
                                                />
                                            </View>
                                        ))}

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={handleAddPersonInput}
                                            style={styles.addPersonBtn}
                                        >
                                            <UserPlusIcon color={colors.black} size={resAvarage(3.8)} />
                                            <CustomText style={styles.addPersonBtnText}>Add person</CustomText>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={handleCreate}
                                    disabled={isSubmitDisabled}
                                    style={[
                                        styles.submitBtn,
                                        isSubmitDisabled && styles.submitBtnDisabled,
                                        { marginTop: budgetType === 'Group' ? resAvarage(2) : resAvarage(3.5) },
                                    ]}
                                >
                                    <CustomText style={styles.submitBtnText}>Create plan</CustomText>
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
        backgroundColor: colors.white,
        borderRadius: resAvarage(4.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        maxHeight: resHeight(88),
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
    modeRow: {
        flexDirection: 'row',
        gap: resAvarage(2),
        marginBottom: resAvarage(3),
    },
    modeCard: {
        flex: 1,
        borderRadius: resAvarage(3.5),
        paddingHorizontal: resAvarage(2.5),
        paddingVertical: resAvarage(2.5),
        minHeight: resAvarage(12),
        justifyContent: 'center',
        overflow: 'hidden',
    },
    modeCardSelected: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: '#E8EBEF',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    modeCardUnselected: {
        backgroundColor: '#F5F7FA',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    modeHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1),
        marginBottom: resAvarage(0.6),
    },
    modeTitle: {
        fontSize: font13,
        fontFamily: FontBold,
        color: colors.black,
        flexShrink: 1,
    },
    modeSubtitle: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black60,
        lineHeight: font11 * 1.3,
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
    peopleSection: {
        marginTop: resAvarage(2.5),
    },
    sectionLabel: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        letterSpacing: resAvarage(0.3),
        textTransform: 'uppercase',
        marginBottom: resAvarage(1.8),
    },
    addPersonBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
        marginTop: resAvarage(0.5),
        marginBottom: resAvarage(1),
        paddingVertical: resAvarage(1),
    },
    addPersonBtnText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
    },
    submitBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        height: resAvarage(8),
        alignItems: 'center',
        justifyContent: 'center',
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
