import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
}

export const AddUserIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle
            cx="9"
            cy="7"
            r="4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M19 8v6M22 11h-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const StudentsIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle
            cx="9"
            cy="7"
            r="4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const PendingIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
            x="3"
            y="5"
            width="18"
            height="15"
            rx="3"
            stroke={color}
            strokeWidth={strokeWidth}
        />
        <Path
            d="M7 5V3.5A1.5 1.5 0 0 1 8.5 2h7A1.5 1.5 0 0 1 17 3.5V5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
        />
        <Path
            d="M16 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
            fill={color}
        />
        <Path
            d="M3 10h18"
            stroke={color}
            strokeWidth={strokeWidth}
        />
    </Svg>
);

export const AttendanceIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="3"
            stroke={color}
            strokeWidth={strokeWidth}
        />
        <Path
            d="M16 2v4M8 2v4M3 10h18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="m9 16 2 2 4-4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const BatchesIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m12 2 9 4.9-9 4.9-9-4.9L12 2Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="m3 11.5 9 4.9 9-4.9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="m3 16.5 9 4.9 9-4.9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 20, color = '#F59E0B', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
            cx="12"
            cy="12"
            r="9"
            stroke={color}
            strokeWidth={strokeWidth}
        />
        <Path
            d="M12 7v5l3 2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const WhitePlusIcon: React.FC<IconProps> = ({ size = 18, color = '#FFFFFF', strokeWidth = 2.2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 5v14M5 12h14"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
        <Path d="m21 21-4.35-4.35" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 14, color = '#64748B', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="m6 9 6 6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

export const BatchMiniIcon: React.FC<IconProps> = ({ size = 14, color = '#64748B', strokeWidth = 1.6 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m12 2 9 4.9-9 4.9-9-4.9L12 2Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="m3 11.5 9 4.9 9-4.9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="m3 16.5 9 4.9 9-4.9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const GraduationCapIcon: React.FC<IconProps> = ({ size = 24, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22 10v6M2 10l10-5 10 5-10 5z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 12v5c3 3 9 3 12 0v-5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 16, color = '#64748B', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 16, color = '#DC2626', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 9v4M12 17h.01"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 16, color = '#1E293B', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m15 18-6-6 6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, color = '#1E293B', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m9 18 6-6-6-6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 16, color = '#000000', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="3"
            stroke={color}
            strokeWidth={strokeWidth}
        />
        <Path
            d="M16 2v4M8 2v4M3 10h18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = 14, color = '#64748B', strokeWidth = 1.8 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M6 6h10M6 10h10"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
        />
    </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 14, color = '#FFFFFF', strokeWidth = 2.5 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="m20 6-11 11-5-5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const RescheduleIcon: React.FC<IconProps> = ({ size = 16, color = '#2563EB', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M3 3v5h5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 16h5v5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const TeacherLeaveIcon: React.FC<IconProps> = ({ size = 16, color = '#EA580C', strokeWidth = 2 }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M8 2v4M16 2v4M3 10h18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="3"
            stroke={color}
            strokeWidth={strokeWidth}
        />
        <Path
            d="m9 16 6-6M9 10l6 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);



