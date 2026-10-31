import { NetworkError, deleteGoalCheckins, importCheckins, listCheckins, saveCheckin, type CheckinResult } from '../services/api';
import type { GoalLog } from '../types/goals';
import { flushIfPending } from './cloudSync';
import { PLAYER_EVENT } from './harvestRewards';

/**
 * Histórico das metas (quanto foi feito em cada meta, por dia). Quem guarda é o servidor (goal_checkins):
 * cada marcação é um pedido próprio, então dois aparelhos nunca apagam o que o outro marcou.
 * Aqui fica uma cópia para a tela abrir na hora e uma fila para o que foi marcado sem internet.
 */
const GOALS_KEY = 'farminghabit.goals.v1';
// Fora do SYNC_KEYS do cloudSync: o servidor é a fonte, não um blob
const CACHE_KEY = 'farminghabit.checkins.cache.v1';
const PENDING_KEY = 'farminghabit.checkins.pending.v1';
export const CHECKINS_EVENT = 'farminghabit:checkins';

/** Marcações que ainda não chegaram ao servidor: "<meta>|<dia>" → quantidade (a mais recente vence) */
type Pending = Record<string, number>;

function readJson<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}
function writeJson(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo privado: segue só em memória */ }
}

export const readLog = (): GoalLog => readJson<GoalLog>(CACHE_KEY, {});

function writeLog(log: GoalLog) {
  writeJson(CACHE_KEY, log);
  window.dispatchEvent(new Event(CHECKINS_EVENT));
}

function withAmount(log: GoalLog, goalId: string, day: string, amount: number): GoalLog {
  const entries = { ...log[day] };
  if (amount > 0) entries[goalId] = amount; else delete entries[goalId];
  const next = { ...log, [day]: entries };
  if (!Object.keys(entries).length) delete next[day];
  return next;
}

/** Grava na cópia local (a tela responde na hora); quem confirma é o sendCheckin */
export function setLocalAmount(goalId: string, day: string, amount: number): GoalLog {
  const next = withAmount(readLog(), goalId, day, amount);
  writeLog(next);
  return next;
}

const pendingKey = (goalId: string, day: string) => `${goalId}|${day}`;
function splitPending(key: string) {
  const at = key.lastIndexOf('|');
  return { goalId: key.slice(0, at), day: key.slice(at + 1) };
}
function enqueue(goalId: string, day: string, amount: number) {
  writeJson(PENDING_KEY, { ...readJson<Pending>(PENDING_KEY, {}), [pendingKey(goalId, day)]: amount });
}
function dequeue(key: string) {
  const pending = readJson<Pending>(PENDING_KEY, {});
  delete pending[key];
  writeJson(PENDING_KEY, pending);
}

function announcePaid(result: CheckinResult) {
  if (result.coins || result.xp) window.dispatchEvent(new CustomEvent(PLAYER_EVENT, { detail: result.user }));
}

// Um envio por vez: dois toques rápidos numa meta de quantidade chegam ao servidor na ordem em que aconteceram
let queue: Promise<unknown> = Promise.resolve();
function inOrder<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => {});
  return next;
}

/**
 * Envia a marcação; o servidor grava e, se a meta foi cumprida hoje, paga a colheita no mesmo pedido.
 * Sem conexão, guarda na fila e devolve null (sobe na próxima sincronização). Outros erros sobem para a tela.
 */
export function sendCheckin(goalId: string, day: string, amount: number): Promise<CheckinResult | null> {
  return inOrder(async () => {
    try {
      // Meta recém-criada: o servidor só paga se já conhece a meta
      await flushIfPending(GOALS_KEY);
      const result = await saveCheckin(goalId, day, amount);
      dequeue(pendingKey(goalId, day));
      announcePaid(result);
      return result;
    } catch (error) {
      if (!(error instanceof NetworkError)) throw error;
      enqueue(goalId, day, amount);
      return null;
    }
  });
}

/** Meta arrancada: some do histórico local, da fila e do servidor (sem internet, o servidor fica com linhas órfãs, que a tela ignora) */
export async function removeGoalCheckins(goalId: string) {
  const log = readLog();
  writeLog(Object.fromEntries(Object.entries(log).map(([day, entries]) => {
    const { [goalId]: _removed, ...rest } = entries;
    return [day, rest];
  }).filter(([, entries]) => Object.keys(entries).length)));
  for (const key of Object.keys(readJson<Pending>(PENDING_KEY, {}))) if (splitPending(key).goalId === goalId) dequeue(key);
  try { await inOrder(() => deleteGoalCheckins(goalId)); } catch (error) { if (!(error instanceof NetworkError)) throw error; }
}

/** Histórico que ainda mora no blob das metas (antes dos check-ins no servidor): sobe sem pagar e sai do blob */
async function importLegacyLog() {
  const stored = readJson<{ goals?: unknown; log?: GoalLog } | null>(GOALS_KEY, null);
  if (!stored?.log || typeof stored.log !== 'object' || !Object.keys(stored.log).length) return;
  await importCheckins(stored.log);
  writeJson(GOALS_KEY, { goals: stored.goals ?? [] });
}

/** Reenvia a fila; para no primeiro erro de conexão. Marcações recusadas pelo servidor (ex.: dia inválido) saem da fila */
async function flushPending() {
  for (const [key, amount] of Object.entries(readJson<Pending>(PENDING_KEY, {}))) {
    const { goalId, day } = splitPending(key);
    try {
      announcePaid(await inOrder(() => saveCheckin(goalId, day, amount)));
      dequeue(key);
    } catch (error) {
      if (error instanceof NetworkError) return;
      dequeue(key);
    }
  }
}

async function pull() {
  try {
    await importLegacyLog();
    await flushPending();
    let log: GoalLog = {};
    for (const { goalId, day, amount } of await listCheckins()) log = withAmount(log, goalId, day, amount);
    // O que ainda está na fila continua aparecendo como marcado
    for (const [key, amount] of Object.entries(readJson<Pending>(PENDING_KEY, {}))) {
      const { goalId, day } = splitPending(key);
      log = withAmount(log, goalId, day, amount);
    }
    writeLog(log);
  } catch { /* sem servidor: a tela segue com a cópia local */ }
}

let syncing: Promise<void> | null = null;
/** Sobe histórico antigo e fila, depois traz do servidor o histórico inteiro (ao abrir e quando a internet volta) */
export function syncCheckins(): Promise<void> {
  syncing ??= pull().finally(() => { syncing = null; });
  return syncing;
}
window.addEventListener('online', () => { void syncCheckins(); });

/** Esquece o histórico local e a fila (reset das metas) */
export function clearCheckins() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* ignora */ }
  writeLog({});
}
