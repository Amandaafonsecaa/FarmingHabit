import { deleteUserData, listUserData, saveUserData, userDataUrl } from '../services/api';
import { cachedAuthHeader } from './auth';

/**
 * Sincroniza com o servidor os dados que a pessoa coloca no site e que as telas guardam no navegador.
 * Ao abrir: baixa do servidor (vence a versão mais recente de cada chave; o que só existe aqui sobe).
 * Depois: toda gravação dessas chaves no localStorage é enviada ao servidor (agrupada em ~0,7s).
 * Assim as telas continuam lendo e escrevendo no localStorage como sempre, e nada fica só no navegador.
 */

/** Chaves sincronizadas. Ficam de fora: estado de tela (calendário virado, visita da gata), a lista antiga
 *  de compras (que já mora no servidor) e a foto da motivação (por enquanto só no navegador). */
export const SYNC_KEYS = new Set([
  'farminghabit.goals.v1', 'farminghabit.diary.v1', 'farminghabit.adventures.v1', 'farminghabit.missions.accepted.v1',
  'farminghabit.profile.v1', 'farminghabit.wish.v1', 'farminghabit.treasure.v1', 'farminghabit.harvest-rewards.v1',
  'farminghabit.perfect-day', 'farminghabit.settings.v1',
]);

// Quando cada chave foi alterada (ms) — fora do prefixo "farminghabit." para não ser sincronizada
const META_KEY = 'farminghabit-sync-meta';
const PUSH_DELAY_MS = 700;
const PULL_TIMEOUT_MS = 3000;

const nativeSet = Storage.prototype.setItem;
const nativeRemove = Storage.prototype.removeItem;
// Só envia depois que o servidor respondeu ao primeiro pedido (com o token da sessão)
let ready = false;
const timers = new Map<string, number>();
const waiting = new Set<string>();

function readMeta(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(META_KEY) ?? '{}'); } catch { return {}; }
}
function writeMeta(key: string, time: number) {
  try { nativeSet.call(localStorage, META_KEY, JSON.stringify({ ...readMeta(), [key]: time })); } catch { /* ignora */ }
}

async function push(key: string) {
  timers.delete(key);
  if (!ready) { waiting.add(key); return; }
  const value = localStorage.getItem(key);
  try {
    if (value === null) await deleteUserData(key);
    else writeMeta(key, Date.parse((await saveUserData(key, value)).updatedAt));
  } catch { waiting.add(key); /* sem servidor: tenta de novo na próxima abertura ou alteração */ }
}

function schedule(key: string) {
  window.clearTimeout(timers.get(key));
  timers.set(key, window.setTimeout(() => { void push(key); }, PUSH_DELAY_MS));
}

/** Intercepta as gravações do localStorage (no protótipo: atribuir em localStorage.setItem criaria um item) */
function watchLocalStorage() {
  Storage.prototype.setItem = function setItem(this: Storage, key: string, value: string) {
    const changed = this === localStorage && SYNC_KEYS.has(key) && this.getItem(key) !== value;
    nativeSet.call(this, key, value);
    if (changed) { writeMeta(key, Date.now()); schedule(key); }
  };
  Storage.prototype.removeItem = function removeItem(this: Storage, key: string) {
    const existed = this === localStorage && SYNC_KEYS.has(key) && this.getItem(key) !== null;
    nativeRemove.call(this, key);
    if (existed) { writeMeta(key, Date.now()); schedule(key); }
  };
  // Ao fechar a aba, envia o que ainda está esperando (keepalive deixa a requisição terminar)
  window.addEventListener('pagehide', () => {
    if (!ready) return;
    for (const key of [...timers.keys(), ...waiting]) {
      const value = localStorage.getItem(key);
      void fetch(userDataUrl(key), value === null
        ? { method: 'DELETE', keepalive: true, headers: cachedAuthHeader() }
        : { method: 'PUT', keepalive: true, headers: { 'Content-Type': 'application/json', ...cachedAuthHeader() }, body: JSON.stringify({ value }) }).catch(() => {});
    }
  });
}

/** Envia já uma chave que está esperando o agrupamento (ex.: as metas, antes de pedir a colheita ao servidor) */
export async function flushSync(key: string) {
  window.clearTimeout(timers.get(key));
  await push(key);
}

const withTimeout = <T,>(promise: Promise<T>) => Promise.race([promise, new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('timeout')), PULL_TIMEOUT_MS))]);

/** Chamar antes de desenhar o app: traz do servidor o que for mais novo e começa a vigiar as gravações */
export async function startCloudSync() {
  watchLocalStorage();
  try {
    const remote = await withTimeout(listUserData());
    ready = true;
    const meta = readMeta();
    const onServer = new Set<string>();
    for (const item of remote) {
      if (!SYNC_KEYS.has(item.key)) continue;
      onServer.add(item.key);
      const remoteTime = Date.parse(item.updatedAt);
      const local = localStorage.getItem(item.key);
      if (local === null || remoteTime > (meta[item.key] ?? 0)) {
        nativeSet.call(localStorage, item.key, item.value);
        writeMeta(item.key, remoteTime);
      } else if (local !== item.value) schedule(item.key);
    }
    // O que só existe neste navegador (dados de antes da sincronização) sobe para o servidor
    for (const key of SYNC_KEYS) if (!onServer.has(key) && localStorage.getItem(key) !== null) schedule(key);
    for (const key of waiting) schedule(key);
    waiting.clear();
  } catch { /* servidor fora do ar: o app abre com os dados do navegador e envia quando der */ }
}
