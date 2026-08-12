import { describe, it, expect } from 'vitest';
import { 
  formatDateShort, 
  formatDateMonthDay, 
  getMondayOfWeek, 
  formatDateISO, 
  parseISODate, 
  getCalculatedDateForTrackerDay, 
  getTodayTrackerPosition,
  isToday
} from '../dateUtils';

describe('dateUtils - OS and Web Date Tracking Logic', () => {
  it('formats date strings correctly', () => {
    const testDate = new Date(2026, 7, 12); // Aug 12, 2026
    expect(formatDateShort(testDate)).toContain('Aug 12, 2026');
    expect(formatDateMonthDay(testDate)).toBe('Aug 12');
  });

  it('calculates Monday of week accurately', () => {
    const wednesday = new Date(2026, 7, 12); // Wednesday Aug 12, 2026
    const monday = getMondayOfWeek(wednesday);
    expect(monday.getDay()).toBe(1); // 1 = Monday
    expect(monday.getDate()).toBe(10); // Monday Aug 10, 2026
  });

  it('parses and formats ISO date strings', () => {
    const isoStr = '2026-08-10';
    const parsed = parseISODate(isoStr);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(10);
    expect(formatDateISO(parsed)).toBe('2026-08-10');
  });

  it('computes exact date for Month M, Week W, Day D in tracker', () => {
    const startDate = '2026-08-10'; // Week 1 Monday
    
    // Month 1 Week 1 Monday -> 2026-08-10
    const m1w1Mon = getCalculatedDateForTrackerDay('Month 1', 'Week 1', 'Monday', startDate);
    expect(formatDateISO(m1w1Mon)).toBe('2026-08-10');

    // Month 1 Week 1 Wednesday -> 2026-08-12
    const m1w1Wed = getCalculatedDateForTrackerDay('Month 1', 'Week 1', 'Wednesday', startDate);
    expect(formatDateISO(m1w1Wed)).toBe('2026-08-12');

    // Month 1 Week 2 Monday -> 2026-08-17
    const m1w2Mon = getCalculatedDateForTrackerDay('Month 1', 'Week 2', 'Monday', startDate);
    expect(formatDateISO(m1w2Mon)).toBe('2026-08-17');
  });

  it('detects today position in the 16-week study schedule', () => {
    const today = new Date();
    const mondayThisWeek = getMondayOfWeek(today);
    const startDate = formatDateISO(mondayThisWeek);

    const pos = getTodayTrackerPosition(startDate);
    expect(pos.activeMonth).toBe('Month 1');
    expect(pos.activeWeek).toBe('Week 1');
    expect(pos.todayDayName).toBe(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]);
  });

  it('correctly matches isToday for current date', () => {
    const today = new Date();
    const mondayThisWeek = getMondayOfWeek(today);
    const startDate = formatDateISO(mondayThisWeek);

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = weekdayNames[today.getDay()];

    const result = isToday('Month 1', 'Week 1', todayName, startDate);
    expect(result).toBe(true);
  });
});
