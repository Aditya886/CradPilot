import React, { useState, useEffect } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native'
import { CommonBg } from '../../../ui/common/CommonBg'
import InsightHeader from './components/InsightHeader'
import CustomInput from '../../../ui/components/CustomInput'
import CustomButton from '../../../ui/components/CustomButton'
import CustomText from '../../../ui/components/CustomText'
import { resAvarage, resWidth } from '../../../utils/responsive'
import { colors } from '../../../utils/colors'
import { font12, font14, font15, font16, font18, font22 } from '../../../utils/fontSizes'
import { FontBold, FontMedium, FontSemiBold } from '../../../utils/fontFamily'
import { goBack } from '../../../navigation/NavigationUtils'
import { useAppDispatch, useAppSelector } from '../../../utils/hooks'
import { setCurrentProfileName, setCurrentProfileImage } from '../../../storage/redux/silce/AuthSlice'
import { masterQuery, masterUpdate } from '../../../storage/local/sqlite'
import { ShowToast } from '../../../utils/CustomToast/ToastManager'
import ImagePicker from 'react-native-image-crop-picker'
import EditIcon from '../../../assets/images/icons/edit.svg'
import LockIcon from '../../../assets/images/icons/password.svg'

export default function EditProfile() {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(state => state.app.currentUser)
    const reduxProfileName = useAppSelector(state => state.app.currentProfileName)
    const reduxProfileImage = useAppSelector(state => state.app.currentProfileImage)

    // Profile state
    const [displayName, setDisplayName] = useState("")
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [userRecord, setUserRecord] = useState<any>(null)

    // Password change flow state
    const [showPasswordChange, setShowPasswordChange] = useState(false)
    const [verifyStep, setVerifyStep] = useState<1 | 2>(1) // 1: Verify QA/code, 2: Reset
    const [answer, setAnswer] = useState("")
    const [recoveryCode, setRecoveryCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (currentUser) {
            try {
                const user = masterQuery("SELECT * FROM users WHERE username = ? LIMIT 1", [currentUser]);
                if (user && user.length > 0) {
                    setUserRecord(user[0]);
                    setDisplayName(user[0].display_name || user[0].username);
                    setProfileImage(user[0].profile_image || null);
                }
            } catch (e) {
                console.error("Failed to load user info in EditProfile:", e);
            }
        }
    }, [currentUser]);

    const handlePickImage = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
        }).then(image => {
            setProfileImage(image.path);
        }).catch(err => {
            console.log('Image picker error:', err);
        });
    };

    const handleVerify = () => {
        if (!userRecord) return;
        if (userRecord.recovery_type === 'QA') {
            if (!answer.trim()) {
                ShowToast("Please enter your answer", "error");
                return;
            }
            if (userRecord.recovery_answer && answer.trim().toLowerCase() === userRecord.recovery_answer.toLowerCase()) {
                setVerifyStep(2);
            } else {
                ShowToast("Incorrect answer", "error");
            }
        } else {
            if (!recoveryCode.trim()) {
                ShowToast("Please enter a recovery code", "error");
                return;
            }
            const savedCodes = (userRecord.recovery_codes || "").split(',');
            if (savedCodes.includes(recoveryCode.trim())) {
                setVerifyStep(2);
            } else {
                ShowToast("Incorrect recovery code", "error");
            }
        }
    };

    const handleChangePassword = () => {
        if (newPassword.length < 4) {
            ShowToast("Password must be at least 4 characters", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            ShowToast("Passwords do not match", "error");
            return;
        }

        try {
            masterUpdate("users", userRecord.id, {
                password: newPassword
            });
            ShowToast("Password changed successfully", "success");
            // reset password inputs
            setNewPassword("");
            setConfirmPassword("");
            setAnswer("");
            setRecoveryCode("");
            setShowPasswordChange(false);
            setVerifyStep(1);
        } catch (e) {
            console.error("Failed to update password:", e);
            ShowToast("Failed to change password", "error");
        }
    };

    const handleSaveProfile = () => {
        if (!displayName.trim()) {
            ShowToast("Profile name cannot be empty", "error");
            return;
        }
        if (!userRecord) return;

        try {
            masterUpdate("users", userRecord.id, {
                display_name: displayName.trim(),
                profile_image: profileImage
            });

            dispatch(setCurrentProfileName(displayName.trim()));
            dispatch(setCurrentProfileImage(profileImage));

            ShowToast("Profile updated successfully", "success");
            goBack();
        } catch (e) {
            console.error("Failed to save profile:", e);
            ShowToast("Failed to save profile changes", "error");
        }
    };

    const initial = (displayName.trim()?.[0] || 'U').toUpperCase();

    return (
        <CommonBg style={{ flex: 1 }}>
            <InsightHeader title="Finance" subtitle="Edit Profile" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                automaticallyAdjustKeyboardInsets
            >
                <View style={styles.card}>
                    {/* Avatar picker container */}
                    <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8} style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <CustomText style={styles.avatarLetter}>{initial}</CustomText>
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <EditIcon width={resAvarage(2.5)} height={resAvarage(2.5)} />
                        </View>
                    </TouchableOpacity>

                    <CustomInput
                        label="Profile Name"
                        placeholder="Your display name"
                        value={displayName}
                        onChangeText={setDisplayName}
                        containerWidth={resWidth(82)}
                    />
                </View>

                {/* Change Password Block */}
                {!showPasswordChange ? (
                    <TouchableOpacity 
                        style={styles.changePasswordTrigger} 
                        onPress={() => setShowPasswordChange(true)}
                        activeOpacity={0.8}
                    >
                        <LockIcon width={resAvarage(3.5)} height={resAvarage(3.5)} />
                        <CustomText style={styles.changePasswordTriggerText}>Change Password</CustomText>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.passwordCard}>
                        <View style={styles.passwordHeader}>
                            <CustomText style={styles.passwordTitle}>Change Password</CustomText>
                            <TouchableOpacity onPress={() => {
                                setShowPasswordChange(false);
                                setVerifyStep(1);
                            }}>
                                <CustomText style={styles.cancelText}>Cancel</CustomText>
                            </TouchableOpacity>
                        </View>

                        {verifyStep === 1 && userRecord && (
                            <View style={{ gap: resAvarage(0.5) }}>
                                <CustomText style={styles.subtitle}>
                                    {userRecord.recovery_type === 'QA' 
                                        ? "Answer your security question to change password." 
                                        : "Enter one of your recovery codes."
                                    }
                                </CustomText>

                                {userRecord.recovery_type === 'QA' ? (
                                    <View style={{ gap: resAvarage(0), marginTop: resAvarage(1) }}>
                                        <CustomText style={styles.questionText}>
                                            {`Question: ${userRecord.recovery_question}`}
                                        </CustomText>
                                        <CustomInput
                                            label="Answer"
                                            placeholder="Enter security answer"
                                            value={answer}
                                            onChangeText={setAnswer}
                                            containerWidth={resWidth(76)}
                                        />
                                    </View>
                                ) : (
                                    <CustomInput
                                        label="Recovery Code"
                                        placeholder="Enter recovery code"
                                        value={recoveryCode}
                                        onChangeText={setRecoveryCode}
                                        containerWidth={resWidth(76)}
                                    />
                                )}
                                <CustomButton onPress={handleVerify} style={{ marginTop: resAvarage(2) }} title="Verify Identity" />
                            </View>
                        )}

                        {verifyStep === 2 && (
                            <View style={{ gap: resAvarage(0.5) }}>
                                <CustomText style={styles.subtitle}>Enter and confirm your new password.</CustomText>
                                <CustomInput
                                    label="New Password"
                                    Prefix={LockIcon}
                                    secure
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    containerWidth={resWidth(76)}
                                />
                                <CustomInput
                                    label="Confirm New Password"
                                    Prefix={LockIcon}
                                    secure
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    containerWidth={resWidth(76)}
                                />
                                <CustomButton onPress={handleChangePassword} style={{ marginTop: resAvarage(2) }} title="Change Password" />
                            </View>
                        )}
                    </View>
                )}

                {/* Footer save/cancel buttons */}
                <View style={styles.footerButtons}>
                    <CustomButton
                        title="Cancel"
                        onPress={() => goBack()}
                        variant="secondary"
                        textColor={colors.black70}
                        style={{ flex: 1 }}
                    />
                    <CustomButton
                        title="Save Changes"
                        onPress={handleSaveProfile}
                        disabled={!displayName.trim()}
                        style={{ flex: 1 }}
                    />
                </View>
            </ScrollView>
        </CommonBg>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: resAvarage(2),
        paddingBottom: resAvarage(8),
        gap: resAvarage(3),
    },
    card: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        alignItems: 'center',
        gap: resAvarage(2)
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: resAvarage(1),
    },
    avatar: {
        width: resWidth(22),
        height: resWidth(22),
        borderRadius: resWidth(100),
        backgroundColor: colors.black10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.black20,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: resWidth(100),
    },
    avatarLetter: {
        fontSize: font22 * 1.5,
        lineHeight: font22 * 1.8,
        color: colors.black,
        fontFamily: FontBold
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.black,
        borderRadius: resAvarage(100),
        padding: resAvarage(1.5),
        borderWidth: 1.5,
        borderColor: colors.bgWhite,
    },
    changePasswordTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: resAvarage(1.5),
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        paddingVertical: resAvarage(3.5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
    },
    changePasswordTriggerText: {
        fontSize: font15,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    passwordCard: {
        backgroundColor: colors.bgWhite,
        marginHorizontal: resWidth(4),
        padding: resAvarage(5),
        borderRadius: resAvarage(7),
        borderWidth: 1,
        borderColor: 'rgba(20, 20, 20, 0.08)',
        gap: resAvarage(2),
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.black10,
        paddingBottom: resAvarage(1),
    },
    passwordTitle: {
        fontSize: font16,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    cancelText: {
        fontSize: font14,
        fontFamily: FontMedium,
        color: colors.textRed,
    },
    subtitle: {
        fontSize: font14,
        color: colors.black70,
        fontFamily: FontMedium,
        marginTop: resAvarage(1),
    },
    questionText: {
        fontSize: font15,
        fontFamily: FontMedium,
        color: colors.black,
        marginBottom: resAvarage(1.5),
        paddingHorizontal: resAvarage(1),
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: resWidth(4),
        marginHorizontal: resWidth(4),
        marginTop: resAvarage(2),
    },
})
