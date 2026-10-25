import { farmName as DEFAULT_FARM_NAME } from '../data/world';

/** Preferências do jogo, guardadas neste navegador e aplicadas como classes no <html> */
export interface Settings { farmName: string; calmMode: boolean; celebrations: boolean; critters: boolean }

const KEY = 'farminghabit.settings.v1';
const EVENT = 'farminghabit:settings';
const DEFAULTS: Settings = { farmName: DEFAULT_FARM_NAME, calmMode: false, celebrations: true, critters: true };

export function readSettings(): Settings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return DEFAULTS; }
}

/** Modo calmo, celebrações e bichinhos viram classes globais que o CSS respeita em todas as abas */
export function applySettings(settings: Settings) {
  const root = document.documentElement;
  root.classList.toggle('calm-mode', settings.calmMode);
  root.classList.toggle('no-celebrations', !settings.celebrations);
  root.classList.toggle('no-critters', !settings.critters);
}

export function saveSettings(settings: Settings) {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* modo privado: vale só nesta sessão */ }
  applySettings(settings);
  window.dispatchEvent(new Event(EVENT));
}

export const SETTINGS_EVENT = EVENT;

// --- Backup dos dados que vivem no navegador ---
export const LOCAL_KEYS = ['farminghabit.goals.v1', 'farminghabit.diary.v1', 'farminghabit.adventures.v1', 'farminghabit.missions.accepted.v1', 'farminghabit.profile.v1', 'farminghabit.purchases.v1', 'farminghabit.wish.v1', 'farminghabit.treasure.v1', KEY];

export function exportBackup() {
  const data = Object.fromEntries(LOCAL_KEYS.map(key => { try { return [key, JSON.parse(localStorage.getItem(key) ?? 'null')]; } catch { return [key, null]; } }));
  return JSON.stringify({ app: 'FarmingHabit', version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

/** Restaura um backup gerado por exportBackup; recusa arquivos de outra origem */
export function importBackup(text: string) {
  const parsed = JSON.parse(text);
  if (parsed?.app !== 'FarmingHabit' || typeof parsed.data !== 'object') throw new Error('Este arquivo não é um backup do FarmingHabit.');
  for (const key of LOCAL_KEYS) {
    const value = parsed.data[key];
    if (value === null || value === undefined) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value));
  }
}
