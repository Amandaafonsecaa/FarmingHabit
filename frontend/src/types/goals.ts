export type GoalIcon = 'leaf' | 'book' | 'water' | 'sun' | 'flame' | 'coffee' | 'target';
/** Mesmo índice de Date#getDay: 0 = domingo, 1 = segunda ... 6 = sábado */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Ritmo da meta: todo dia, N vezes na semana (reinicia na segunda) ou só em dias escolhidos */
export type GoalFrequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; timesPerWeek: number }
  | { kind: 'weekdays'; days: Weekday[] };

/** Como o dia é cumprido: um check único ou uma quantidade (copos, minutos, páginas...) */
export type GoalMeasure =
  | { kind: 'check' }
  | { kind: 'quantity'; target: number; unit: string; step: number };

/** Área da vida que a meta cuida (opcional; metas antigas não têm e contam como "sem categoria") */
export type GoalArea = 'saude' | 'estudos' | 'pessoal' | 'lazer' | 'nenhuma';

export interface TrackedGoal { id: string; title: string; icon: GoalIcon; frequency: GoalFrequency; measure: GoalMeasure; area?: GoalArea; createdOn: string }
export type NewTrackedGoal = Omit<TrackedGoal, 'id' | 'createdOn'>;

/** Registro diário: data (AAAA-MM-DD) → id da meta → quantidade feita no dia */
export type GoalLog = Record<string, Record<string, number>>;

/** Estado de um dia no calendário da safra */
export type DayStatus = 'harvest' | 'partial' | 'dry' | 'pending' | 'rest' | 'future';
