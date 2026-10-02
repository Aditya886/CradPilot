
export function getUTCDateString(dateStr: any, timeStr: any) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);

  let hour = parseInt(timeParts[1], 10);
  const minute = parseInt(timeParts[2], 10);
  const ampm = timeParts[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  // Use Date.UTC to create a UTC-based date
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  return utcDate.toISOString();
}

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};



// export const convertToUTC = (dateStr:any) => {
//   const [day, month, year] = dateStr.split("/").map(Number);
//   const utcDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
//   return utcDate.toISOString(); // Returns in UTC format
// };

export function convertDateTimeToUTC(dateStr: string, timeStr: string) {
  // Example input: dateStr = "2025-07-17", timeStr = "10:00 AM"

  const [year, month, day] = dateStr.split("-").map(Number);

  // Parse time and convert to 24-hour format
  const timeParts = timeStr.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!timeParts) throw new Error("Invalid time format");

  let hour = parseInt(timeParts[1], 10);
  const minute = parseInt(timeParts[2], 10);
  const ampm = timeParts[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  // month is 0-indexed in JavaScript Date
  const localDate = new Date(year, month - 1, day, hour, minute);

  return localDate.toISOString(); // UTC format
}

export const convertToUTC = (dateStr: any) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("/");

  if (parts.length !== 3) return null;

  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  // Validate date values
  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1000
  ) {
    console.warn("Invalid date string:", dateStr);
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day)); // Month is 0-indexed
  return utcDate.toISOString(); // Format: 2025-04-26T00:00:00.000Z
};

export const FirstCapital = (text: any) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};



export const parseCustomDate = (dateString: string): Date | null => {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(part => parseInt(part, 10));
  if (!day || !month || !year) return null;

  return new Date(year, month - 1, day); // month is 0-indexed
};

export function getScheduleForDate(dateString: any, scheduleArray: any) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  const dayName = days[date.getDay()];

  return scheduleArray.find((item: any) => item.day === dayName);
}

export function generateTimeSlotsFromSchedule(dateInput: any, scheduleArray: any) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(typeof dateInput === 'number' ? dateInput : new Date(dateInput));
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const dayName = days[date.getDay()];

  const matchedDay = scheduleArray.find((item: any) => item.day === dayName);
  if (!matchedDay || matchedDay.open === 'closed' || matchedDay.close === 'closed') return [];

  const to24HourDate = (timeStr: any) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const openTime = to24HourDate(matchedDay.open);
  const closeTime = to24HourDate(matchedDay.close);

  if (closeTime <= openTime) {
    // Invalid range
    return [];
  }

  const timeSlots = [];
  let currentTime = new Date(openTime);

  while (currentTime <= closeTime) {
    if (!isToday || currentTime > today) {
      const formatted = currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      timeSlots.push(formatted);
    }
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return timeSlots;
}





const parseDate = (dateString: string): Date | null => {
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
};

const normalizeToDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const parsedDate = new Date(value);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  if (typeof value !== "string") return null;

  if (value.includes('/')) {
    const parsedDate = parseDate(value);
    return parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;
  }

  if (value.includes('-')) {
    const parts = value.split('-');
    if (parts.length === 3 && !value.includes('T') && !value.includes('Z')) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const parsedDate = new Date(Date.UTC(year, month, day));
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
  }

  const parsedDate = new Date(value);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

// Format date using UTC values (prevents timezone conversion issues)
export const formatDat = (value: any): string => {
  const date = normalizeToDate(value);
  if (!date) return 'NA';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
};

// Main format date function
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'NA';

  let date: Date;

  if (dateString.includes('/')) {
    // Parse custom DD/MM/YYYY format
    const parsed = parseDate(dateString);
    if (!parsed || isNaN(parsed.getTime())) return 'NA';
    date = parsed;

    // For custom format, use local date formatting
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } else if (dateString.includes('T') || dateString.includes('Z')) {
    // ISO string format (e.g., "2025-10-03T18:50:00.000Z")
    // Use UTC date to prevent timezone conversion
    date = new Date(dateString);
    if (isNaN(date.getTime())) return 'NA';

    // Format using UTC values to show the correct date
    return formatDat(dateString);
  } else {
    // Regular date string (e.g., "2025-10-03")
    // Treat as local date
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return 'NA';

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
};

export function formatUTCToReadableDate(utcString: any) {
  const date = new Date(utcString);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayName = days[date.getUTCDay()];
  const day = date.getUTCDate();
  const monthName = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  // Add ordinal suffix (st, nd, rd, th)
  const getOrdinal = (n: any) => {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${dayName}, ${day}${getOrdinal(day)} ${monthName} ${year}`;
}

export function addTime(startTime: any, addingTime: any) {
  if (typeof startTime !== "string") {
    throw new Error("startTime  must be strings");
  }
  if (typeof addingTime !== "string") {
    console.log(typeof addingTime, addingTime)
    throw new Error("addingTime must be strings");
  }

  // Parse startTime like "7:40 AM"
  const [timePart, period] = startTime.trim().split(" ");
  let [startHour, startMinute] = timePart.split(":").map(Number);

  if (period?.toUpperCase() === "PM" && startHour !== 12) {
    startHour += 12;
  }
  if (period?.toUpperCase() === "AM" && startHour === 12) {
    startHour = 0;
  }

  // Parse addingTime like "7h 30m"
  const hourMatch = addingTime.match(/(\d+)\s*h/i);
  const minuteMatch = addingTime.match(/(\d+)\s*m/i);

  const addHours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const addMinutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  let totalMinutes = startHour * 60 + startMinute + addHours * 60 + addMinutes;
  totalMinutes %= (24 * 60); // wrap around 24h clock

  let newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;

  const isPM = newHour >= 12;
  const suffix = isPM ? "PM" : "AM";

  newHour = newHour % 12 || 12; // 0 becomes 12
  const paddedMinutes = newMinute.toString().padStart(2, "0");

  return `${newHour}:${paddedMinutes} ${suffix}`;
}





export const convertToAMPM = (isoTime: string) => {
  const date = new Date(isoTime);
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

export function formatUTCDate(utcDateString: string): string {
  const dateObj = new Date(utcDateString);

  if (isNaN(dateObj.getTime())) return ""; // invalid date handling

  const day = dateObj.getUTCDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[dateObj.getUTCMonth()];
  const year = dateObj.getUTCFullYear();

  const currentYear = new Date().getUTCFullYear();

  // ✅ If same year, do not show year
  if (year === currentYear) {
    return `${day} ${month}`;
  } else {
    return `${day} ${month} ${year}`;
  }
}
