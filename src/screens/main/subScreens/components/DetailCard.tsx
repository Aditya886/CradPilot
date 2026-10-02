import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import { colors } from '../../../../utils/colors'
import { FontBoldP, FontMedium, FontRegular, FontSemiBold } from '../../../../utils/fontFamily'
import { font14, font12, font35, font11, font16, font18, font13 } from '../../../../utils/fontSizes'
import { formatINR } from '../../../../utils/FormatUtil'

export default function DetailCard({ item, borrowerName, borrowerPhone, onDeleteLoan, onDeleteUser, onAddAmount }: any) {
    // Determine outstanding amount and status
    const totalOutstanding = item?.outStand ?? 0;

    // Proportional breakdown of remaining principal and interest if not provided
    const monthlyRate = (item?.rate ?? 1.5) / 100;
    const outstandingInterest = item?.outstandingInterest !== undefined 
        ? item.outstandingInterest 
        : Math.round(totalOutstanding * monthlyRate);
    const remainingPrincipal = item?.remainingPrincipal !== undefined 
        ? item.remainingPrincipal 
        : (totalOutstanding - outstandingInterest);

    const displayName = borrowerName?.toUpperCase() ?? item?.title?.toUpperCase() ?? "BORROWER";
    const displayPhone = borrowerPhone ?? "N/A";
    const displayDescription = item?.description ?? "No description provided.";

    // Dynamic status configuration matching the project status scheme
    const getStatusColors = () => {
        const s = item?.status?.toLowerCase();
        if (s === 'overdue') {
            return {
                text: 'Overdue',
                textColor: colors.textRed,
                bgColor: 'rgba(207, 70, 48, 0.18)'
            };
        }
        if (s === 'good' || s === 'completed' || s === 'complete') {
            return {
                text: item?.status ?? 'Completed',
                textColor: colors.textGreen,
                bgColor: 'rgba(20, 151, 74, 0.15)'
            };
        }
        if (s === 'active') {
            return {
                text: item?.status ?? 'Active',
                textColor: colors.textTheme,
                bgColor: colors.theme
            };
        }
        return {
            text: item?.status ?? 'Active',
            textColor: colors.textTheme,
            bgColor: colors.theme
        };
    };

    const statusInfo = getStatusColors();

    return (
        <View style={styles.card} >
            {/* Header section with Borrower Info, Status Badge, and Options Dot Menu */}
            <View style={styles.headerRow} >
                <View>
                    <CustomText style={styles.borrowerName}>{displayName}</CustomText>
                    <CustomText style={styles.borrowerPhone}>{displayPhone}</CustomText>
                </View>

                <View style={styles.rightHeader}>
                    <View style={[styles.badgeContainer, { backgroundColor: statusInfo.bgColor }]}>
                        <CustomText style={[styles.badgeText, { color: statusInfo.textColor }]}>{statusInfo.text}</CustomText>
                    </View>
                    <Menu>
                        <MenuTrigger>
                            <View style={styles.dotsButton}>
                                <View style={styles.dotsContainer}>
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                            </View>
                        </MenuTrigger>
                        <MenuOptions customStyles={optionsStyles}>
                            {item?.status?.toLowerCase() !== 'completed' && (
                                <MenuOption onSelect={onAddAmount} style={styles.menuOption}>
                                    <CustomText style={styles.menuOptionText}>Add Amount</CustomText>
                                </MenuOption>
                            )}
                            <MenuOption onSelect={onDeleteLoan} style={styles.menuOption}>
                                <CustomText style={styles.menuOptionText}>Delete Loan</CustomText>
                            </MenuOption>
                            <MenuOption onSelect={onDeleteUser} style={styles.menuOption}>
                                <CustomText style={[styles.menuOptionText, { color: colors.textRed }]}>Delete Borrower</CustomText>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </View>
            </View>

            {/* Total Outstanding Section */}
            <View style={styles.outstandingContainer} >
                <CustomText style={styles.outstandingLabel}>TOTAL OUTSTANDING</CustomText>
                <CustomText style={styles.outstandingValue}>{formatINR(totalOutstanding)}</CustomText>
            </View>

            {/* Principal & Interest Breakdown */}
            <View style={styles.breakdownRow} >
                <View style={{ gap: resAvarage(0.5) }} >
                    <CustomText style={styles.breakdownLabel}>Remaining principal</CustomText>
                    <CustomText style={styles.breakdownValue}>{formatINR(remainingPrincipal)}</CustomText>
                </View>
                <View style={{ gap: resAvarage(0.5) }} >
                    <CustomText style={styles.breakdownLabel}>Outstanding interest</CustomText>
                    <CustomText style={[styles.breakdownValue, { color: colors.theme }]}>{formatINR(outstandingInterest)}</CustomText>
                </View>
            </View>

            {/* Divider line */}
            <View style={styles.divider} />

            {/* Quote description */}
            <CustomText style={styles.descriptionQuote}>
                {`"${displayDescription}"`}
            </CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.black,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        marginTop: resAvarage(3),
        borderRadius: resAvarage(7),
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: {
            height: resAvarage(1),
            width: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: resAvarage(2),
        gap: resAvarage(3.5)
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between"
    },
    borrowerName: {
        fontSize: font12,
        fontFamily: FontMedium,
        letterSpacing: resAvarage(0.1),
        color: colors.white50,
        textTransform: 'uppercase'
    },
    borrowerPhone: {
        fontSize: font18,
        fontFamily: FontMedium,
        color: colors.white,
        marginTop: resAvarage(0.5)
    },
    rightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resWidth(3)
    },
    badgeContainer: {
        backgroundColor: 'rgba(207, 70, 48, 0.18)',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(0.5),
        paddingHorizontal: resAvarage(2.5),
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        color: colors.textRed,
        fontSize: font12,
        fontFamily: FontSemiBold,
    },
    dotsButton: {
        width: resAvarage(5.5),
        height: resAvarage(5.5),
        borderRadius: resAvarage(100),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dotsContainer: {
        gap: resAvarage(0.4),
        alignItems: 'center',
        justifyContent: 'center'
    },
    dot: {
        width: resAvarage(0.4),
        height: resAvarage(0.4),
        borderRadius: resAvarage(100),
        backgroundColor: colors.white
    },
    outstandingContainer: {
        gap: resAvarage(0.5)
    },
    outstandingLabel: {
        fontSize: font11,
        textTransform: "uppercase",
        letterSpacing: resAvarage(0.2),
        fontFamily: FontRegular,
        color: colors.white50
    },
    outstandingValue: {
        fontSize: font35,
        fontFamily: FontBoldP,
        color: colors.white,
    },
    breakdownRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    breakdownLabel: {
        fontSize: font13,
        letterSpacing: resAvarage(0.1),
        fontFamily: FontRegular,
        color: colors.white50
    },
    breakdownValue: {
        fontSize: font18,
        fontFamily: FontSemiBold,
        color: colors.white
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        marginVertical: resAvarage(0.5)
    },
    descriptionQuote: {
        fontSize: font14,
        fontFamily: FontRegular,
        fontStyle: 'italic',
        color: colors.white80,
        lineHeight: font14 * 1.45
    },
    menuOption: {
        paddingVertical: resAvarage(1.5),
        paddingHorizontal: resAvarage(2),
    },
    menuOptionText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.black,
    },
})

const optionsStyles = {
    optionsContainer: {
        borderRadius: resAvarage(1),
        marginTop: resAvarage(4),
        padding: resAvarage(1),
        width: resWidth(42),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        backgroundColor: colors.bgWhite,
    },
};