import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular } from '../../../../../utils/fontFamily';
import { font12, font13, font22 } from '../../../../../utils/fontSizes';
import { resAvarage } from '../../../../../utils/responsive';
import { BatchMiniIcon, GraduationCapIcon, PhoneIcon } from './TuitionIcons';

interface StudentProfileCardProps {
    name?: string;
    classGrade?: string;
    sinceDate?: string;
    parentName?: string;
    batchName?: string;
    batchTiming?: string;
    batchDays?: string;
    phone?: string;
    subjects?: string[];
}

export default function StudentProfileCard({
    name = '',
    classGrade = '',
    sinceDate = '',
    parentName = '',
    batchName = '',
    batchTiming = '',
    batchDays = '',
    phone = '',
    subjects = [],
}: StudentProfileCardProps) {
    return (
        <View style={styles.card}>
            {/* Top row: Avatar + Name + Class */}
            <View style={styles.topRow}>
                <View style={styles.avatar}>
                    <GraduationCapIcon size={resAvarage(3.5)} color="#000000" />
                </View>
                <View style={styles.nameCol}>
                    <CustomText style={styles.nameText}>{name}</CustomText>
                    <CustomText style={styles.classSinceText}>
                        {`${classGrade} · since ${sinceDate}`}
                    </CustomText>
                </View>
            </View>

            {/* Parent Name */}
            <CustomText style={styles.infoText}>
                {`Parent: ${parentName}`}
            </CustomText>

            {/* Batch & Timing */}
            <View style={styles.iconInfoRow}>
                <BatchMiniIcon size={resAvarage(2.2)} color="rgba(255, 255, 255, 0.7)" />
                <CustomText style={styles.infoTextInline}>
                    {`${batchName} · ${batchTiming} · ${batchDays}`}
                </CustomText>
            </View>

            {/* Phone */}
            <View style={styles.iconInfoRow}>
                <PhoneIcon size={resAvarage(2.2)} color="rgba(255, 255, 255, 0.7)" />
                <CustomText style={styles.infoTextInline}>{phone}</CustomText>
            </View>

            {/* Subjects Tags */}
            <View style={styles.subjectsRow}>
                {subjects.map((subject, idx) => (
                    <View key={idx} style={styles.subjectPill}>
                        <CustomText style={styles.subjectText}>{subject}</CustomText>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#0F1012',
        borderRadius: resAvarage(5.5),
        paddingHorizontal: resAvarage(4.5),
        paddingTop: resAvarage(4),
        paddingBottom: resAvarage(4.5),
        marginTop: resAvarage(1.5),
        elevation: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(3),
    },
    avatar: {
        width: resAvarage(7.2),
        height: resAvarage(7.2),
        borderRadius: resAvarage(100),
        backgroundColor: colors.theme,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameCol: {
        flex: 1,
    },
    nameText: {
        fontFamily: FontBold,
        fontSize: font22,
        color: colors.white,
    },
    classSinceText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: resAvarage(0.4),
    },
    infoText: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: 'rgba(255, 255, 255, 0.75)',
        marginTop: resAvarage(2),
    },
    iconInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: resAvarage(1.5),
        marginTop: resAvarage(1.2),
    },
    infoTextInline: {
        fontFamily: FontRegular,
        fontSize: font13,
        color: 'rgba(255, 255, 255, 0.75)',
        flex: 1,
    },
    subjectsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: resAvarage(1.5),
        marginTop: resAvarage(2.5),
    },
    subjectPill: {
        backgroundColor: '#1C1D21',
        borderRadius: resAvarage(100),
        paddingHorizontal: resAvarage(3),
        paddingVertical: resAvarage(1),
    },
    subjectText: {
        fontFamily: FontMedium,
        fontSize: font12,
        color: colors.white,
    },
});
