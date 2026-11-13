import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { CommonBg } from '../../../ui/common/CommonBg';
import MoreHeader from './components/MoreHeader';
import ProfileCard from './components/ProfileCard';
import MoreList from './components/MoreList';
import { aboutList, MoreFeatureList } from '../../../assets/DefaultData';
import CustomText from '../../../ui/components/CustomText';
import { colors } from '../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../utils/fontFamily';
import { font10, font11, font12, font13, font14, font16 } from '../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../utils/responsive';
import LogoutIcon from '../../../assets/images/icons/logout.svg';
import ExportImportModal from '../../../ui/modals/ExportImportModal';
import LogoutModal from '../../../ui/modals/LogoutModal';
import { fullBackupService } from '../../../services/fullBackupService';
import { importService } from '../../../services/importService';
import Next from '../../../assets/images/icons/next.svg';
import Export from '../../../assets/images/icons/export.svg';
import Import from '../../../assets/images/icons/import.svg';
import { useAppDispatch } from '../../../utils/hooks';
import { setCurrentUser, setCurrentProfileName, setCurrentProfileImage } from '../../../storage/redux/silce/AuthSlice';
import AsyncStorageUtils from '../../../utils/storage';
import { logoutOneSignalUser } from '../../../services/oneSignalService';
import { cancelAllLocalNotifications } from '../../../services/localNotificationService';
import { resetAndNavigate } from '../../../navigation/NavigationUtils';

export default function More() {
    const dispatch = useAppDispatch();
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupInitialMode, setBackupInitialMode] = useState<'export' | 'import'>('export');
    const [flattenedRows, setFlattenedRows] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any>({});
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = async () => {
        try {
            setShowLogoutModal(false);
            // Clear user session from storage
            await AsyncStorageUtils.removeItem('user_session');

            // Call OneSignal and local notifications logout/clear
            logoutOneSignalUser();
            await cancelAllLocalNotifications();

            // Clear Redux state
            dispatch(setCurrentUser(null));
            dispatch(setCurrentProfileName(null));
            dispatch(setCurrentProfileImage(null));

            resetAndNavigate("Login");
        } catch (e) {
            console.error('[More] Error during logout:', e);
            resetAndNavigate("Login");
        }
    };

    const loadBackupData = async () => {
        try {
            const data = await fullBackupService.collectAllAppData();
            setFlattenedRows(data.flattenedRows);
            setSummaryData(data.summary);
        } catch (e) {
            console.error('Error loading backup data:', e);
        }
    };

    useEffect(() => {
        loadBackupData();
    }, [showBackupModal]);

    const handleOpenExport = async () => {
        await loadBackupData();
        setBackupInitialMode('export');
        setShowBackupModal(true);
    };

    const handleOpenImport = async () => {
        await loadBackupData();
        setBackupInitialMode('import');
        setShowBackupModal(true);
    };

    const aboutListWithLogout = [
        ...aboutList,
        {
            id: 4,
            title: 'Logout',
            icon: LogoutIcon,
        },
    ];

    return (
        <CommonBg>
            <MoreHeader />
            <ProfileCard />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: resAvarage(2) }}
                contentContainerStyle={{ paddingBottom: resAvarage(3), marginTop: resAvarage(1) }}
            >
                <MoreList title={'More Features'} data={MoreFeatureList} />

                {/* DATA BACKUP & TRANSFER SECTION */}
                <View style={styles.sectionContainer}>
                    <CustomText style={styles.sectionHeader}>DATA BACKUP &amp; DEVICE TRANSFER</CustomText>
                    <View style={styles.backupCard}>
                        {/* Export Action */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleOpenExport}
                            style={styles.backupRow}
                        >
                            <View style={styles.leftRow}>
                                <View style={[styles.iconCircle, { backgroundColor: colors.theme }]}>
                                    <Export />
                                </View>
                                <View>
                                    <CustomText style={styles.cardTitle}>Export Complete App Data</CustomText>
                                    <CustomText style={styles.cardSubtitle}>
                                        Backup all sections into Excel or PDF · Password verified
                                    </CustomText>
                                </View>
                            </View>
                            <Next width={resAvarage(4)} height={resAvarage(4)} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Import Action */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleOpenImport}
                            style={styles.backupRow}
                        >
                            <View style={styles.leftRow}>
                                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                                    <Import />
                                </View>
                                <View>
                                    <CustomText style={styles.cardTitle}>Import / Restore App Data</CustomText>
                                    <CustomText style={styles.cardSubtitle}>
                                        Restore full backup for new device or account switch
                                    </CustomText>
                                </View>
                            </View>
                            <Next width={resAvarage(4)} height={resAvarage(4)} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginTop: resAvarage(2) }} />
                <MoreList
                    title={'About'}
                    data={aboutListWithLogout}
                    onLogoutPress={() => setShowLogoutModal(true)}
                />

                <CustomText style={styles.footer}>private · on-device · yours alone</CustomText>
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <LogoutModal
                show={showLogoutModal}
                setShow={setShowLogoutModal}
                onPress={handleLogout}
            />

            {/* Complete App Export & Import Modal */}
            <ExportImportModal
                visible={showBackupModal}
                onClose={() => setShowBackupModal(false)}
                sectionTitle="Complete App Backup"
                sectionSubtitle="Full Database & Tuition Synchronizer"
                exportColumns={fullBackupService.getColumns()}
                exportRows={flattenedRows}
                exportSummary={summaryData}
                defaultFilename={`CredPilot_FullBackup_${new Date().toISOString().split('T')[0]}`}
                initialMode={backupInitialMode}
                sampleImportFormat={fullBackupService.getSampleBackupFormat()}
                onImportData={async (rawInput) => {
                    const res = await importService.importCompleteAppBackup(rawInput);
                    await loadBackupData();
                    return res;
                }}
            />
        </CommonBg>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: resAvarage(2),
        paddingHorizontal: resAvarage(3),
    },
    sectionHeader: {
        fontSize: font12,
        fontFamily: FontRegular,
        textTransform: 'uppercase',
        letterSpacing: resAvarage(0.2),
        marginBottom: resAvarage(1.5),
        color: colors.black70,
    },
    backupCard: {
        backgroundColor: colors.white,
        borderRadius: resAvarage(4),
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(1),
        elevation: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
    },
    backupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: resAvarage(1.8),
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(2),
    },
    iconCircle: {
        width: resAvarage(5),
        height: resAvarage(5),
        borderRadius: resAvarage(100),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: font16,
    },
    cardTitle: {
        fontSize: font14,
        fontFamily: FontSemiBold,
        letterSpacing: resAvarage(0.1),
        color: colors.black,
    },
    cardSubtitle: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black60,
        width: resWidth(60),
        marginTop: resAvarage(0.3),
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: resAvarage(1),
    },
    footer: {
        textTransform: 'uppercase',
        textAlign: 'center',
        letterSpacing: resAvarage(0.3),
        width: resWidth(100),
        marginTop: resAvarage(2),
        fontSize: font10,
        marginBottom: resAvarage(18),
        color: colors.black60,
        fontFamily: FontMedium,
    },
});