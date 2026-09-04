import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyTrackerView from '../DailyTrackerView';
import { getInitialState } from '../../utils/storage';

describe('Weekly Rollover, Data Isolation & Reset Functionality', () => {
  let mockState;

  beforeEach(() => {
    mockState = getInitialState();
  });

  it('keeps Week 1 and Week 2 drill progress completely isolated', () => {
    // Populate Week 1 Monday with completed drills
    mockState.tracker['Month 1'][0].days[0].quantCompleted = true;
    mockState.tracker['Month 1'][0].days[0].quantCount = 18;
    mockState.tracker['Month 1'][0].days[0].lrdiCompleted = true;
    mockState.tracker['Month 1'][0].days[0].lrdiCount = 4;

    // Ensure Week 2 Monday is initially uncompleted and 0
    expect(mockState.tracker['Month 1'][1].days[0].quantCompleted).toBe(false);
    expect(mockState.tracker['Month 1'][1].days[0].quantCount).toBe(0);

    // Render Week 2 in DailyTrackerView
    let activeWeek = 'Week 2';
    const setActiveWeek = vi.fn();
    const setActiveMonth = vi.fn();

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={setActiveMonth}
        activeWeek={activeWeek}
        setActiveWeek={setActiveWeek}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
      />
    );

    // In Week 2, syllabus header should indicate Week 2
    expect(screen.getByText(/Month 1 • Week 2/i)).toBeDefined();

    // In Week 2 Monday, 0/3 quotas cleared should be displayed by default (QA, DILR, VARC)
    expect(screen.getByText('0 / 3')).toBeDefined();
    expect(screen.getByText('Quotas Cleared')).toBeDefined();
  });

  it('displays active week syllabus focus curriculum from studyPlan', () => {
    // Week 1 focus: Percentages, Profit & Loss
    const { rerender } = render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
      />
    );

    expect(screen.getByText(/Percentages, Profit & Loss/i)).toBeDefined();
    expect(screen.getByText(/Linear & Circular Arrangements/i)).toBeDefined();

    // Rerender for Week 2
    rerender(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 2"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
      />
    );

    // Week 2 focus: Ratios, Averages or Matrix Grids
    expect(screen.getByText(/Ratios, Averages, Mixtures/i)).toBeDefined();
    expect(screen.getByText(/Matrix Grids & Complex Puzzles/i)).toBeDefined();
  });

  it('allows resetting completed drills for a week via Reset Week modal', () => {
    const resetWeekMetrics = vi.fn();

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 2"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
        resetWeekMetrics={resetWeekMetrics}
      />
    );

    const resetBtn = screen.getByTitle(/Reset completed drills for Week 2/i);
    expect(resetBtn).toBeDefined();

    // Open Reset confirmation modal
    fireEvent.click(resetBtn);
    expect(screen.getByText(/Reset Week 2 Drills\?/i)).toBeDefined();

    // Confirm reset
    const confirmBtn = screen.getByText('Confirm Reset');
    fireEvent.click(confirmBtn);

    expect(resetWeekMetrics).toHaveBeenCalledWith('Month 1', 'Week 2');
  });

  it('allows resetting a single day drills via Reset Day button', () => {
    // Set some progress on Monday
    mockState.tracker['Month 1'][1].days[0].quantCompleted = true;
    mockState.tracker['Month 1'][1].days[0].quantCount = 18;

    const resetDayMetrics = vi.fn();

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 2"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
        resetDayMetrics={resetDayMetrics}
      />
    );

    const resetDayBtn = screen.getByTitle(/Reset Monday drills to 0/i);
    expect(resetDayBtn).toBeDefined();

    fireEvent.click(resetDayBtn);
    expect(screen.getByText(/Reset Monday Drills\?/i)).toBeDefined();

    const confirmBtn = screen.getByText('Confirm Reset');
    fireEvent.click(confirmBtn);

    expect(resetDayMetrics).toHaveBeenCalledWith('Month 1', 'Week 2', 'Monday');
  });

  it('highlights the selected weekday in the 7-day mini track and switches days cleanly', () => {
    let currentDay = 'Monday';
    const setActiveDayName = (day) => { currentDay = day; };

    const { rerender } = render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 2"
        setActiveWeek={() => {}}
        activeDayName={currentDay}
        setActiveDayName={setActiveDayName}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
      />
    );

    // Mon pill should be selected
    const monPills = screen.getAllByRole('button').filter(b => b.textContent?.startsWith('Mon'));
    expect(monPills.some(p => p.className.includes('selected'))).toBe(true);

    // Click Tue pill
    const tuePills = screen.getAllByRole('button').filter(b => b.textContent?.startsWith('Tue'));
    expect(tuePills.length).toBeGreaterThan(0);
    fireEvent.click(tuePills[0]);
    expect(currentDay).toBe('Tuesday');

    rerender(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 2"
        setActiveWeek={() => {}}
        activeDayName={currentDay}
        setActiveDayName={setActiveDayName}
        updateDayMetric={() => {}}
        updateDayNotes={() => {}}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Tuesday' })).toBeDefined();
  });

  it('renders Custom Objective drill alongside QA, DILR, and VARC and allows toggling', () => {
    let toggledSubject = null;
    let toggledVal = null;
    const updateDayMetric = vi.fn((m, w, d, subject, completed, qty) => {
      toggledSubject = subject;
      toggledVal = completed;
    });

    // 1. Initially without custom objective, shows "+ Add Custom Objective" button
    const { unmount } = render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={updateDayMetric}
        updateDayNotes={() => {}}
      />
    );

    expect(screen.getByText('Add Custom Objective')).toBeDefined();
    unmount();

    // 2. When hasCustomObjective is true, renders custom card with Edit button and allows toggling
    mockState.tracker['Month 1'][0].days[0].hasCustomObjective = true;

    render(
      <DailyTrackerView
        state={mockState}
        activeMonth="Month 1"
        setActiveMonth={() => {}}
        activeWeek="Week 1"
        setActiveWeek={() => {}}
        activeDayName="Monday"
        setActiveDayName={() => {}}
        updateDayMetric={updateDayMetric}
        updateDayNotes={() => {}}
      />
    );

    // Verify all drill badges and Edit button are rendered
    expect(screen.getByText('CUSTOM')).toBeDefined();
    expect(screen.getByText('Custom Objective')).toBeDefined();
    expect(screen.getByText('Personal Focus')).toBeDefined();
    expect(screen.getByText(/Solve 1 Sectional \/ Revision Drill/i)).toBeDefined();
    expect(screen.getByText('Edit')).toBeDefined();

    // Toggle custom objective
    const customCheck = screen.getByRole('checkbox', { name: /Custom Objective completed/i });
    expect(customCheck).toBeDefined();
    fireEvent.click(customCheck);

    expect(updateDayMetric).toHaveBeenCalled();
    expect(toggledSubject).toBe('custom');
    expect(toggledVal).toBe(true);
  });
});
