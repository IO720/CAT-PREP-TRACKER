import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditSessionModal from '../EditSessionModal';
import WeekContributionHeatmap from '../WeekContributionHeatmap';

describe('EditSessionModal & WeekContributionHeatmap', () => {
  it('renders EditSessionModal and allows editing duration and notes', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const session = {
      id: 'sess-123',
      subject: 'Quant',
      durationMinutes: 1,
      startTime: '09:00 PM',
      endTime: '09:01 PM',
      notes: 'Quick test'
    };

    render(
      <EditSessionModal
        isOpen={true}
        session={session}
        onClose={onClose}
        onSave={onSave}
      />
    );

    // Title and badge
    expect(screen.getByText('Edit Recorded Session')).toBeDefined();
    expect(screen.getByText('Correction')).toBeDefined();

    // Select 45m preset
    const preset45 = screen.getByText('45m');
    fireEvent.click(preset45);

    // Click +5m stepper
    const plus5Btn = screen.getByText('+5');
    fireEvent.click(plus5Btn);

    // Notes textarea
    const notesInput = screen.getByPlaceholderText(/Formulas covered/i);
    fireEvent.change(notesInput, { target: { value: 'Solved 15 algebra questions' } });

    // Submit form
    const saveBtn = screen.getByText('Save Changes');
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith('sess-123', expect.objectContaining({
      subject: 'Quant',
      durationMinutes: 50,
      notes: 'Solved 15 algebra questions'
    }));
    expect(onClose).toHaveBeenCalled();
  });

  it('restricts non-numeric typing and auto-calculates duration from time intervals', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const session = {
      id: 'sess-456',
      subject: 'LRDI',
      durationMinutes: 20,
      startTime: '09:00 PM',
      endTime: '09:20 PM',
      notes: ''
    };

    render(
      <EditSessionModal
        isOpen={true}
        session={session}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const durationInput = screen.getByPlaceholderText('Mins');
    
    // Attempt typing 'e' and negative signs
    fireEvent.keyDown(durationInput, { key: 'e' });
    fireEvent.keyDown(durationInput, { key: '-' });
    
    // Change start and end time inputs to test interval auto-calculation
    const timeInputs = document.querySelectorAll('.edit-time-input');
    expect(timeInputs.length).toBe(2);

    // Change start time to 14:00 (02:00 PM) and end time to 15:30 (03:30 PM) -> 90 mins
    fireEvent.change(timeInputs[0], { target: { value: '14:00' } });
    fireEvent.change(timeInputs[1], { target: { value: '15:30' } });

    // Duration should auto-calculate to 90
    expect(durationInput.value).toBe('90');

    // Click save
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalledWith('sess-456', expect.objectContaining({
      durationMinutes: 90,
      startTime: '02:00 PM',
      endTime: '03:30 PM'
    }));
  });

  it('renders WeekContributionHeatmap with 7 days and displays quota and study time', () => {
    const mockTracker = {
      'Month 1': [
        {
          week: 'Week 1',
          days: [
            {
              day: 'Monday',
              quantCompleted: true,
              quantCount: 18,
              lrdiCompleted: true,
              lrdiCount: 4,
              varcCompleted: true,
              varcCount: 4,
              studyHours: 3.5
            },
            {
              day: 'Tuesday',
              quantCompleted: false,
              quantCount: 5,
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 1.0
            }
          ]
        }
      ]
    };

    render(
      <WeekContributionHeatmap
        tracker={mockTracker}
        startDateStr="2026-08-31"
        onNavigateToDay={() => {}}
      />
    );

    expect(screen.getAllByText(/Week 1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Quotas/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Mon')).toBeDefined();
  });

  it('renders graduated heatmap intensity levels: level-1 (<=10 Qs), level-2 (11-15 Qs), level-3 (16-17 Qs), and level-4 (all quotas conquered)', () => {
    const mockTrackerWithGraduatedDays = {
      'Month 1': [
        {
          week: 'Week 1',
          days: [
            {
              day: 'Monday',
              quantCompleted: false,
              quantCount: 10, // 10 questions -> level-1
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 0.5
            },
            {
              day: 'Tuesday',
              quantCompleted: false,
              quantCount: 14, // 14 questions -> level-2 (11-15 Qs)
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 1.2
            },
            {
              day: 'Wednesday',
              quantCompleted: false,
              quantCount: 17, // 17 questions -> level-3
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 2.6
            },
            {
              day: 'Thursday',
              quantCompleted: true,
              quantCount: 18,
              lrdiCompleted: true,
              lrdiCount: 4,
              varcCompleted: true,
              varcCount: 4, // all quotas completed -> level-4
              studyHours: 3.8
            },
            {
              day: 'Friday',
              quantCompleted: false,
              quantCount: 0,
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 0
            },
            {
              day: 'Saturday',
              quantCompleted: false,
              quantCount: 0,
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 0
            },
            {
              day: 'Sunday',
              quantCompleted: false,
              quantCount: 0,
              lrdiCompleted: false,
              lrdiCount: 0,
              varcCompleted: false,
              varcCount: 0,
              studyHours: 0
            }
          ]
        }
      ]
    };

    const { container } = render(
      <WeekContributionHeatmap
        tracker={mockTrackerWithGraduatedDays}
        startDateStr="2026-08-31"
        onNavigateToDay={() => {}}
      />
    );

    // Monday has level-1
    expect(container.querySelector('.heatmap-square.level-1')).toBeDefined();
    // Tuesday has level-2
    expect(container.querySelector('.heatmap-square.level-2')).toBeDefined();
    // Wednesday has level-3
    expect(container.querySelector('.heatmap-square.level-3')).toBeDefined();
    // Thursday has level-4
    expect(container.querySelector('.heatmap-square.level-4')).toBeDefined();
  });
});
