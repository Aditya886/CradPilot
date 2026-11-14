import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ActivityIndicator,
    Animated,
} from 'react-native';
import CustomText from '../components/CustomText';
import { colors } from '../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../utils/fontFamily';
import { font11, font12, font13, font14, font15, font18, font20 } from '../../utils/fontSizes';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import { exportService, ExportColumn } from '../../services/exportService';
import { importService, ImportParseResult } from '../../services/importService';
import { showFlashMessage } from '../../utils/flashMessage';
import PasswordAuthModal from './PasswordAuthModal';
import CloseIcon from '../../assets/images/icons/close.svg';
import { subscriptionService } from '../../services/subscriptionService';

export interface ExportImportModalProps {
    visible: boolean;
    onClose: () => void;
    sectionTitle: string;
    sectionSubtitle?: string;
    // Export data
    exportColumns: ExportColumn[];
    exportRows: Record<string, any>[];
    exportSummary?: Record<string, string | number>;
    defaultFilename?: string;
    // Import handler
    onImportData: (rawInput: string, format: 'excel' | 'pdf') => Promise<ImportParseResult>;
    sampleImportFormat?: string;
    initialMode?: 'export' | 'import';
}

export default function ExportImportModal({
    visible,
    onClose,
    sectionTitle,
    sectionSubtitle,
    exportColumns,
    exportRows,
    exportSummary,
    defaultFilename,
    onImportData,
    sampleImportFormat,
    initialMode = 'export',
}: ExportImportModalProps) {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialMode);
    const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
    const [importInput, setImportInput] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'export' | 'import' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [showSample, setShowSample] = useState(false);
    const tranformY = useRef(new Animated.Value(resHeight(100))).current;

    // Reset tab and run entrance animation when modal opens
    useEffect(() => {
        if (visible) {
            setActiveTab(initialMode);
            setImportInput('');
            setShowSample(false);
            Animated.timing(tranformY, {
                duration: 300,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        } else {
            tranformY.setValue(resHeight(100));
        }
    }, [visible, initialMode]);

    const close = () => {
        Animated.timing(tranformY, {
            toValue: resHeight(100),
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleTriggerExport = () => {
        if (!subscriptionService.canUseExportImport()) {
            close();
            return;
        }
        setPendingAction('export');
        setShowPasswordModal(true);
    };

    const handleTriggerImport = () => {
        if (!subscriptionService.canUseExportImport()) {
            close();
            return;
        }
        if (!importInput.trim()) {
            showFlashMessage('Please paste or enter data to import', 'error');
            return;
        }

        const formatValidation = importService.validateFormat(importInput);
        if (!formatValidation.valid) {
            showFlashMessage('Invalid format! Only Excel (.xlsx/.csv) or PDF report data is allowed.', 'error');
            return;
        }

        setPendingAction('import');
        setShowPasswordModal(true);
    };

    const handlePasswordSuccess = async () => {
        setShowPasswordModal(false);

        if (pendingAction === 'export') {
            await executeExport();
        } else if (pendingAction === 'import') {
            await executeImport();
        }
        setPendingAction(null);
    };

    const executeExport = async () => {
        setProcessing(true);
        try {
            const filename = (defaultFilename || `CredPilot_${sectionTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
            let content = '';

            if (selectedFormat === 'excel') {
                content = exportService.generateExcelXml({
                    title: sectionTitle,
                    subtitle: sectionSubtitle,
                    columns: exportColumns,
                    rows: exportRows,
                    summary: exportSummary,
                    filename,
                });
            } else {
                content = exportService.generatePdf({
                    title: sectionTitle,
                    subtitle: sectionSubtitle,
                    columns: exportColumns,
                    rows: exportRows,
                    summary: exportSummary,
                    filename,
                });
            }

            const res = await exportService.shareOrDownloadFile({
                filename,
                format: selectedFormat,
                content,
                title: `${sectionTitle} Export`,
            });

            setProcessing(false);
            if (res.success) {
                showFlashMessage(`Successfully exported ${sectionTitle} (${selectedFormat.toUpperCase()}) to Downloads!`, 'success');
                close();
            } else {
                showFlashMessage(res.message || 'Export completed', 'info');
                close();
            }
        } catch (e: any) {
            setProcessing(false);
            showFlashMessage(e?.message || 'Failed to export file', 'error');
        }
    };

    const executeImport = async () => {
        setProcessing(true);
        try {
            const formatValidation = importService.validateFormat(importInput);
            const format = formatValidation.format === 'pdf' ? 'pdf' : 'excel';

            const result = await onImportData(importInput, format);
            setProcessing(false);

            if (result.success) {
                showFlashMessage(result.message || 'Data imported successfully!', 'success');
                setImportInput('');
                close();
            } else {
                showFlashMessage(result.message || 'Failed to import data', 'error');
            }
        } catch (e: any) {
            setProcessing(false);
            showFlashMessage(e?.message || 'Error occurred during import', 'error');
        }
    };

    const handleLoadSample = () => {
        if (sampleImportFormat) {
            setImportInput(sampleImportFormat);
            setShowSample(false);
            showFlashMessage('Sample template loaded into input box', 'info');
        }
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={close}
            >
                <TouchableWithoutFeedback onPress={close}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.sheetContainer,
                                    { transform: [{ translateY: tranformY }] },
                                ]}
                            >
                                {/* Top Handle Bar */}
                                <View style={styles.handleBar} />

                                {/* Header */}
                                <View style={styles.headerRow}>
                                    <View style={styles.headerTextGroup}>
                                        <CustomText style={styles.sheetTitle}>{sectionTitle}</CustomText>
                                        <CustomText style={styles.sheetSubtitle}>
                                            {sectionSubtitle || 'Data Backup & Device Transfer'}
                                        </CustomText>
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={close}
                                        style={styles.closeBtn}
                                    >
                                        <CloseIcon width={resAvarage(2.6)} height={resAvarage(2.6)} />
                                    </TouchableOpacity>
                                </View>

                                {/* CredPilot Segmented Tabs */}
                                <View style={styles.tabContainer}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setActiveTab('export')}
                                        style={[styles.tabBtn, activeTab === 'export' && styles.activeTabBtn]}
                                    >
                                        <CustomText
                                            style={[styles.tabText, activeTab === 'export' && styles.activeTabText]}
                                        >
                                            Export to File
                                        </CustomText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => setActiveTab('import')}
                                        style={[styles.tabBtn, activeTab === 'import' && styles.activeTabBtn]}
                                    >
                                        <CustomText
                                            style={[styles.tabText, activeTab === 'import' && styles.activeTabText]}
                                        >
                                            Import Data
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.scrollContent}
                                >
                                    {activeTab === 'export' ? (
                                        /* ================= EXPORT TAB ================= */
                                        <View style={styles.tabContent}>
                                            <CustomText style={styles.sectionHeaderLabel}>
                                                CHOOSE FORMAT
                                            </CustomText>

                                            <View style={styles.formatRow}>
                                                {/* Excel Option */}
                                                <TouchableOpacity
                                                    activeOpacity={0.85}
                                                    onPress={() => setSelectedFormat('excel')}
                                                    style={[
                                                        styles.formatCard,
                                                        selectedFormat === 'excel' && styles.selectedFormatCard,
                                                    ]}
                                                >
                                                    <View style={styles.formatTopRow}>
                                                        <View
                                                            style={[
                                                                styles.formatIconCircle,
                                                                selectedFormat === 'excel' && styles.selectedIconCircle,
                                                            ]}
                                                        >
                                                            <CustomText style={styles.formatSymbol}>XLS</CustomText>
                                                        </View>
                                                        <View
                                                            style={[
                                                                styles.formatBadge,
                                                                selectedFormat === 'excel' && styles.selectedFormatBadge,
                                                            ]}
                                                        >
                                                            <CustomText
                                                                style={[
                                                                    styles.formatBadgeText,
                                                                    selectedFormat === 'excel' && styles.selectedBadgeText,
                                                                ]}
                                                            >
                                                                Excel
                                                            </CustomText>
                                                        </View>
                                                    </View>
                                                    <CustomText style={styles.formatTitle}>Spreadsheet</CustomText>
                                                    <CustomText style={styles.formatDesc}>
                                                        Structured workbook (.xlsx) with columns, formulas, and totals.
                                                    </CustomText>
                                                </TouchableOpacity>

                                                {/* PDF Option */}
                                                <TouchableOpacity
                                                    activeOpacity={0.85}
                                                    onPress={() => setSelectedFormat('pdf')}
                                                    style={[
                                                        styles.formatCard,
                                                        selectedFormat === 'pdf' && styles.selectedFormatCard,
                                                    ]}
                                                >
                                                    <View style={styles.formatTopRow}>
                                                        <View
                                                            style={[
                                                                styles.formatIconCircle,
                                                                selectedFormat === 'pdf' && styles.selectedIconCircle,
                                                            ]}
                                                        >
                                                            <CustomText style={styles.formatSymbol}>PDF</CustomText>
                                                        </View>
                                                        <View
                                                            style={[
                                                                styles.formatBadge,
                                                                selectedFormat === 'pdf' && styles.selectedFormatBadge,
                                                            ]}
                                                        >
                                                            <CustomText
                                                                style={[
                                                                    styles.formatBadgeText,
                                                                    selectedFormat === 'pdf' && styles.selectedBadgeText,
                                                                ]}
                                                            >
                                                                Report
                                                            </CustomText>
                                                        </View>
                                                    </View>
                                                    <CustomText style={styles.formatTitle}>PDF Document</CustomText>
                                                    <CustomText style={styles.formatDesc}>
                                                        Printable overview (.pdf) with clean CredPilot metrics & tables.
                                                    </CustomText>
                                                </TouchableOpacity>
                                            </View>

                                            {/* Preview Card */}
                                            <View style={styles.previewCard}>
                                                <View style={styles.previewHeader}>
                                                    <CustomText style={styles.previewTitle}>EXPORT PREVIEW</CustomText>
                                                    <View style={styles.recordBadge}>
                                                        <CustomText style={styles.recordBadgeText}>
                                                            {exportRows.length} Records
                                                        </CustomText>
                                                    </View>
                                                </View>

                                                <View style={styles.previewRow}>
                                                    <CustomText style={styles.previewLabel}>Columns:</CustomText>
                                                    <CustomText style={styles.previewValue} numberOfLines={2}>
                                                        {exportColumns.map(c => c.label).join(', ')}
                                                    </CustomText>
                                                </View>

                                                {exportSummary && Object.keys(exportSummary).length > 0 && (
                                                    <View style={styles.summaryGrid}>
                                                        {Object.entries(exportSummary).map(([k, v]) => (
                                                            <View key={k} style={styles.summaryItem}>
                                                                <CustomText style={styles.summaryKey}>{k}</CustomText>
                                                                <CustomText style={styles.summaryVal}>{String(v)}</CustomText>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>

                                            <CustomText style={styles.noteText}>
                                                Password authorization is required before file generation.
                                            </CustomText>

                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={handleTriggerExport}
                                                style={styles.actionBtn}
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <ActivityIndicator color={colors.black} size="small" />
                                                ) : (
                                                    <CustomText style={styles.actionBtnText}>
                                                        Export to Downloads
                                                    </CustomText>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        /* ================= IMPORT TAB ================= */
                                        <View style={styles.tabContent}>
                                            {/* Clean Notice */}
                                            <View style={styles.noticeCard}>
                                                <CustomText style={styles.noticeTitle}>
                                                    DATA RESTORE GUIDELINE
                                                </CustomText>
                                                <CustomText style={styles.noticeText}>
                                                    Supports Excel (.xlsx, .csv) and PDF report text. All changes require security password verification before applying.
                                                </CustomText>
                                            </View>

                                            {/* Template Helpers */}
                                            {sampleImportFormat && (
                                                <View style={styles.templateRow}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={() => setShowSample(prev => !prev)}
                                                        style={styles.templateToggleBtn}
                                                    >
                                                        <CustomText style={styles.templateToggleText}>
                                                            {showSample ? 'Hide Template' : 'View Sample Format'}
                                                        </CustomText>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        activeOpacity={0.7}
                                                        onPress={handleLoadSample}
                                                        style={styles.loadSamplePill}
                                                    >
                                                        <CustomText style={styles.loadSamplePillText}>
                                                            Load Template
                                                        </CustomText>
                                                    </TouchableOpacity>
                                                </View>
                                            )}

                                            {showSample && sampleImportFormat && (
                                                <View style={styles.sampleBox}>
                                                    <CustomText style={styles.sampleCodeText}>
                                                        {sampleImportFormat}
                                                    </CustomText>
                                                </View>
                                            )}

                                            {/* Input label and textarea */}
                                            <CustomText style={styles.sectionHeaderLabel}>
                                                PASTE BACKUP OR CSV DATA
                                            </CustomText>
                                            <TextInput
                                                style={styles.importTextInput}
                                                placeholder={`Paste Excel rows, CSV text, or backup content here...\n\nExample:\nName,Class,Amount,Status\nAman,Class 10,2000,Overdue`}
                                                placeholderTextColor={colors.black40}
                                                multiline
                                                numberOfLines={8}
                                                value={importInput}
                                                onChangeText={setImportInput}
                                            />

                                            <CustomText style={styles.noteText}>
                                                Password authorization is required to apply restored data.
                                            </CustomText>

                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={handleTriggerImport}
                                                style={styles.actionBtn}
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <ActivityIndicator color={colors.black} size="small" />
                                                ) : (
                                                    <CustomText style={styles.actionBtnText}>
                                                        Authorize & Import Data
                                                    </CustomText>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </ScrollView>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Password Verification Modal */}
            <PasswordAuthModal
                visible={showPasswordModal}
                actionType={pendingAction || 'export'}
                sectionName={sectionTitle}
                onClose={() => {
                    setShowPasswordModal(false);
                    setPendingAction(null);
                }}
                onAuthorized={handlePasswordSuccess}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000080',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: colors.bgWhite,
        borderTopLeftRadius: scaleSize(24),
        borderTopRightRadius: scaleSize(24),
        paddingHorizontal: resAvarage(4),
        paddingTop: scaleSize(12),
        paddingBottom: scaleSize(28),
        maxHeight: '92%',
    },
    handleBar: {
        width: resWidth(12),
        height: scaleSize(4),
        backgroundColor: colors.black20,
        borderRadius: scaleSize(2),
        alignSelf: 'center',
        marginBottom: scaleSize(14),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleSize(8),
    },
    headerTextGroup: {
        flex: 1,
        paddingRight: scaleSize(12),
    },
    sheetTitle: {
        fontSize: font20,
        fontFamily: FontBold,
        color: colors.black,
    },
    sheetSubtitle: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        marginTop: scaleSize(2),
    },
    closeBtn: {
        padding: scaleSize(8),
        borderRadius: resAvarage(100),
        backgroundColor: colors.bgColor,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgColor,
        borderRadius: resAvarage(100),
        padding: scaleSize(3),
        marginVertical: scaleSize(16),
    },
    tabBtn: {
        flex: 1,
        paddingVertical: scaleSize(10),
        alignItems: 'center',
        borderRadius: resAvarage(100),
    },
    activeTabBtn: {
        backgroundColor: colors.black,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: font13,
        fontFamily: FontMedium,
        color: colors.black60,
    },
    activeTabText: {
        color: colors.white,
        fontFamily: FontBold,
    },
    scrollContent: {
        paddingBottom: scaleSize(16),
    },
    tabContent: {
        gap: scaleSize(14),
    },
    sectionHeaderLabel: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black60,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    formatRow: {
        flexDirection: 'row',
        gap: resAvarage(1.5),
    },
    formatCard: {
        flex: 1,
        borderRadius: scaleSize(16),
        padding: scaleSize(14),
        backgroundColor: colors.bgColor,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    selectedFormatCard: {
        backgroundColor: colors.bgWhite,
        borderColor: colors.black,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    formatTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scaleSize(10),
    },
    formatIconCircle: {
        width: scaleSize(34),
        height: scaleSize(34),
        borderRadius: scaleSize(10),
        backgroundColor: colors.black10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIconCircle: {
        backgroundColor: colors.theme,
    },
    formatSymbol: {
        fontFamily: FontBold,
        fontSize: font11,
        color: colors.black,
        letterSpacing: 0.5,
    },
    formatBadge: {
        paddingHorizontal: scaleSize(8),
        paddingVertical: scaleSize(2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.black10,
    },
    selectedFormatBadge: {
        backgroundColor: colors.black,
    },
    formatBadgeText: {
        fontFamily: FontSemiBold,
        fontSize: font11,
        color: colors.black70,
    },
    selectedBadgeText: {
        color: colors.white,
    },
    formatTitle: {
        fontFamily: FontBold,
        fontSize: font15,
        color: colors.black,
        marginBottom: scaleSize(3),
    },
    formatDesc: {
        fontFamily: FontRegular,
        fontSize: font11,
        color: colors.black60,
        lineHeight: font11 * 1.35,
    },
    previewCard: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(16),
        padding: scaleSize(14),
        gap: scaleSize(8),
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: scaleSize(6),
        borderBottomWidth: 1,
        borderBottomColor: colors.black10,
    },
    previewTitle: {
        fontFamily: FontBold,
        fontSize: font12,
        color: colors.black70,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    recordBadge: {
        backgroundColor: colors.theme,
        paddingHorizontal: scaleSize(10),
        paddingVertical: scaleSize(3),
        borderRadius: resAvarage(100),
    },
    recordBadgeText: {
        fontFamily: FontBold,
        fontSize: font11,
        color: colors.black,
    },
    previewRow: {
        flexDirection: 'row',
        gap: scaleSize(8),
    },
    previewLabel: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black60,
    },
    previewValue: {
        flex: 1,
        fontFamily: FontRegular,
        fontSize: font12,
        color: colors.black80,
    },
    summaryGrid: {
        marginTop: scaleSize(4),
        paddingTop: scaleSize(8),
        borderTopWidth: 1,
        borderTopColor: colors.black10,
        gap: scaleSize(4),
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryKey: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.black60,
    },
    summaryVal: {
        fontFamily: FontBold,
        fontSize: font12,
        color: colors.black,
    },
    noticeCard: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(14),
        padding: scaleSize(14),
        gap: scaleSize(4),
        borderWidth: 1,
        borderColor: colors.black10,
    },
    noticeTitle: {
        fontSize: font11,
        fontFamily: FontBold,
        color: colors.black70,
        letterSpacing: 0.5,
    },
    noticeText: {
        fontSize: font12,
        fontFamily: FontRegular,
        color: colors.black60,
        lineHeight: font12 * 1.35,
    },
    templateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    templateToggleBtn: {
        paddingVertical: scaleSize(4),
    },
    templateToggleText: {
        fontSize: font12,
        fontFamily: FontSemiBold,
        color: colors.textBlue,
        textDecorationLine: 'underline',
    },
    loadSamplePill: {
        backgroundColor: colors.black10,
        paddingHorizontal: scaleSize(12),
        paddingVertical: scaleSize(6),
        borderRadius: resAvarage(100),
    },
    loadSamplePillText: {
        fontSize: font12,
        fontFamily: FontSemiBold,
        color: colors.black,
    },
    sampleBox: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(12),
        borderWidth: 1,
        borderColor: colors.black10,
        padding: scaleSize(12),
    },
    sampleCodeText: {
        fontSize: font11,
        fontFamily: 'monospace',
        color: colors.black80,
        lineHeight: font11 * 1.45,
    },
    importTextInput: {
        backgroundColor: colors.bgColor,
        borderRadius: scaleSize(16),
        borderWidth: 1.5,
        borderColor: colors.black10,
        padding: scaleSize(14),
        fontSize: font13,
        fontFamily: FontMedium,
        color: colors.black,
        minHeight: scaleSize(130),
        textAlignVertical: 'top',
    },
    noteText: {
        fontSize: font11,
        fontFamily: FontRegular,
        color: colors.black50,
        textAlign: 'center',
    },
    actionBtn: {
        height: scaleSize(50),
        borderRadius: resAvarage(100),
        backgroundColor: colors.theme,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
        marginTop: scaleSize(4),
    },
    actionBtnText: {
        fontSize: font15,
        fontFamily: FontBold,
        color: colors.black,
    },
});
