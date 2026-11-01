import type { GoalArea, TrackedGoal } from '../types/goals';

/** Áreas da meta, na ordem em que aparecem no modal */
export const GOAL_AREAS: { value: GoalArea; label: string }[] = [
  { value: 'saude', label: 'Saúde' }, { value: 'estudos', label: 'Estudos' },
  { value: 'pessoal', label: 'Vida pessoal' }, { value: 'lazer', label: 'Lazer' },
  { value: 'nenhuma', label: 'Sem categoria' },
];

/** Área da meta; metas antigas (sem área) ou com uma área que saiu da lista contam como "Sem categoria" */
export const areaOf = (area: string | undefined): GoalArea => GOAL_AREAS.some(item => item.value === area) ? area as GoalArea : 'nenhuma';
export const areaLabel = (area: GoalArea) => GOAL_AREAS.find(item => item.value === area)?.label ?? 'Sem categoria';

/** Classifica exemplos antigos sem alterar metas editadas ou categorias escolhidas pela pessoa. */
export function classifyDefaultGoals(goals: TrackedGoal[]): TrackedGoal[] {
  const defaults: Record<string, { title: string; area: GoalArea }> = {
    'exemplo-leitura': { title: 'Ler 20 páginas', area: 'estudos' },
    'exemplo-academia': { title: 'Ir à academia', area: 'saude' },
    'exemplo-estudo': { title: 'Estudar inglês', area: 'estudos' },
    'exemplo-agua': { title: 'Beber 2 litros de água', area: 'saude' },
  };
  return goals.map(goal => {
    const sample = defaults[goal.id];
    return goal.area === undefined && sample && goal.title === sample.title ? { ...goal, area: sample.area } : goal;
  });
}
