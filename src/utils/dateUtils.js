// Utility for tracking OS and Web real dates and mapping to study tracker days

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_NAMES_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Returns current OS Date & Time object
 */
export const getOsTime = () => {
  return new Date();
};

/**
 * Sync network web time asynchronously with OS fallback
 */
export const fetchWebOrOsDate = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://worldtimeapi.org/api/ip', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.datetime) {
        return new Date(data.datetime);
      }
    }
  } catch {
    // Silent fallback to local OS date
  }
  return new Date();
};

/**
 * Format a Date object into a readable date string
 * Example: "Wed, Aug 12, 2026"
 */
export const formatDateShort = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format a Date object into month day format
 * Example: "Aug 12"
 */
export const formatDateMonthDay = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return "";
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get Monday of the week for any date
 */
export const getMondayOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  // day 0 is Sunday. If 0, diff is -6. Otherwise diff is 1 - day.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * Format date to YYYY-MM-DD for input[type="date"]
 */
export const formatDateISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD to Date object at local midnight
 */
export const parseISODate = (str) => {
  if (!str) return new Date();
  const [y, m, d] = str.split('-').map(Number);
  if (y && m && d) {
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  return new Date(str);
};

/**
 * Calculate actual Date object for Month M, Week W, Day D given a Start Date.
 * If no startDate is provided, defaults to current week's Monday as Week 1 Monday.
 * @param {string} monthName - "Month 1", "Month 2", etc.
 * @param {string} weekName - "Week 1", "Week 2", etc.
 * @param {string} dayName - "Monday", "Tuesday", etc.
 * @param {string|Date} startDateStr - YYYY-MM-DD or Date object
 */
export const getCalculatedDateForTrackerDay = (monthName, weekName, dayName, startDateStr) => {
  let baseStartDate;
  if (startDateStr) {
    baseStartDate = getMondayOfWeek(parseISODate(startDateStr));
  } else {
    // Default to current week Monday
    baseStartDate = getMondayOfWeek(new Date());
  }

  // Parse Month number (1 to 4)
  const monthMatch = monthName ? monthName.match(/Month (\d+)/i) : null;
  const monthNum = monthMatch ? parseInt(monthMatch[1], 10) : 1;

  // Parse Week number (1 to 4 relative to month)
  const weekMatch = weekName ? weekName.match(/Week (\d+)/i) : null;
  const weekNum = weekMatch ? parseInt(weekMatch[1], 10) : 1;

  // Total weeks from start: (monthNum - 1) * 4 + (weekNum - 1)
  const totalWeeksOffset = (monthNum - 1) * 4 + (weekNum - 1);

  // Day of week index (0 for Monday, 6 for Sunday)
  const dayIndex = WEEKDAY_NAMES_ORDER.indexOf(dayName);
  const validDayIndex = dayIndex >= 0 ? dayIndex : 0;

  const totalDaysOffset = totalWeeksOffset * 7 + validDayIndex;

  const resultDate = new Date(baseStartDate);
  resultDate.setDate(resultDate.getDate() + totalDaysOffset);
  return resultDate;
};

/**
 * Determine which Month, Week, Day, and Date today falls into.
 * Returns { todayDayName, todayDateStr, activeMonth, activeWeek, isExactMatch, calculatedDate }
 */
export const getTodayTrackerPosition = (startDateStr) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const todayDayName = DAY_NAMES[now.getDay()];

  let baseStartDate;
  if (startDateStr) {
    baseStartDate = getMondayOfWeek(parseISODate(startDateStr));
  } else {
    baseStartDate = getMondayOfWeek(now);
  }
  baseStartDate.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - baseStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let monthNum = 1;
  let weekNum = 1;
  let dayIndex = 0;

  if (diffDays >= 0) {
    const totalWeeks = Math.floor(diffDays / 7);
    dayIndex = diffDays % 7;
    
    // Clamp to 16 weeks max (Month 4 Week 4)
    const clampedWeeks = Math.min(15, totalWeeks);
    monthNum = Math.floor(clampedWeeks / 4) + 1;
    weekNum = (clampedWeeks % 4) + 1;
  } else {
    // If start date is in future, default to Month 1 Week 1
    monthNum = 1;
    weekNum = 1;
    dayIndex = 0;
  }

  const activeMonth = `Month ${monthNum}`;
  const activeWeek = `Week ${weekNum}`;

  return {
    todayDayName,
    todayDateStr: formatDateShort(now),
    todayMonthDayStr: formatDateMonthDay(now),
    activeMonth,
    activeWeek,
    dayName: WEEKDAY_NAMES_ORDER[dayIndex] || todayDayName,
    diffDays
  };
};

/**
 * Checks if a day panel matches TODAY's actual calendar date or weekday
 */
export const isToday = (monthName, weekName, dayName, startDateStr) => {
  const now = new Date();
  const dayCalculated = getCalculatedDateForTrackerDay(monthName, weekName, dayName, startDateStr);
  return (
    now.getFullYear() === dayCalculated.getFullYear() &&
    now.getMonth() === dayCalculated.getMonth() &&
    now.getDate() === dayCalculated.getDate()
  );
};
