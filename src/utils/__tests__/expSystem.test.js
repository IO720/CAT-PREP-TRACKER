import { describe, it, expect } from 'vitest';
import { 
  calculateLevelFromExp, 
  getExpForLevel, 
  getExpProgress, 
  isMilestoneLevel, 
  getMilestoneTitle, 
  calculateDailyLoginReward,
  getUnlockedRewardsForLevel,
  calculatePreviousDayObjectiveExp
} from '../expSystem';

describe('Candidate EXP Progression & Milestone System', () => {
  it('calculates level accurately based on progressive EXP curve', () => {
    expect(calculateLevelFromExp(0)).toBe(1);
    expect(calculateLevelFromExp(50)).toBe(1);
    expect(calculateLevelFromExp(200)).toBe(2);
    expect(calculateLevelFromExp(1000)).toBe(5);
    expect(calculateLevelFromExp(4000)).toBe(10);
    expect(calculateLevelFromExp(13000)).toBe(20);
  });

  it('calculates EXP required for levels monotonically', () => {
    expect(getExpForLevel(1)).toBe(0);
    expect(getExpForLevel(2)).toBeGreaterThan(0);
    expect(getExpForLevel(10)).toBeGreaterThan(getExpForLevel(9));
    expect(getExpForLevel(20)).toBeGreaterThan(getExpForLevel(19));
  });

  it('computes detailed level progress within current rank', () => {
    const progress = getExpProgress(500);
    expect(progress.currentLevel).toBe(3);
    expect(progress.totalExp).toBe(500);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
  });

  it('identifies major decade milestones and awards prestige titles', () => {
    expect(isMilestoneLevel(10)).toBe(true);
    expect(isMilestoneLevel(20)).toBe(true);
    expect(isMilestoneLevel(30)).toBe(true);
    expect(isMilestoneLevel(7)).toBe(false);
    expect(isMilestoneLevel(15)).toBe(false);

    expect(getMilestoneTitle(10)).toBe('Elite Strategist');
    expect(getMilestoneTitle(20)).toBe('Grandmaster Operative');
    expect(getMilestoneTitle(30)).toBe('Mythic Sovereign');
  });

  it('calculates daily login rewards with progressive streak bonuses', () => {
    const day1 = calculateDailyLoginReward(0);
    expect(day1.baseExp).toBe(120);
    expect(day1.streakBonus).toBe(0);
    expect(day1.totalAward).toBe(120);

    const day5 = calculateDailyLoginReward(4);
    expect(day5.totalAward).toBe(120 + 4 * 20);

    const day15Capped = calculateDailyLoginReward(14);
    expect(day15Capped.streakBonus).toBe(180); // Capped at +180
  });

  it('provides unlocked cosmetics for level promotions', () => {
    const lvl3Rewards = getUnlockedRewardsForLevel(3);
    expect(lvl3Rewards.some(r => r.name.includes('Electric Gyro'))).toBe(true);

    const lvl10Rewards = getUnlockedRewardsForLevel(10);
    expect(lvl10Rewards.some(r => r.tier === 'LEGENDARY')).toBe(true);

    const lvl20Rewards = getUnlockedRewardsForLevel(20);
    expect(lvl20Rewards.some(r => r.name.includes('Omni Dragon'))).toBe(true);
  });

  it('evaluates and calculates previous day objective completion EXP accurately', () => {
    const mockTracker = {
      'Month 1': [
        {
          week: 'Week 1',
          days: [
            {
              day: 'Monday',
              quantCompleted: true,
              lrdiCompleted: true,
              varcCompleted: true,
              quantCount: 10,
              lrdiCount: 5,
              varcCount: 5
            },
            {
              day: 'Tuesday',
              quantCompleted: true,
              lrdiCompleted: false,
              varcCompleted: true
            }
          ]
        }
      ]
    };

    // Test completed day (Monday Aug 31, 2026)
    const resCompleted = calculatePreviousDayObjectiveExp(mockTracker, '2026-08-31', new Date('2026-08-31T12:00:00Z'));
    expect(resCompleted.allCompleted).toBe(true);
    expect(resCompleted.baseExp).toBe(300);
    expect(resCompleted.volumeBonus).toBe(100); // 20 questions * 5 = 100
    expect(resCompleted.totalAward).toBe(400);

    // Test incomplete day (Tuesday Sep 1, 2026)
    const resIncomplete = calculatePreviousDayObjectiveExp(mockTracker, '2026-08-31', new Date('2026-09-01T12:00:00Z'));
    expect(resIncomplete.allCompleted).toBe(false);
    expect(resIncomplete.incompleteList).toContain('DILR');
  });
});
