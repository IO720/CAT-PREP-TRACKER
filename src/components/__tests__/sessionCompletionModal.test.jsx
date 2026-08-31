import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SessionCompletionModal, { parseTargetNumber } from '../SessionCompletionModal';

describe('SessionCompletionModal & Quota Verification', () => {
  it('correctly parses target numbers from strings', () => {
    expect(parseTargetNumber('Solve 18 Quant Questions', 18)).toBe(18);
    expect(parseTargetNumber('Solve 4 LRDI Sets', 4)).toBe(4);
    expect(parseTargetNumber('Solve 4 Reading Comprehensions', 4)).toBe(4);
    expect(parseTargetNumber('', 10)).toBe(10);
  });

  it('renders Quant session modal with daily and weekly quotas and under-quota alert', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const todayDay = {
      day: 'Monday',
      quantTarget: 'Solve 18 Quant Questions',
      quantCount: 0,
      quantCompleted: false
    };
    const activeWeekDays = [
      todayDay,
      { day: 'Tuesday', quantTarget: 'Solve 18 Quant Questions', quantCount: 0 },
      { day: 'Wednesday', quantTarget: 'Solve 18 Quant Questions', quantCount: 0 }
    ];

    render(
      <SessionCompletionModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        sessionData={{
          subject: 'Quant',
          durationMinutes: 1,
          startTimeStr: '09:30 PM',
          endTimeStr: '09:31 PM',
          initialNotes: 'Quick revision'
        }}
        todayDay={todayDay}
        activeWeekDays={activeWeekDays}
        activeWeekName="Week 3"
      />
    );

    // Header & badge
    expect(screen.getByText('Quant')).toBeDefined();
    expect(screen.getByText(/1m focus/i)).toBeDefined();

    // Daily & weekly quotas
    expect(screen.getByText(/Today's Quota:/i)).toBeDefined();
    expect(screen.getByText('0 / 18 Questions')).toBeDefined();
    expect(screen.getByText(/Week 3:/i)).toBeDefined();

    // Under quota banner since 0 questions entered
    expect(screen.getByText(/18 questions needed to reach daily quota/i)).toBeDefined();

    // Checkbox should default to unchecked because 0 < 18
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(false);

    // Submit form with 0 questions (e.g. concept study)
    const saveBtn = screen.getByText(/Save Session/i);
    fireEvent.click(saveBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      notes: 'Quick revision',
      questionsSolved: 0,
      markCompleted: false
    });
  });

  it('updates projected questions and marks complete when full daily quota is added', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const todayDay = {
      day: 'Monday',
      quantTarget: 'Solve 18 Quant Questions',
      quantCount: 0,
      quantCompleted: false
    };

    render(
      <SessionCompletionModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        sessionData={{
          subject: 'Quant',
          durationMinutes: 25,
          startTimeStr: '09:00 PM',
          endTimeStr: '09:25 PM',
          initialNotes: 'Geometry drill'
        }}
        todayDay={todayDay}
        activeWeekDays={[todayDay]}
        activeWeekName="Week 3"
      />
    );

    // Click quick chip "+18 (Quota)"
    const quotaChip = screen.getByText('+18 (Quota)');
    fireEvent.click(quotaChip);

    // Should now show Daily Quota Cleared
    expect(screen.getByText(/Daily Quota Cleared/i)).toBeDefined();

    // Checkbox should now be checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(true);

    // Submit
    const saveBtn = screen.getByText(/Save Session/i);
    fireEvent.click(saveBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      notes: 'Geometry drill',
      questionsSolved: 18,
      markCompleted: true
    });
  });

  it('supports LRDI sets quota verification (4 daily sets)', () => {
    const onConfirm = vi.fn();
    const todayDay = {
      day: 'Monday',
      lrdiTarget: 'Solve 4 LRDI Sets',
      lrdiCount: 1,
      lrdiCompleted: false
    };

    render(
      <SessionCompletionModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        sessionData={{
          subject: 'LRDI',
          durationMinutes: 45,
          startTimeStr: '10:00 AM',
          endTimeStr: '10:45 AM',
          initialNotes: ''
        }}
        todayDay={todayDay}
        activeWeekDays={[todayDay]}
        activeWeekName="Week 1"
      />
    );

    expect(screen.getByText('LRDI')).toBeDefined();
    expect(screen.getAllByText('1 / 4 Sets').length).toBeGreaterThan(0);
    // Initially today was 1/4, so under quota (3 sets needed)
    expect(screen.getByText(/3 sets needed to reach daily quota/i)).toBeDefined();

    // Quick chip +1
    const chipPlusOne = screen.getByText('+1');
    fireEvent.click(chipPlusOne);

    // 1 already + 1 new = 2/4, still 2 sets needed
    expect(screen.getByText(/2 sets needed to reach daily quota/i)).toBeDefined();

    const saveBtn = screen.getByText(/Save Session/i);
    fireEvent.click(saveBtn);

    expect(onConfirm).toHaveBeenCalledWith({
      notes: '',
      questionsSolved: 1,
      markCompleted: false
    });
  });
});
