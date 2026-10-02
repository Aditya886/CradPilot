import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import DebtsHeader from './components/DebtsHeader'
import OverAll from './components/OverAll'
import AddParts from './components/AddParts'
import PendingSettlement from './components/PendingSettlement'
import CustomText from '../../../ui/components/CustomText'
import { colors } from '../../../utils/colors'
import { FontMedium } from '../../../utils/fontFamily'
import { font10 } from '../../../utils/fontSizes'
import { resAvarage, resWidth } from '../../../utils/responsive'
import Recent from './components/Recent'
import RecentActivity from './components/RecentActivity'
import { CustomSearch } from '../../../ui/components/CustomSearch'
import CommonList from '../../../ui/components/CommonList'
import { ActivityList, PersonList } from '../../../assets/DefaultData'
import PersonDataList from './components/PersonList'
import ActivityHistory from './components/ActivityHistory'

import { query } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'
import AddDebtPersonModal from '../../../ui/modals/AddDebtPersonModal'
import AddDebtTxnModal from '../../../ui/modals/AddDebtTxnModal'

export default function Debts({ route, navigation }: any) {
    const [selected, setSelected] = useState("Home")
    const [selectedActivity, setSelectedActivity] = useState(ActivityList[0])
    const [selectedPersonFilter, setSelectedPersonFilter] = useState(PersonList[0])

    const [debtPersons, setDebtPersons] = useState<any[]>([])
    const [debtTransactions, setDebtTransactions] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    const [showAddPersonModal, setShowAddPersonModal] = useState(false)
    const [showAddTxnModal, setShowAddTxnModal] = useState(false)

    const loadDebtsData = () => {
        try {
            const persons = query('SELECT * FROM debt_persons ORDER BY name ASC') || [];
            const txns = query(`
                SELECT t.*, p.name, p.phone 
                FROM debt_transactions t
                JOIN debt_persons p ON t.person_id = p.id
                ORDER BY t.id DESC
            `) || [];

            // Calculate each person's balance and update count
            const calculatedPersons = persons.map((person: any) => {
                const personTxns = [...txns]
                    .filter((t: any) => t.person_id === person.id)
                    .sort((a: any, b: any) => a.id - b.id); // chronological order

                let balance = 0;
                let lastUpdate = 'N/A';
                personTxns.forEach((t: any) => {
                    if (t.type === 'outgoing') {
                        balance += t.amount;
                    } else if (t.type === 'incoming') {
                        balance -= t.amount;
                    } else if (t.type === 'done') {
                        if (balance > 0) {
                            balance = Math.max(0, balance - t.amount);
                        } else if (balance < 0) {
                            balance = Math.min(0, balance + t.amount);
                        }
                    }
                    if (t.date) {
                        lastUpdate = t.date;
                    }
                });

                return {
                    ...person,
                    remain: balance,
                    type: balance > 0 ? 'outgoing' : balance < 0 ? 'incoming' : 'done',
                    txn_count: personTxns.length,
                    lastUpdate: lastUpdate !== 'N/A' ? lastUpdate.split(' ')[0] : 'New contact',
                };
            });

            setDebtPersons(calculatedPersons);
            setDebtTransactions(txns);
        } catch (e) {
            console.error('Failed to load debts data:', e);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadDebtsData();
            if (route?.params?.openAddTxn) {
                setShowAddTxnModal(true);
                navigation.setParams({ openAddTxn: undefined });
            }
        }, [route?.params?.openAddTxn, navigation])
    );

    const overallMetrics = React.useMemo(() => {
        let receive = 0;
        let owe = 0;
        let rCount = 0;
        let pCount = 0;

        debtPersons.forEach(p => {
            if (p.remain > 0) {
                receive += p.remain;
                rCount++;
            } else if (p.remain < 0) {
                owe += Math.abs(p.remain);
                pCount++;
            }
        });

        return {
            totalReceive: receive,
            totalOwe: owe,
            receiveCount: rCount,
            payCount: pCount
        };
    }, [debtPersons]);

    const pendingSettlements = React.useMemo(() => {
        return debtPersons.filter(p => p.remain !== 0);
    }, [debtPersons]);

    const recentActivityData = React.useMemo(() => {
        return debtTransactions.slice(0, 5);
    }, [debtTransactions]);

    const filteredPersons = React.useMemo(() => {
        let result = debtPersons;

        if (selectedPersonFilter) {
            if (selectedPersonFilter.name === "You'll receive") {
                result = result.filter(p => p.remain > 0);
            } else if (selectedPersonFilter.name === "You owe") {
                result = result.filter(p => p.remain < 0);
            } else if (selectedPersonFilter.name === "Settled") {
                result = result.filter(p => p.remain === 0);
            }
        }

        if (searchQuery.trim()) {
            const queryLower = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(queryLower) || p.phone.includes(queryLower));
        }

        return result;
    }, [debtPersons, selectedPersonFilter, searchQuery]);

    const filteredTxnsCount = React.useMemo(() => {
        let count = debtTransactions.length;
        if (selectedActivity) {
            if (selectedActivity.name === "You'll receive") {
                count = debtTransactions.filter(item => item.type === 'outgoing').length;
            } else if (selectedActivity.name === 'You owe') {
                count = debtTransactions.filter(item => item.type === 'incoming').length;
            } else if (selectedActivity.name === 'Settled') {
                count = debtTransactions.filter(item => item.type === 'done').length;
            }
        }
        return count;
    }, [debtTransactions, selectedActivity]);

    const showFooter = React.useMemo(() => {
        if (selected === "Home") {
            return pendingSettlements.length > 2 || recentActivityData.length > 2;
        }
        if (selected === "Persons") {
            return filteredPersons.length > 3;
        }
        return filteredTxnsCount > 3;
    }, [selected, pendingSettlements, recentActivityData, filteredPersons, filteredTxnsCount]);

    return (
        <CommonBg>
            <DebtsHeader selected={selected} setSelected={setSelected} />
            <ScrollView
                showsVerticalScrollIndicator={false}
            >
                {selected === "Home" ? (
                    <View>
                        <OverAll 
                            totalOwe={overallMetrics.totalOwe} 
                            totalReceive={overallMetrics.totalReceive} 
                            receiveCount={overallMetrics.receiveCount} 
                            payCount={overallMetrics.payCount} 
                        />
                        <AddParts 
                            totalOwe={overallMetrics.totalOwe} 
                            totalReceive={overallMetrics.totalReceive} 
                            receiveCount={overallMetrics.receiveCount} 
                            payCount={overallMetrics.payCount} 
                            onAddPerson={() => {
                                console.log('[Debts] Opening Add Person Modal');
                                setShowAddPersonModal(true);
                            }}
                            onAddTxn={() => {
                                console.log('[Debts] Opening Add Txn Modal');
                                setShowAddTxnModal(true);
                            }}
                        />
                        <PendingSettlement data={pendingSettlements} />
                        <RecentActivity data={recentActivityData} onViewAll={() => setSelected("Activity")} />
                    </View>
                ) : selected === "Persons" ? (
                    <View>
                        <CustomSearch 
                            placeholder={"Search"} 
                            search={searchQuery} 
                            setSearch={setSearchQuery} 
                        />
                        <CommonList 
                            data={PersonList} 
                            selected={selectedPersonFilter} 
                            setSelected={setSelectedPersonFilter} 
                        />
                        <PersonDataList data={filteredPersons} />
                    </View>
                ) : (
                    <View>
                        <CommonList
                            data={ActivityList}
                            selected={selectedActivity}
                            setSelected={setSelectedActivity}
                        />
                        <ActivityHistory data={debtTransactions} selectedFilter={selectedActivity} />
                    </View>
                )}
                {showFooter && <CustomText style={styles.footer} >on-device · offline · private</CustomText>}
            </ScrollView>

            <AddDebtPersonModal 
                show={showAddPersonModal} 
                setShow={setShowAddPersonModal} 
                onAddSuccess={loadDebtsData} 
            />

            <AddDebtTxnModal 
                show={showAddTxnModal} 
                setShow={setShowAddTxnModal} 
                persons={debtPersons} 
                onAddSuccess={loadDebtsData} 
                onAddPersonPress={() => setShowAddPersonModal(true)}
            />
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(18),
        color: colors.black60,
        fontFamily: FontMedium
    }
})