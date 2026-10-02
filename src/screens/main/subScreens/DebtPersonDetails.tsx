import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { CommonBg } from '../../../ui/common/CommonBg';
import InsightHeader from './components/InsightHeader';
import CustomText from '../../../ui/components/CustomText';
import { colors } from '../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../utils/fontFamily';
import { font12, font13, font14, font16, font18, font20, font26 } from '../../../utils/fontSizes';
import { resAvarage, resWidth, scaleSize } from '../../../utils/responsive';
import { formatINR } from '../../../utils/FormatUtil';
import { query, remove, removeWhere, getOne } from '../../../storage/local/sqlite';
import { goBack } from '../../../navigation/NavigationUtils';
import Settle from '../../../assets/images/icons/settle.svg';
import BlackIn from '../../../assets/images/icons/blackin.svg';
import BlackOut from '../../../assets/images/icons/blackout.svg';
import DeleteIcon from '../../../assets/images/icons/delete.svg';
import Toast from 'react-native-toast-message';
import DeleteConfirmationModal from '../../../ui/modals/DeleteConfirmationModal';
import AddDebtTxnModal from '../../../ui/modals/AddDebtTxnModal';
import { syncNotifications } from '../../../services/localNotificationService';

export default function DebtPersonDetails({ route }: any) {
    const { personId } = route?.params;

    const [person, setPerson] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [financials, setFinancials] = useState({
        totalLent: 0,
        totalBorrowed: 0,
        netBalance: 0,
    });

    const [showDeleteTxnModal, setShowDeleteTxnModal] = useState(false);
    const [txnToDelete, setTxnToDelete] = useState<number | null>(null);
    const [showDeletePersonModal, setShowDeletePersonModal] = useState(false);
    const [showAddTxnModal, setShowAddTxnModal] = useState(false);

    const loadPersonDetails = () => {
        try {
            const p = getOne('debt_persons', personId);
            if (!p) {
                goBack();
                return;
            }
            setPerson(p);

            const txns = query('SELECT * FROM debt_transactions WHERE person_id = ? ORDER BY id DESC', [personId]) || [];
            setTransactions(txns);

            // Compute cumulative totals
            let lent = 0;
            let borrowed = 0;
            let balance = 0;

            // Sort chronologically to correctly calculate settlement offset direction
            const sortedTxns = [...txns].sort((a: any, b: any) => a.id - b.id);
            sortedTxns.forEach((t: any) => {
                if (t.type === 'outgoing') {
                    lent += t.amount;
                    balance += t.amount;
                } else if (t.type === 'incoming') {
                    borrowed += t.amount;
                    balance -= t.amount;
                } else if (t.type === 'done') {
                    if (balance > 0) {
                        balance = Math.max(0, balance - t.amount);
                    } else if (balance < 0) {
                        balance = Math.min(0, balance + t.amount);
                    }
                }
            });

            setFinancials({
                totalLent: lent,
                totalBorrowed: borrowed,
                netBalance: balance,
            });

        } catch (error) {
            console.error('Failed to load contact debt details:', error);
        }
    };

    useEffect(() => {
        loadPersonDetails();
    }, [personId]);

    const handleConfirmDeleteTxn = (txnId: number) => {
        setTxnToDelete(txnId);
        setShowDeleteTxnModal(true);
    };

    const handleDeleteTxn = (txnId: number) => {
        try {
            remove('debt_transactions', txnId);
            Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Transaction removed successfully.',
            });
            loadPersonDetails();
            syncNotifications();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete transaction.',
            });
        }
    };

    const handleConfirmDeletePerson = () => {
        setShowDeletePersonModal(true);
    };

    const handleDeletePerson = () => {
        try {
            removeWhere('debt_transactions', 'person_id = ?', [personId]);
            remove('debt_persons', personId);
            syncNotifications();
            Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Contact deleted successfully.',
            });
            goBack();
        } catch (error) {
            console.error('Failed to delete person:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete contact.',
            });
        }
    };

    const trustConfig = React.useMemo(() => {
        if (!person) return null;

        if (transactions.length === 0) {
            return {
                label: 'New Contact',
                textColor: colors.black70,
                bgColor: 'rgba(20, 20, 20, 0.08)',
            };
        }

        const totalLent = transactions.filter(t => t.type === 'outgoing').reduce((sum, t) => sum + t.amount, 0);
        const totalSettled = transactions.filter(t => t.type === 'done').reduce((sum, t) => sum + t.amount, 0);

        if (financials.netBalance > 0) {
            if (totalSettled > 0) {
                if (totalSettled >= totalLent * 0.5) {
                    return {
                        label: 'Good Payee',
                        textColor: colors.textGreen,
                        bgColor: 'rgba(20, 151, 74, 0.15)',
                    };
                } else {
                    return {
                        label: 'Slow Payee',
                        textColor: '#A27B00',
                        bgColor: 'rgba(212, 175, 55, 0.12)',
                    };
                }
            } else {
                if (financials.netBalance >= 10000) {
                    return {
                        label: 'High Risk',
                        textColor: colors.textRed,
                        bgColor: 'rgba(207, 70, 48, 0.15)',
                    };
                } else {
                    return {
                        label: 'Active Borrower',
                        textColor: '#D97706',
                        bgColor: 'rgba(245, 158, 11, 0.12)',
                    };
                }
            }
        } else if (financials.netBalance < 0) {
            return {
                label: 'Trusted Lender',
                textColor: colors.blueBg || '#3258FF',
                bgColor: 'rgba(50, 88, 255, 0.12)',
            };
        } else {
            if (totalLent > 0) {
                return {
                    label: 'Excellent Payee',
                    textColor: colors.textGreen,
                    bgColor: 'rgba(20, 151, 74, 0.15)',
                };
            }
            return {
                label: 'Settled',
                textColor: colors.black80,
                bgColor: 'rgba(20, 20, 20, 0.08)',
            };
        }
    }, [person, transactions, financials]);

    if (!person) return null;

    const initial = (person.name?.trim()?.[0] || 'P').toUpperCase();
    const balanceText = financials.netBalance > 0
        ? "They owe you"
        : financials.netBalance < 0
            ? "You owe them"
            : "Fully settled";

    const balanceColor = financials.netBalance > 0
        ? colors.black
        : financials.netBalance < 0
            ? colors.textRed
            : colors.textGreen;

    return (
        <CommonBg>
            <InsightHeader title="Contact" subtitle={person.name} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Contact Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatar}>
                            <CustomText style={styles.avatarInitial}>{initial}</CustomText>
                        </View>
                        <View style={{ flex: 1 }}>
                            <CustomText style={styles.nameText}>{person.name}</CustomText>
                            <CustomText style={styles.phoneText}>{person.phone}</CustomText>
                        </View>
                        {trustConfig && (
                            <View style={[styles.badge, { backgroundColor: trustConfig.bgColor }]}>
                                <CustomText style={[styles.badgeText, { color: trustConfig.textColor }]}>
                                    {trustConfig.label}
                                </CustomText>
                            </View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.balanceContainer}>
                        <CustomText style={styles.balanceLabel}>NET DEBT BALANCE</CustomText>
                        <CustomText style={[styles.balanceVal, { color: balanceColor }]}>
                            {formatINR(Math.abs(financials.netBalance))}
                        </CustomText>
                        <CustomText style={styles.balanceSub}>{balanceText}</CustomText>
                    </View>

                    <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                            <CustomText style={styles.metricLabel}>Total Lent</CustomText>
                            <CustomText style={styles.metricVal}>{formatINR(financials.totalLent)}</CustomText>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.metricItem}>
                            <CustomText style={styles.metricLabel}>Total Borrowed</CustomText>
                            <CustomText style={[styles.metricVal, { color: colors.textRed }]}>
                                {formatINR(financials.totalBorrowed)}
                            </CustomText>
                        </View>
                    </View>
                </View>

                {/* History Section */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeaderRow}>
                        <CustomText style={styles.sectionTitle}>TRANSACTION LOG</CustomText>
                        <TouchableOpacity onPress={() => setShowAddTxnModal(true)} activeOpacity={0.7} style={styles.addTxnBtn}>
                            <CustomText style={styles.addTxnBtnText}>+ Add Txn</CustomText>
                        </TouchableOpacity>
                    </View>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <CustomText style={styles.emptyText}>No transaction records found.</CustomText>
                        </View>
                    ) : (
                        transactions.map((t) => {
                            const isIncoming = t.type === 'incoming';
                            const isOutgoing = t.type === 'outgoing';
                            const isDone = t.type === 'done';

                            const IconComponent = isDone ? Settle : isIncoming ? BlackIn : BlackOut;
                            const title = isDone ? "Settle" : isIncoming ? "You Borrowed" : "You Lent";
                            const category = isDone ? "Settled" : isIncoming ? "Incoming" : "Outgoing";
                            const formattedAmount = `${isIncoming ? '+' : isOutgoing ? '-' : ''}${formatINR(t.amount)}`;
                            const amountColor = isIncoming ? colors.textGreen : colors.black;

                            return (
                                <View key={t.id} style={styles.txnCard}>
                                    <View style={styles.txnRow}>
                                        <View style={styles.iconBox}>
                                            <IconComponent width={resAvarage(4)} height={resAvarage(4)} />
                                        </View>
                                        <View style={{ flex: 1, marginRight: resWidth(2) }}>
                                            <CustomText style={styles.txnTitle}>{title}</CustomText>
                                            <CustomText style={styles.txnSubtitle}>
                                                {t.date} · {t.mode}
                                            </CustomText>
                                            {t.notes && (
                                                <CustomText style={styles.txnNotes}>
                                                    {t.notes}
                                                </CustomText>
                                            )}
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: resAvarage(1) }}>
                                            <CustomText style={[styles.txnAmount, { color: amountColor }]}>
                                                {formattedAmount}
                                            </CustomText>
                                            <TouchableOpacity
                                                onPress={() => handleConfirmDeleteTxn(t.id)}
                                                activeOpacity={0.7}
                                                style={styles.deleteBtn}
                                            >
                                                <DeleteIcon width={resAvarage(4)} height={resAvarage(4)} fill={colors.textRed} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Delete Contact Button */}
                <TouchableOpacity onPress={handleConfirmDeletePerson} activeOpacity={0.8} style={styles.deletePersonBtn}>
                    <CustomText style={styles.deletePersonBtnText}>Delete Contact</CustomText>
                </TouchableOpacity>

            </ScrollView>

            <DeleteConfirmationModal
                show={showDeleteTxnModal}
                setShow={setShowDeleteTxnModal}
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction record?"
                onConfirm={() => {
                    if (txnToDelete !== null) {
                        handleDeleteTxn(txnToDelete);
                        setTxnToDelete(null);
                    }
                }}
            />

            <DeleteConfirmationModal
                show={showDeletePersonModal}
                setShow={setShowDeletePersonModal}
                title="Delete Contact"
                description="This will delete the contact and all their transaction history. This action cannot be undone."
                onConfirm={handleDeletePerson}
            />

            <AddDebtTxnModal
                show={showAddTxnModal}
                setShow={setShowAddTxnModal}
                persons={[person]}
                onAddSuccess={loadPersonDetails}
                onAddPersonPress={() => {}}
            />
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(12),
        gap: resAvarage(4),
    },
    profileCard: {
        backgroundColor: colors.white,
        marginHorizontal: resWidth(4),
        borderRadius: resAvarage(6),
        padding: resAvarage(5),
        borderWidth: 1,
        borderColor: colors.black10,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resWidth(3),
    },
    avatar: {
        width: resWidth(12),
        height: resWidth(12),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontFamily: FontBold,
        fontSize: font20,
        color: colors.white,
    },
    nameText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black,
    },
    phoneText: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
        marginTop: resAvarage(0.2),
    },
    badge: {
        borderRadius: resAvarage(100),
        paddingHorizontal: resWidth(3),
        paddingVertical: resAvarage(1),
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontFamily: FontSemiBold,
        fontSize: font12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(20, 20, 20, 0.08)',
        marginVertical: resAvarage(3),
    },
    balanceContainer: {
        alignItems: 'center',
        marginVertical: resAvarage(1),
    },
    balanceLabel: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black60,
        letterSpacing: resAvarage(0.1),
    },
    balanceVal: {
        fontFamily: FontBold,
        fontSize: font26,
        marginVertical: resAvarage(0.5),
    },
    balanceSub: {
        fontFamily: FontMedium,
        fontSize: font13,
        color: colors.black80,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: resAvarage(4),
        paddingTop: resAvarage(3),
        borderTopWidth: 1,
        borderTopColor: 'rgba(20, 20, 20, 0.05)',
    },
    metricItem: {
        flex: 1,
        alignItems: 'center',
    },
    metricLabel: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
    },
    metricVal: {
        fontFamily: FontBold,
        fontSize: font16,
        color: colors.black,
        marginTop: resAvarage(0.5),
    },
    verticalDivider: {
        width: 1,
        backgroundColor: 'rgba(20, 20, 20, 0.05)',
    },
    historySection: {
        marginHorizontal: resWidth(4),
        gap: resAvarage(2),
    },
    sectionTitle: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black70,
        letterSpacing: resAvarage(0.1),
        marginHorizontal: resWidth(1),
        textTransform: 'uppercase',
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        paddingVertical: resAvarage(8),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.black10,
    },
    emptyText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: colors.black60,
    },
    txnCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        padding: resAvarage(3),
        borderWidth: 1,
        borderColor: colors.black10,
        elevation: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    txnRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        padding: resAvarage(1.8),
        marginRight: resWidth(3),
    },
    txnTitle: {
        fontFamily: FontSemiBold,
        fontSize: font14,
        color: colors.black,
    },
    txnSubtitle: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black60,
        marginTop: resAvarage(0.2),
    },
    txnNotes: {
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black80,
        fontStyle: 'italic',
        marginTop: resAvarage(0.5),
    },
    txnAmount: {
        fontFamily: FontBold,
        fontSize: font16,
    },
    deleteBtn: {
        padding: resAvarage(1),
        marginTop: resAvarage(0.5),
    },
    deletePersonBtn: {
        marginHorizontal: resWidth(4),
        borderWidth: 1.5,
        borderColor: colors.textRed,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: resAvarage(4),
    },
    deletePersonBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.textRed,
    },
    historyHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: resWidth(1),
        marginBottom: resAvarage(1),
    },
    addTxnBtn: {
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingHorizontal: resWidth(4),
        paddingVertical: resAvarage(1.5),
    },
    addTxnBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font12,
        color: colors.white,
    },
});
