import { StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { resAvarage, resWidth } from '../../../../utils/responsive'
import CustomText from '../../../../ui/components/CustomText'
import { colors } from '../../../../utils/colors'
import { font18, font12, font15, font28 } from '../../../../utils/fontSizes'
import { FontMedium } from '../../../../utils/fontFamily'
import Edit from "../../../../assets/images/icons/edit.svg"
import { useAppSelector } from '../../../../utils/hooks'
import { navigate } from '../../../../navigation/NavigationUtils'

export default function ProfileCard() {
    const profileName = useAppSelector(state => state.app.currentProfileName)
    const profileImage = useAppSelector(state => state.app.currentProfileImage)
    
    const displayName = profileName || 'User'
    const initial = (displayName.trim()?.[0] || 'U').toUpperCase()

    return (
        <View style={styles.main} >
            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.info}>
                        <View style={styles.avatar}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <CustomText style={styles.avatarLetter}>{initial}</CustomText>
                            )}
                        </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }} >
                        <CustomText style={styles.name}>{displayName}</CustomText>
                        <CustomText style={styles.email}>Local profile</CustomText>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={() => navigate("EditProfile")} activeOpacity={0.8} style={styles.edit} >
                <Edit width={resAvarage(4)} height={resAvarage(4)} />
                <CustomText style={styles.editText}>Edit</CustomText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: resAvarage(4),
        borderRadius: resAvarage(5),
        backgroundColor: colors.black
    },
    edit: {
        width: resWidth(28),
        height: resWidth(28),
        alignItems: "center",
        justifyContent: 'center',
        padding: resAvarage(4),
        borderRadius: resAvarage(50),
        backgroundColor: colors.black
    },
    main: {
        marginHorizontal: resAvarage(3),
        marginTop: resAvarage(2),
        flexDirection: 'row',
        justifyContent: "space-between",
        gap: resAvarage(2)
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2)
    },
    avatar: {
        width: resWidth(15),
        height: resWidth(15),
        borderRadius: resWidth(100),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: resWidth(100),
    },
    avatarLetter: {
        fontSize: font28,
        lineHeight: font28 * 1.3,
        color: colors.white,
        fontFamily: FontMedium
    },
    name: {
        color: colors.theme,
        fontSize: font18,
        fontFamily: FontMedium
    },
    email: {
        color: colors.white90,
        fontSize: font15,
        fontFamily: FontMedium
    },
    editText: {
        color: colors.white90,
        fontSize: font15,
        fontFamily: FontMedium
    }
})