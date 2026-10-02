import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState, useCallback } from 'react'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import { resAvarage, resWidth } from '../../../utils/responsive'
import CustomInput from '../../../ui/components/CustomInput'
import Search from '../../../assets/images/icons/search.svg'
import CommonList from '../../../ui/components/CommonList'
import CustomText from '../../../ui/components/CustomText'
import Phone from '../../../assets/images/icons/phone.svg'
import { colors } from '../../../utils/colors'
import { font12, font14, font16, font18 } from '../../../utils/fontSizes'
import { FontBold, FontMedium, FontSemiBold } from '../../../utils/fontFamily'
import { navigate } from '../../../navigation/NavigationUtils'
import { query } from '../../../storage/local/sqlite'
import { useFocusEffect } from '@react-navigation/native'
import { calculateExpectedInterest } from '../../../utils/FormatUtil'
import Plus from '../../../assets/images/icons/plus.svg'
import EmptyStateCard from '../../../ui/components/EmptyStateCard'
import UserIcon from '../../../assets/images/icons/user.svg'
import SearchIcon from '../../../assets/images/icons/search.svg'

export default function Borrowers() {
    const [selected, setSelected] = useState({
        name: "All",
        id: 1
    })
    const [searchQuery, setSearchQuery] = useState("")
    const [listing, setListing] = useState<any[]>([])

    const categories = [
        {
            name: "All",
            id: 1
        },
        {
            name: "Active",
            id: 2
        },
        {
            name: "OverDue",
            id: 3
        },
        {
            name: "Completed",
            id: 4
        }
    ]

    const loadBorrowers = () => {
        try {
            const borrowersList = query('SELECT * FROM borrowers ORDER BY id DESC') || [];
            const loansList = query('SELECT * FROM loans') || [];
            const paymentsList = query('SELECT * FROM payments') || [];

            const mapped = borrowersList.map((b: any) => {
                const myLoans = loansList.filter((l: any) => l.borrower_id === b.id);
                const myLoanIds = myLoans.map((l: any) => l.id);
                const myPayments = paymentsList.filter((p: any) => myLoanIds.includes(p.loan_id));

                const totalLoan = myLoans.reduce((sum: number, l: any) => sum + l.amount, 0);
                
                const activeLoansForB = myLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue');
                const outStand = activeLoansForB.reduce((sum, l) => {
                    const paymentsForLoan = myPayments.filter((p: any) => p.loan_id === l.id);
                    const principalPaid = paymentsForLoan.reduce((s, p) => s + p.to_principal, 0);
                    const interestPaid = paymentsForLoan.reduce((s, p) => s + p.to_interest, 0);
                    
                    const expectedInt = calculateExpectedInterest(l.amount, l.rate, l.rate_period, l.interest_type, l.compound_freq, l.repayment_method, l.term);
                    const remPrincipal = Math.max(0, l.amount - principalPaid);
                    const remInterest = Math.max(0, expectedInt - interestPaid);
                    return sum + remPrincipal + remInterest;
                }, 0);

                // Interest earned
                const earn = myPayments.reduce((sum: number, p: any) => sum + p.to_interest, 0);

                // Active loans (Active or OverDue status)
                const activeLoans = myLoans.filter((l: any) => l.status === 'Active' || l.status === 'OverDue');
                const activeLoanCount = activeLoans.length;

                // Next due date: find the earliest due_date of active loans
                const dueDates = activeLoans
                    .map((l: any) => l.due_date)
                    .filter((d: any) => !!d);
                const nextDueDate = dueDates.length > 0 ? dueDates[0] : 'N/A';

                // Status
                let status = 'Complete';
                if (myLoans.length > 0) {
                    if (myLoans.some((l: any) => l.status === 'OverDue')) {
                        status = 'OverDue';
                    } else if (myLoans.some((l: any) => l.status === 'Active')) {
                        status = 'Good';
                    }
                }

                return {
                    id: b.id,
                    name: b.name,
                    phone: b.phone,
                    address: b.address,
                    status,
                    outStand,
                    earn,
                    activeLoan: activeLoanCount,
                    totalLoan,
                    dueDate: nextDueDate
                };
            });

            setListing(mapped);
        } catch (error) {
            console.error('Failed to load borrowers:', error);
        }
    }

    useFocusEffect(
        useCallback(() => {
            loadBorrowers();
        }, [])
    )

    const filteredData = listing.filter(item => {
        const matchesStatus =
            selected?.name === "All" ||
            (selected?.name === "Active" && (item?.status === "Good" || item?.status === "Active")) ||
            (selected?.name === "OverDue" && item?.status === "OverDue") ||
            (selected?.name === "Completed" && (item?.status === "Complete" || item?.status === "Completed"));

        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <CommonBg>
            <InsightHeader title={"Finance"} subtitle={"Borrowers"} RightIcon={Plus} onPressRight={() => navigate("AddEntery")} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: resAvarage(24) }}
            >
                <View>
                    <CustomInput
                        Prefix={Search}
                        placeholder="Search"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <CommonList setSelected={setSelected} selected={selected} data={categories} />
                    {filteredData.length === 0 ? (
                        listing.length === 0 ? (
                            <EmptyStateCard
                                title="No Borrowers"
                                subtitle="Create a borrower profile to start recording new loans and payments."
                                Icon={UserIcon}
                                btnTitle="+ Add Borrower"
                                onPressBtn={() => navigate("AddEntery")}
                                style={{ marginHorizontal: resAvarage(3), marginTop: resAvarage(2) }}
                            />
                        ) : (
                            <EmptyStateCard
                                title="No Results Found"
                                subtitle="No borrowers match your active status filters or search query."
                                Icon={SearchIcon}
                                style={{ marginHorizontal: resAvarage(3), marginTop: resAvarage(2) }}
                            />
                        )
                    ) : (
                        <FlatList
                            data={filteredData}
                            scrollEnabled={false}
                            contentContainerStyle={{
                                gap: resAvarage(1.5),
                                paddingTop: resAvarage(4),
                                paddingBottom: resAvarage(8)
                            }}
                            renderItem={({ item }: any) => {
                                return (
                                    <TouchableOpacity onPress={() => navigate("User", { data: item })} style={[styles.card, item?.status === "OverDue" && {
                                        backgroundColor: "#fff5f5ff"
                                    }]} >
                                        <View style={[styles.row, { alignItems: "flex-start" }]} >
                                            <View style={{ gap: resWidth(1) }} >
                                                <CustomText style={styles.name} >{item?.name}</CustomText>

                                            </View>
                                            <View style={[styles.status, {
                                                backgroundColor: item?.status === "OverDue" ? colors.lightRedBg : item?.status === "Good" ? colors.theme : colors.black20,
                                            }]}>
                                                <CustomText style={[styles.statename, item?.status === "OverDue" && {
                                                    color: colors.textRed,
                                                }]} >{item?.status}</CustomText>
                                            </View>
                                        </View>
                                        <View style={styles.row} >
                                            <View style={{ gap: resWidth(0.5) }} >
                                                <CustomText style={styles.title} >Outstanding</CustomText>
                                                <CustomText style={styles.value} >₹{item?.outStand}</CustomText>
                                            </View>
                                            <View style={{ gap: resWidth(0.5) }} >
                                                <CustomText style={styles.title} >Interest Earned</CustomText>
                                                <CustomText style={styles.value} >₹{item?.earn}</CustomText>
                                            </View>
                                            <View style={{ gap: resWidth(0.5) }} >
                                                <CustomText style={styles.title} >Active loans</CustomText>
                                                <CustomText style={styles.value} >{item?.activeLoan}</CustomText>
                                            </View>
                                        </View>
                                        <View style={[styles.row, { paddingHorizontal: resWidth(2) }]} >
                                            <CustomText>Total loan : ₹{item?.totalLoan}</CustomText>
                                            {item?.dueDate && item?.dueDate !== 'N/A' && (
                                                <CustomText>Due : {item?.dueDate}</CustomText>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    value: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black,
        maxWidth: resWidth(26),
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font14,
        color: colors.black90,
        maxWidth: resWidth(26),
    },
    statename: {
        color: colors.black90,
        fontSize: font12,
        lineHeight: font12 * 1.3,
        fontFamily: FontBold,
    },
    status: {
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(1.5),
        paddingVertical: resAvarage(0.8),
        backgroundColor: colors.theme
    },
    name: {
        fontSize: font18,
        fontFamily: FontMedium,
        color: colors.textBlack
    },
    card: {
        gap: resAvarage(2.5),
        marginHorizontal: resAvarage(3),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(3),
        marginVertical: resAvarage(2),
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        borderWidth: 1,
        borderColor: colors.black20,
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    }
})