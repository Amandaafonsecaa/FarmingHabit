import { isPlayerToday, isUpToPlayerToday, levelFor } from './economy';
import {
  dailyTarget,
  isWeeklyGoalMet,
  mondayOf,
  parseGoals,
  weekChecks,
  weekDays,
} from './goal-rules';

describe('economy rules', () => {
  it('levels up every 100 XP', () => {
    expect([levelFor(0), levelFor(99), levelFor(100), levelFor(250)]).toEqual([
      1, 1, 2, 3,
    ]);
  });
  it('accepts only "today" in some time zone', () => {
    const now = new Date('2026-10-27T12:00:00Z');
    expect(isPlayerToday('2026-10-27', now)).toBe(true);
    expect(isPlayerToday('2026-10-28', now)).toBe(true); // UTC+14 já é dia 28
    expect(isPlayerToday('2026-10-26', new Date('2026-10-27T05:00:00Z'))).toBe(
      true,
    ); // UTC−12 ainda é dia 26
    expect(isPlayerToday('2026-10-25', now)).toBe(false);
    expect(isPlayerToday('2026-10-29', now)).toBe(false);
    expect(isPlayerToday('27/10/2026', now)).toBe(false);
  });
  it('accepts past days and today, never the future', () => {
    const now = new Date('2026-10-31T12:00:00Z');
    expect(isUpToPlayerToday('2026-01-01', now)).toBe(true);
    expect(isUpToPlayerToday('2026-11-01', now)).toBe(true); // já é dia 1 em UTC+14
    expect(isUpToPlayerToday('2026-11-02', now)).toBe(false);
  });
});

describe('goal rules', () => {
  const water = {
    id: 'agua',
    frequency: { kind: 'daily' },
    measure: { kind: 'quantity', target: 8 },
  };
  const gym = {
    id: 'academia',
    frequency: { kind: 'weekly', timesPerWeek: 2 },
    measure: { kind: 'check' },
  };
  it('uses the quantity target or 1 for checks', () => {
    expect(dailyTarget(water)).toBe(8);
    expect(dailyTarget(gym)).toBe(1);
  });
  it('finds the monday of the week', () => {
    expect(mondayOf('2026-10-27')).toBe('2026-10-26');
    expect(mondayOf('2026-11-01')).toBe('2026-10-26');
    expect(mondayOf('2026-10-26')).toBe('2026-10-26');
  });
  it('parses goal definitions and ignores the old log', () => {
    expect(parseGoals('{"goals":[{"id":"a"}],"log":{}}')).toEqual([
      { id: 'a' },
    ]);
    expect(parseGoals('nope')).toBeNull();
    expect(parseGoals('{"log":{}}')).toBeNull();
  });
  it('lists the seven days of the week from monday', () => {
    expect(weekDays('2026-10-29')).toEqual([
      '2026-10-26',
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
    ]);
  });
  it('counts week checks from per-day amounts', () => {
    const goal = {
      id: 'g',
      frequency: { kind: 'weekly', timesPerWeek: 2 },
      measure: { kind: 'check' },
    };
    const amounts = { '2026-10-26': 1, '2026-10-28': 1, '2026-10-19': 1 };
    expect(weekChecks(goal, amounts, '2026-10-29')).toBe(2);
    expect(isWeeklyGoalMet(goal, amounts, '2026-10-29')).toBe(true);
  });
});
