import type { GoalArea } from '../types/goals';

/** Áreas da meta, na ordem em que aparecem no modal */
export const GOAL_AREAS: { value: GoalArea; label: string }[] = [
  { value: 'saude', label: 'Saúde' }, { value: 'estudos', label: 'Estudos' },
  { value: 'pessoal', label: 'Vida pessoal' }, { value: 'lazer', label: 'Lazer' },
  { value: 'nenhuma', label: 'Sem categoria' },
];

/** Área da meta; metas antigas (sem área) ou com uma área que saiu da lista contam como "Sem categoria" */
export const areaOf = (area: string | undefined): GoalArea => GOAL_AREAS.some(item => item.value === area) ? area as GoalArea : 'nenhuma';
export const areaLabel = (area: GoalArea) => GOAL_AREAS.find(item => item.value === area)?.label ?? 'Sem categoria';
