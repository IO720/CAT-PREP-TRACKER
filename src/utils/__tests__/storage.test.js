import { describe, it, expect } from 'vitest';
import { mergeTrackerStates, getInitialState } from '../storage';

describe('storage - Offline & Local State Merging', () => {
  it('merges local and cloud tracker states without losing progress', () => {
    const local = getInitialState();
    const cloud = getInitialState();

    // Local has 18 quant on Tuesday
    local.tracker['Month 1'][0].days[1].quantCompleted = true;
    local.tracker['Month 1'][0].days[1].quantCount = 18;
    local.tracker['Month 1'][0].days[1].notes = 'Revised percentages formula';

    // Cloud has 4 LRDI on Tuesday and 4 VARC on Wednesday
    cloud.tracker['Month 1'][0].days[1].lrdiCompleted = true;
    cloud.tracker['Month 1'][0].days[1].lrdiCount = 4;
    cloud.tracker['Month 1'][0].days[2].varcCompleted = true;
    cloud.tracker['Month 1'][0].days[2].varcCount = 4;

    const merged = mergeTrackerStates(local, cloud);

    // Tuesday should have BOTH Quant (from local) and LRDI (from cloud)
    const tuesday = merged.tracker['Month 1'][0].days[1];
    expect(tuesday.quantCompleted).toBe(true);
    expect(tuesday.quantCount).toBe(18);
    expect(tuesday.lrdiCompleted).toBe(true);
    expect(tuesday.lrdiCount).toBe(4);
    expect(tuesday.notes).toBe('Revised percentages formula');

    // Wednesday should have VARC (from cloud)
    const wednesday = merged.tracker['Month 1'][0].days[2];
    expect(wednesday.varcCompleted).toBe(true);
    expect(wednesday.varcCount).toBe(4);
  });

  it('merges study plan and mock tests non-destructively', () => {
    const local = getInitialState();
    const cloud = getInitialState();

    local.studyPlan[0].status = 'Completed';
    cloud.studyPlan[1].status = 'In Progress';

    local.mocks[0].status = 'Taken';
    local.mocks[0].totalScore = 95;

    const merged = mergeTrackerStates(local, cloud);
    expect(merged.studyPlan[0].status).toBe('Completed');
    expect(merged.studyPlan[1].status).toBe('In Progress');
    expect(merged.mocks[0].status).toBe('Taken');
    expect(merged.mocks[0].totalScore).toBe(95);
  });
});
