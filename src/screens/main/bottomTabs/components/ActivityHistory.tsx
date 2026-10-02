import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useMemo } from 'react'
import { groupByDate } from '../../../../ui/components/GroupbyDate'
import TransactionCard from './TransactionCard'
import CustomText from '../../../../ui/components/CustomText'
import Settle from '../../../../assets/images/icons/settle.svg'
import BlackIn from '../../../../assets/images/icons/blackin.svg'
import BlackOut from '../../../../assets/images/icons/blackout.svg'
import EmptyStateCard from '../../../../ui/components/EmptyStateCard'
import { colors } from '../../../../utils/colors'
import { FontMedium } from '../../../../utils/fontFamily'
import { font12 } from '../../../../utils/fontSizes'
import { resAvarage } from '../../../../utils/responsive'

interface ActivityHistoryProps {
    data: any[];
    selectedFilter?: {
        id: number;
        name: string;
    };
}

export default function ActivityHistory({ data, selectedFilter }: ActivityHistoryProps) {
    const filteredData = useMemo(() => {
        const sourceData = data || [];
        if (!selectedFilter || selectedFilter.name === 'All') {
            return sourceData;
        }
        if (selectedFilter.name === "You'll receive") {
            return sourceData.filter(item => item.type === 'outgoing');
        }
        if (selectedFilter.name === 'You owe') {
            return sourceData.filter(item => item.type === 'incoming');
        }
        if (selectedFilter.name === 'Settled') {
            return sourceData.filter(item => item.type === 'done');
        }
        return sourceData;
    }, [data, selectedFilter]);

    const groupedData = useMemo(() => {
        return groupByDate(filteredData);
    }, [filteredData]);

    if (filteredData.length === 0) {
        return (
            <EmptyStateCard
                title="No Transactions"
                subtitle="Transactions under this filter will appear here."
                Icon={BlackIn}
                style={{ marginTop: resAvarage(4) }}
            />
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={groupedData}
                keyExtractor={(item: any) => item?.date}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.groupContainer}>
                        <CustomText style={styles.dateHeader}>
                            {item.date}
                        </CustomText>

                        <View style={styles.cardContainer}>
                            {item.transactions.map((transaction: any) => {
                                const isIncoming = transaction?.type === 'incoming';
                                const isOutgoing = transaction?.type === 'outgoing';
                                const isDone = transaction?.type === 'done';

                                const IconComponent = isDone ? Settle : isIncoming ? BlackIn : BlackOut;
                                const title = isDone ? "Settle" : isIncoming ? "You Borrowed" : "You Lent";
                                const category = isDone ? "Settled" : isIncoming ? "Incoming" : "Outgoing";
                                const formattedAmount = `${isIncoming ? '+' : isOutgoing ? '-' : ''}₹${transaction.amount}`;

                                const mappedItem = {
                                    ...transaction,
                                    title: title,
                                    category: category,
                                    amount: formattedAmount,
                                };

                                return (
                                    <TransactionCard
                                        key={transaction.id}
                                        item={mappedItem}
                                        Icon={IconComponent}
                                    />
                                );
                            })}
                        </View>
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: resAvarage(5),
    },
    groupContainer: {
        marginBottom: resAvarage(2),
    },
    dateHeader: {
        fontSize: font12,
        fontFamily: FontMedium,
        color: colors.black60,
        marginHorizontal: resAvarage(3),
        marginVertical: resAvarage(1),
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.1),
    },
    cardContainer: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(6),
        borderWidth: 1,
        borderColor: colors.black10,
        marginHorizontal: resAvarage(2),
        elevation: 2,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    }
})