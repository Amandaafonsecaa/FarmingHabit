/**
 * Regras da economia do jogo. Só o servidor decide quanto cada ação paga;
 * o front recebe os valores já calculados e apenas mostra.
 */
export const XP_PER_LEVEL = 100;
export const levelFor = (xp: number) =>
  Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;

/** Meta cumprida no dia */
export const HARVEST_REWARD = { coins: 5, xp: 5 };
/** Meta semanal batida (uma vez por semana) */
export const WEEK_BONUS = { coins: 15, xp: 10 };
/** Teto de uma missão: o preset "grande" do quadro */
export const MISSION_LIMITS = { xp: 120, coins: 80 };

export const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const utcKey = (date: Date) => date.toISOString().slice(0, 10);

/**
 * O dia (AAAA-MM-DD) é "hoje" para o jogador em algum fuso do mundo (UTC−12 a UTC+14)?
 * O servidor não conhece o fuso de quem joga, então aceita essa janela e recusa qualquer outro dia.
 */
export function isPlayerToday(day: string, now = new Date()): boolean {
  if (!DAY_PATTERN.test(day)) return false;
  const earliest = utcKey(new Date(now.getTime() - 12 * 3600_000));
  const latest = utcKey(new Date(now.getTime() + 14 * 3600_000));
  return day >= earliest && day <= latest;
}
