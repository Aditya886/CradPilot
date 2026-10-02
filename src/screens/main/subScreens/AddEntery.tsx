import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import CustomInput from '../../../ui/components/CustomInput'
import CustomButton from '../../../ui/components/CustomButton'
import { resAvarage, resWidth } from '../../../utils/responsive'
import { colors } from '../../../utils/colors'
import { goBack } from '../../../navigation/NavigationUtils'
import { insert, getWhere } from '../../../storage/local/sqlite'
import Toast from 'react-native-toast-message'
import { font16 } from '../../../utils/fontSizes'
import { FontSemiBold } from '../../../utils/fontFamily'

export default function AddEntery() {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    const handleAddBorrower = () => {
        if (!name.trim() || !phone.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Required Fields Missing',
                text2: 'Please fill name and phone number.',
            })
            return
        }

        try {
            // Check if phone already exists
            const existing = getWhere('borrowers', 'phone = ?', [phone.trim()])
            if (existing && existing.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Duplicate Phone',
                    text2: 'A borrower with this phone number already exists.',
                })
                return
            }

            insert('borrowers', {
                name: name.trim(),
                phone: phone.trim(),
                address: address.trim() || null,
            })

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Borrower added successfully.',
            })
            goBack()
        } catch (error) {
            console.error('Error adding borrower:', error)
            Toast.show({
                type: 'error',
                text1: 'Database Error',
                text2: 'Failed to add borrower to the database.',
            })
        }
    }

    return (
        <CommonBg style={{ flex: 1 }}>
            <InsightHeader title="Finance" subtitle="Add Borrower" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <CustomInput
                        label="Name"
                        placeholder="Full name"
                        value={name}
                        onChangeText={setName}
                        containerWidth={resWidth(82)}
                    />

                    <CustomInput
                        label="Phone"
                        placeholder="10-digit number"
                        keyboardType="numeric"
                        value={phone}
                        onChangeText={setPhone}
                        containerWidth={resWidth(82)}
                    />

                    <CustomInput
                        label="Address (optional)"
                        placeholder="Street, city"
                        value={address}
                        onChangeText={setAddress}
                        containerWidth={resWidth(82)}
                    />
                </View>

                <View style={styles.footerButtons}>
                    <CustomButton
                        title="Cancel"
                        onPress={() => goBack()}
                        variant="secondary"
                        // backgroundColor="transparent"
                        textColor={colors.black70}
                        style={{ flex: 1 }}
                        // buttonSize={{ paddingVertical: 0 }}
                        textStyle={styles.cancelBtnText}
                    />
                    <CustomButton
                        title="Add Borrower"
                        onPress={handleAddBorrower}
                        disabled={!name.trim() || !phone.trim()}
                        // variant="primary"
                        // backgroundColor={(!name.trim() || !phone.trim()) ? 'rgba(20, 20, 20, 0.35)' : colors.black}
                        style={{ flex: 1 }}
                        // buttonSize={{ paddingVertical: 0 }}
                        textStyle={styles.createBtnText}
                    />
                </View>
            </ScrollView>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(8),
        gap: resAvarage(3.5),
    },
    card: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: resWidth(4),
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(4.5),
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: 'rgba(20, 20, 20, 0.15)',
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.black70,
    },
    createBtn: {
        flex: 1,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        paddingVertical: resAvarage(3.5),
        justifyContent: 'center',
        alignItems: 'center',
    },
    createBtnText: {
        fontFamily: FontSemiBold,
        fontSize: font16,
        color: colors.white,
    },
})