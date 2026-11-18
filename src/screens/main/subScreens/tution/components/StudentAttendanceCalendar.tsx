import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import CustomText from '../../../../../ui/components/CustomText';
import { colors } from '../../../../../utils/colors';
import { FontBold, FontMedium, FontRegular, FontSemiBold } from '../../../../../utils/fontFamily';
import { font10, font12, font13, font14, font16 } from '../../../../../utils/fontSizes';
import { resAvarage, resWidth } from '../../../../../utils/responsive';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './TuitionIcons';

export type DayStatus =
  | 'present'
  | 'absent'
  | 'holiday'
  | 'paid'
  | 'upcoming'
  | 'today'
  | 'neutral'
  | 'future';

export interface SelectedDateObject {
  date: string;
  day: number;
  dayName: string;
  dayOfWeek: number;
  status: DayStatus;
}

interface StudentAttendanceCalendarProps {
  onDateSelect?: (dateObject: SelectedDateObject) => void;
  onMonthChange?: (year: number, month: number) => void;
  initialMonth?: number; // 0-indexed (9 for October)
  initialYear?: number; // e.g. 2026
  paidDates?: string[]; // Array of 'YYYY-MM-DD'
  upcomingDueDates?: string[]; // Array of 'YYYY-MM-DD'
  attendanceData?: Record<string, 'present' | 'absent' | 'holiday'>;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const StudentAttendanceCalendar: React.FC<StudentAttendanceCalendarProps> = ({
  onDateSelect,
  onMonthChange,
  initialMonth = new Date().getMonth(),
  initialYear = new Date().getFullYear(),
  paidDates = [],
  upcomingDueDates = [],
  attendanceData = {},
}) => {
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [currentYear, setCurrentYear] = useState<number>(initialYear);

  // Year Selection Modal state
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [yearPageStart, setYearPageStart] = useState<number>(() => Math.floor(initialYear / 12) * 12);

  // Today reference
  const todayString = new Date().toISOString().split('T')[0];

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      } else {
        newMonth = currentMonth - 1;
      }
    } else {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      } else {
        newMonth = currentMonth + 1;
      }
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    // Send to parent: (year, 1-indexed month)
    onMonthChange?.(newYear, newMonth + 1);
  };

  const handleSelectYear = (selectedYear: number) => {
    setCurrentYear(selectedYear);
    setIsYearModalVisible(false);
    onMonthChange?.(selectedYear, currentMonth + 1);
  };

  const getDayStatus = (dateString: string, isPast: boolean): DayStatus => {
    if (paidDates.includes(dateString)) {
      return 'paid'; // Blue for Fee Paid
    }
    if (upcomingDueDates.includes(dateString)) {
      return 'upcoming'; // Purple for Upcoming Fee
    }
    if (attendanceData[dateString] === 'holiday') {
      return 'holiday'; // Orange for Teacher Absent / Holiday
    }
    if (attendanceData[dateString] === 'present') {
      return 'present'; // Green
    }
    if (attendanceData[dateString] === 'absent') {
      return 'absent'; // Red
    }
    if (dateString === todayString) {
      return 'today';
    }
    if (isPast) {
      return 'neutral';
    }
    return 'future';
  };

  const handleDayPress = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateString = `${currentYear}-${monthStr}-${dayStr}`;

    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const isPast = dateString < todayString;
    const status = getDayStatus(dateString, isPast);

    onDateSelect?.({
      date: dateString,
      day,
      dayName: DAY_NAMES[dayOfWeek],
      dayOfWeek,
      status,
    });
  };

  // Compute attendance stats for current month
  const { presentCount, totalMarked } = (() => {
    let presents = 0;
    let total = 0;
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${currentYear}-${monthStr}-${dayStr}`;

      if (attendanceData[dateString] === 'present') {
        presents++;
        total++;
      } else if (attendanceData[dateString] === 'absent') {
        total++;
      }
    }

    return {
      presentCount: presents || 8,
      totalMarked: total || 9,
    };
  })();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: React.ReactNode[] = [];

    // Empty cells for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCellWrapper}>
          <View style={styles.dayCellEmpty} />
        </View>
      );
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${currentYear}-${monthStr}-${dayStr}`;

      const isToday = dateString === todayString;
      const isPast = dateString < todayString;
      const status = getDayStatus(dateString, isPast);

      const isPresent = status === 'present';
      const isAbsent = status === 'absent';
      const isHoliday = status === 'holiday';
      const isPaid = status === 'paid';
      const isUpcoming = status === 'upcoming';
      const isNeutral = status === 'neutral' && !isToday;
      const isFuture = status === 'future' && !isToday;

      days.push(
        <TouchableOpacity
          key={`day-${day}`}
          activeOpacity={0.7}
          onPress={() => handleDayPress(day)}
          style={styles.dayCellWrapper}
        >
          <View
            style={[
              styles.dayCell,
              isPresent && styles.dayCellPresent,
              isAbsent && styles.dayCellAbsent,
              isHoliday && styles.dayCellHoliday,
              isPaid && styles.dayCellPaid,
              isUpcoming && styles.dayCellUpcoming,
              isNeutral && styles.dayCellNeutral,
              isToday && styles.dayCellToday,
            ]}
          >
            <CustomText
              style={[
                styles.dayNumberText,
                isPresent && styles.dayTextPresent,
                isAbsent && styles.dayTextAbsent,
                isHoliday && styles.dayTextHoliday,
                isPaid && styles.dayTextPaid,
                isUpcoming && styles.dayTextUpcoming,
                isToday && styles.dayTextToday,
                isFuture && styles.dayTextFuture,
              ]}
            >
              {day}
            </CustomText>
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  // Generate 12 years for the year picker modal
  const yearsList = Array.from({ length: 12 }, (_, i) => yearPageStart + i);

  return (
    <View style={styles.wrapper}>
      {/* Header: Title on Left, Month Navigation on Right */}
      <View style={styles.headerRow}>
        <CustomText style={styles.sectionHeader}>
          {`ATTENDANCE · ${presentCount}/${totalMarked} PRESENT`}
        </CustomText>

        <View style={styles.monthPickerRow}>
          <TouchableOpacity
            activeOpacity={0.65}
            onPress={() => changeMonth('prev')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.navArrowBtn}
          >
            <ChevronLeftIcon size={resAvarage(2.2)} color="#1E293B" />
          </TouchableOpacity>

          {/* Month & Year Text Button (Opens Year Picker Modal) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setYearPageStart(Math.floor(currentYear / 12) * 12);
              setIsYearModalVisible(true);
            }}
            style={styles.monthYearBtn}
          >
            <CustomText style={styles.monthText}>
              {`${MONTH_NAMES[currentMonth]} ${currentYear}`}
            </CustomText>
            <ChevronDownIcon size={resAvarage(1.5)} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.65}
            onPress={() => changeMonth('next')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.navArrowBtn}
          >
            <ChevronRightIcon size={resAvarage(2.2)} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Card */}
      <View style={styles.calendarCard}>
        {/* Weekday headers: S M T W T F S */}
        <View style={styles.weekdaysRow}>
          {DAY_NAMES.map((day, idx) => (
            <View key={idx} style={styles.dayCellWrapper}>
              <CustomText style={styles.weekdayText}>{day}</CustomText>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.gridContainer}>{renderCalendar()}</View>

        {/* Calendar Legend: Present, Absent, Holiday, Fee Paid, Upcoming Due */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotPresent]} />
            <CustomText style={styles.legendText}>Present</CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotAbsent]} />
            <CustomText style={styles.legendText}>Absent</CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotHoliday]} />
            <CustomText style={styles.legendText}>Holiday</CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotPaid]} />
            <CustomText style={styles.legendText}>Fee Paid</CustomText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.dotUpcoming]} />
            <CustomText style={styles.legendText}>Upcoming Due</CustomText>
          </View>
        </View>
      </View>

      {/* Year Selection Modal */}
      <Modal
        visible={isYearModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsYearModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsYearModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalCard}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setYearPageStart((prev) => prev - 12)}
                    style={styles.modalNavBtn}
                    activeOpacity={0.7}
                  >
                    <ChevronLeftIcon size={resAvarage(2)} color="#1E293B" />
                  </TouchableOpacity>

                  <View style={styles.modalTitleContainer}>
                    <CustomText style={styles.modalTitle}>Select Year</CustomText>
                    <CustomText style={styles.modalSubtitle}>
                      {`${yearPageStart} - ${yearPageStart + 11}`}
                    </CustomText>
                  </View>

                  <TouchableOpacity
                    onPress={() => setYearPageStart((prev) => prev + 12)}
                    style={styles.modalNavBtn}
                    activeOpacity={0.7}
                  >
                    <ChevronRightIcon size={resAvarage(2)} color="#1E293B" />
                  </TouchableOpacity>
                </View>

                {/* Years Grid (3 columns x 4 rows) */}
                <View style={styles.yearsGrid}>
                  {yearsList.map((year) => {
                    const isSelected = year === currentYear;
                    return (
                      <TouchableOpacity
                        key={year}
                        activeOpacity={0.75}
                        onPress={() => handleSelectYear(year)}
                        style={[
                          styles.yearButton,
                          isSelected && styles.yearButtonSelected,
                        ]}
                      >
                        <CustomText
                          style={[
                            styles.yearButtonText,
                            isSelected && styles.yearButtonTextSelected,
                          ]}
                        >
                          {year}
                        </CustomText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsYearModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <CustomText style={styles.modalCloseBtnText}>Close</CustomText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: resAvarage(2.5),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: resAvarage(1.2),
    paddingHorizontal: resAvarage(0.5),
  },
  sectionHeader: {
    fontFamily: FontMedium,
    fontSize: font12,
    color: '#64748B',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  monthPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: resAvarage(0.8),
  },
  navArrowBtn: {
    padding: resAvarage(0.5),
  },
  monthYearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: resAvarage(0.4),
    paddingHorizontal: resAvarage(1),
    backgroundColor: '#F8FAFC',
    borderRadius: resAvarage(2),
    gap: resAvarage(0.5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthText: {
    fontFamily: FontBold,
    fontSize: font13,
    color: colors.black,
    textAlign: 'center',
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: resAvarage(5),
    paddingHorizontal: resAvarage(3),
    paddingVertical: resAvarage(3.5),
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: resAvarage(1.5),
  },
  weekdayText: {
    fontFamily: FontMedium,
    fontSize: font12,
    color: '#64748B',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCellWrapper: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: resAvarage(0.4),
  },
  dayCellEmpty: {
    width: resAvarage(5.2),
    height: resAvarage(5.2),
  },
  dayCell: {
    width: resAvarage(5.2),
    height: resAvarage(5.2),
    borderRadius: resAvarage(100), // 100% round for normal dates
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellPresent: {
    backgroundColor: '#DCFCE7', // Soft Green for Present
    borderRadius: resAvarage(100), // 100% round circle
  },
  dayCellAbsent: {
    backgroundColor: '#FEE2E2', // Soft Red for Absent
    borderRadius: resAvarage(0.7), // 10% round (square shape)
  },
  dayCellHoliday: {
    backgroundColor: '#FFEDD5', // Soft Orange for Teacher Absent / Holiday
    borderRadius: resAvarage(0.7), // 10% round (square shape)
  },
  dayCellPaid: {
    backgroundColor: '#DBEAFE', // Soft Blue for Fee Paid Date
    borderRadius: resAvarage(100), // 100% round circle
  },
  dayCellUpcoming: {
    backgroundColor: '#EDE9FE', // Soft Purple for Upcoming Fee Due
    borderRadius: resAvarage(100), // 100% round circle
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.black,
  },
  dayCellNeutral: {
    backgroundColor: '#F1F5F9',
    borderRadius: resAvarage(100),
  },
  dayNumberText: {
    fontFamily: FontMedium,
    fontSize: font13,
    color: colors.black,
  },
  dayTextPresent: {
    color: '#16A34A',
    fontFamily: FontSemiBold,
  },
  dayTextAbsent: {
    color: '#DC2626',
    fontFamily: FontSemiBold,
  },
  dayTextHoliday: {
    color: '#EA580C', // Vibrant Orange for Holiday / Teacher Absent
    fontFamily: FontBold,
  },
  dayTextPaid: {
    color: '#2563EB', // Blue text
    fontFamily: FontBold,
  },
  dayTextUpcoming: {
    color: '#7C3AED', // Purple text
    fontFamily: FontBold,
  },
  dayTextToday: {
    color: colors.black,
    fontFamily: FontBold,
  },
  dayTextFuture: {
    color: '#94A3B8',
    fontFamily: FontRegular,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: resAvarage(2.2),
    rowGap: resAvarage(1),
    marginTop: resAvarage(2.5),
    paddingTop: resAvarage(1.8),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: resAvarage(0.7),
  },
  legendDot: {
    width: resAvarage(1.4),
    height: resAvarage(1.4),
  },
  dotPresent: {
    backgroundColor: '#16A34A',
    borderRadius: resAvarage(100), // 100% round
  },
  dotAbsent: {
    backgroundColor: '#DC2626',
    borderRadius: resAvarage(0.25), // 10% round (square shape)
  },
  dotHoliday: {
    backgroundColor: '#EA580C', // Orange
    borderRadius: resAvarage(0.25), // 10% round (square shape)
  },
  dotPaid: {
    backgroundColor: '#2563EB', // Blue
    borderRadius: resAvarage(100), // 100% round
  },
  dotUpcoming: {
    backgroundColor: '#7C3AED', // Purple
    borderRadius: resAvarage(100), // 100% round
  },
  legendText: {
    fontFamily: FontRegular,
    fontSize: font10,
    color: '#64748B',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: resAvarage(4),
  },
  modalCard: {
    width: '100%',
    maxWidth: resWidth(88),
    backgroundColor: colors.white,
    borderRadius: resAvarage(5),
    padding: resAvarage(4),
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: resAvarage(3),
  },
  modalNavBtn: {
    width: resAvarage(5),
    height: resAvarage(5),
    borderRadius: resAvarage(2.5),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: FontBold,
    fontSize: font16,
    color: colors.black,
  },
  modalSubtitle: {
    fontFamily: FontRegular,
    fontSize: font12,
    color: '#64748B',
    marginTop: resAvarage(0.2),
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: resAvarage(1.5),
    marginBottom: resAvarage(3),
  },
  yearButton: {
    width: '30%',
    paddingVertical: resAvarage(1.8),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: resAvarage(3),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  yearButtonSelected: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  yearButtonText: {
    fontFamily: FontMedium,
    fontSize: font14,
    color: colors.black,
  },
  yearButtonTextSelected: {
    color: colors.white,
    fontFamily: FontBold,
  },
  modalCloseBtn: {
    paddingVertical: resAvarage(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: resAvarage(3),
  },
  modalCloseBtnText: {
    fontFamily: FontSemiBold,
    fontSize: font13,
    color: '#475569',
  },
});

export default StudentAttendanceCalendar;
