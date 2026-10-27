/** Fase do dia e estação (hemisfério sul, como no Brasil) para pintar o céu e o cenário */
export type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export function phaseFor(date: Date): DayPhase {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour >= 5 && hour < 7.5) return 'dawn';
  if (hour >= 7.5 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

export function seasonFor(date: Date): Season {
  const month = date.getMonth(); // 0 = janeiro
  if (month >= 8 && month <= 10) return 'spring';  // setembro a novembro
  if (month === 11 || month <= 1) return 'summer'; // dezembro a fevereiro
  if (month >= 2 && month <= 4) return 'autumn';   // março a maio
  return 'winter';                                  // junho a agosto
}

export const SEASON_NAMES: Record<Season, string> = { spring: 'Primavera', summer: 'Verão', autumn: 'Outono', winter: 'Inverno' };
export const PHASE_NAMES: Record<DayPhase, string> = { dawn: 'Amanhecer', day: 'Dia', dusk: 'Entardecer', night: 'Noite' };

/** Paleta da Casa, compartilhada por todos os céus e janelas. */
export const SKY_PALETTES: Record<DayPhase, { top: string; middle: string; bottom: string; stop: number }> = {
  dawn: { top: '#f4b3a6', middle: '#fbd3a2', bottom: '#a9d8e8', stop: 55 },
  day: { top: '#74c9ef', middle: '#74c9ef', bottom: '#74c9ef', stop: 55 },
  dusk: { top: '#ee8a5c', middle: '#f6c27a', bottom: '#a3b9d8', stop: 50 },
  night: { top: '#141a3d', middle: '#27346a', bottom: '#3b4f80', stop: 60 },
};
export function skyBackground(phase: DayPhase): string {
  const sky = SKY_PALETTES[phase];
  return `linear-gradient(${sky.top}, ${sky.middle} ${sky.stop}%, ${sky.bottom})`;
}
