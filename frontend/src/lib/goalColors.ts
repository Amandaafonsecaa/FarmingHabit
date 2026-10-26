import type { GoalIcon, TrackedGoal } from '../types/goals';

/** Cor de cada meta (a mesma das verduras na barraca das Metas): [cor principal, brilho] */
export const GOAL_COLORS: Record<GoalIcon, [string, string]> = {
  leaf: ['#72ad32', '#c0e36b'], book: ['#e8954a', '#ffc58a'], water: ['#5f86b8', '#a9c8ef'], flame: ['#df5438', '#ff9970'],
  target: ['#e8762f', '#ffad6b'], sun: ['#f2c453', '#fff087'], coffee: ['#8a5838', '#c08a58'],
};

export const goalColor = (goal: TrackedGoal) => GOAL_COLORS[goal.icon] ?? GOAL_COLORS.leaf;
