import { StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native'
import React, { useState } from 'react'
import CustomText from '../../../../ui/components/CustomText'
import { resAvarage, resWidth, scaleSize } from '../../../../utils/responsive'
import { colors } from '../../../../utils/colors'
import { font10, font12, font15, font14, font16, font18, font20, font24 } from '../../../../utils/fontSizes'
import { FontBold, FontMedium, FontRegular } from '../../../../utils/fontFamily'
import Add from "../../../../assets/images/icons/plus.svg"
import Delete from "../../../../assets/images/icons/grayDelete.svg"
import { formatINR } from '../../../../utils/FormatUtil'
import { insert, remove } from '../../../../storage/local/sqlite'
import EmptyStateCard from '../../../../ui/components/EmptyStateCard'

export default function SavingAndGoals({ goals, onRefresh }: any) {
    const budget = goals || []
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false)
    const [titleInput, setTitleInput] = useState('')
    const [targetInput, setTargetInput] = useState('')
    const [savedInput, setSavedInput] = useState('')
    const [daysInput, setDaysInput] = useState('')

    const handleAddGoal = () => {
        if (!titleInput.trim() || !targetInput.trim()) return

        try {
            insert('goals', {
                title: titleInput.trim(),
                saved: parseFloat(savedInput) || 0,
                target: parseFloat(targetInput) || 0,
                days: parseInt(daysInput, 10) || 30
            })
            
            // Clear inputs
            setTitleInput('')
            setTargetInput('')
            setSavedInput('')
            setDaysInput('')
            setShowAddModal(false)
            
            if (onRefresh) onRefresh()
        } catch (e) {
            console.error('Failed to add goal:', e)
        }
    }

    const handleDeleteGoal = (id: number) => {
        try {
            remove('goals', id)
            if (onRefresh) onRefresh()
        } catch (e) {
            console.error('Failed to delete goal:', e)
        }
    }

    return (
        <View style={styles.card} >
            <View style={[styles.row, { marginBottom: resAvarage(3) }]} >
                <CustomText style={styles.title} >Savings & goals</CustomText>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.btn} >
                    <Add width={resAvarage(3)} height={resAvarage(3)} />
                    <CustomText style={styles.add} >Add goal</CustomText>
                </TouchableOpacity>
            </View>
            {budget.length === 0 ? (
                <EmptyStateCard
                    title="No Savings Goals"
                    subtitle="Set targets to save for your future purchases and track progress."
                    Icon={null}
                    style={{ elevation: 0, borderWidth: 0, marginHorizontal: 0, paddingVertical: resAvarage(2) }}
                />
            ) : (
                <FlatList
                    data={budget}
                scrollEnabled={false}
                renderItem={({ item }: any) => {
                    const pct = item?.target > 0 ? Math.round((item?.saved / item?.target) * 100) : 0
                    return (
                        <View style={styles.noteView} >
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <CustomText style={[styles.perInc]} >{item?.title}</CustomText>
                                <View style={styles.row} >
                                    <CustomText style={[styles.perInc, { color: colors.black90, fontFamily: FontMedium }]} >{`${formatINR(item?.saved)} / ${formatINR(item?.target)}`}</CustomText>
                                    <TouchableOpacity onPress={() => handleDeleteGoal(item.id)}>
                                        <Delete width={resAvarage(3)} height={resAvarage(3)} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View>
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${pct}%`,
                                            }
                                        ]}
                                    />
                                </View>
                                <CustomText style={styles.subtitle} >{`${pct}% · Save for your ${item?.title} in ${item?.days || 30} days`}</CustomText>
                            </View>
                        </View>
                    )
                }}
            />
            )}

            {/* Add Goal Modal */}
            <Modal
                visible={showAddModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>Add savings goal</CustomText>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Goal title (e.g. Goa Trip)"
                            placeholderTextColor={colors.black60}
                            value={titleInput}
                            onChangeText={setTitleInput}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Target amount (e.g. 50000)"
                            placeholderTextColor={colors.black60}
                            keyboardType="numeric"
                            value={targetInput}
                            onChangeText={setTargetInput}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Saved amount (e.g. 10000)"
                            placeholderTextColor={colors.black60}
                            keyboardType="numeric"
                            value={savedInput}
                            onChangeText={setSavedInput}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Timeframe in days (e.g. 30)"
                            placeholderTextColor={colors.black60}
                            keyboardType="numeric"
                            value={daysInput}
                            onChangeText={setDaysInput}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelModalButton]} onPress={() => setShowAddModal(false)}>
                                <CustomText style={styles.cancelModalButtonText}>Cancel</CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveModalButton]} onPress={handleAddGoal}>
                                <CustomText style={styles.saveModalButtonText}>Add goal</CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    add: {
        fontFamily: FontMedium,
        fontSize: font14,
        lineHeight: font14 * 1.3,
        marginLeft: resAvarage(1)
    },
    perbox: {
        backgroundColor: colors.lightBlueBg,
        borderRadius: scaleSize(3),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: resWidth(3),
        paddingVertical: resWidth(1)
    },
    perInc: {
        fontSize: font16,
        lineHeight: font16 * 1.3,
        fontFamily: FontBold,
        color: colors.black,
    },
    progressBarContainer: {
        height: scaleSize(8),
        width: '100%',
        backgroundColor: colors.white90,
        borderRadius: resAvarage(100),
        overflow: 'hidden',
        marginBottom: resAvarage(2),
        borderWidth: 0.5,
        borderColor: colors.black10
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.textGreen,
        borderRadius: resAvarage(100),
    },
    noteView: {
        borderRadius: resAvarage(4),
        backgroundColor: colors.black10,
        paddingVertical: resAvarage(3),
        paddingHorizontal: resAvarage(2.5),
        marginTop: resAvarage(2),
        gap: resAvarage(2)
    },
    card: {
        marginVertical: resAvarage(3),
        marginHorizontal: resAvarage(2),
        borderRadius: resAvarage(7),
        backgroundColor: colors.white,
        paddingHorizontal: resAvarage(4),
        paddingVertical: resAvarage(3),
        shadowColor: colors.black,
        elevation: 3,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: resAvarage(1)
    },
    btn: {
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: resAvarage(1),
        paddingHorizontal: resAvarage(3)
    },
    title: {
        fontSize: font20,
        lineHeight: font20 * 1.3,
        fontFamily: FontBold,
        color: colors.textBlack,
    },
    subtitle: {
        fontSize: font12,
        letterSpacing: resAvarage(0.2),
        fontFamily: FontRegular,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: resWidth(85),
        backgroundColor: colors.white,
        borderRadius: resAvarage(5),
        padding: resAvarage(5),
        gap: resAvarage(3),
        elevation: 5,
    },
    modalTitle: {
        fontSize: font18,
        fontFamily: FontBold,
        color: colors.black,
        marginBottom: resAvarage(1),
        textTransform: 'capitalize'
    },
    input: {
        borderWidth: 1,
        borderColor: colors.black20,
        borderRadius: resAvarage(3),
        padding: resAvarage(2.5),
        fontSize: font14,
        color: colors.black,
        fontFamily: FontRegular,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: resWidth(3),
        marginTop: resAvarage(2),
    },
    modalButton: {
        paddingVertical: resAvarage(2),
        paddingHorizontal: resAvarage(4),
        borderRadius: resAvarage(100),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelModalButton: {
        backgroundColor: colors.black10,
    },
    cancelModalButtonText: {
        color: colors.black70,
        fontFamily: FontMedium,
        fontSize: font14,
    },
    saveModalButton: {
        backgroundColor: colors.black,
    },
    saveModalButtonText: {
        color: colors.white,
        fontFamily: FontBold,
        fontSize: font14,
    },
})