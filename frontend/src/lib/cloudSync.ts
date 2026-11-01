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
  'farminghabit.profile.v1', 'farminghabit.wish.v1', 'farminghabit.perfect-day', 'farminghabit.settings.v1',
]);

// Quando cada chave foi alterada (ms) — fora do prefixo "farminghabit." para não ser sincronizada
const META_KEY = 'farminghabit-sync-meta';
// Último "updatedAt" da conta que este navegador já confirmou (por um pull aceito ou um push bem-sucedido) —
// nunca gravado por uma escrita comum, só pela própria reconciliação. Sem isso, um navegador que nunca
// chegou a sincronizar de verdade (ex.: um pull que sempre falhou) podia "vencer" a conta só porque a
// última escrita local (de um valor de exemplo, nunca confirmado) parecia mais recente.
const BASELINE_KEY = 'farminghabit-sync-baseline';
const PUSH_DELAY_MS = 700;
// Serviço gratuito (ex.: Render free) dorme e pode levar dezenas de segundos para acordar no primeiro pedido;
// 3s era menos que esse tempo e fazia o primeiro acesso cair nos dados locais (vazios) em vez de esperar a conta.
const PULL_TIMEOUT_MS = 20000;

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
function readBaseline(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(BASELINE_KEY) ?? '{}'); } catch { return {}; }
}
function writeBaseline(key: string, time: number) {
  try { nativeSet.call(localStorage, BASELINE_KEY, JSON.stringify({ ...readBaseline(), [key]: time })); } catch { /* ignora */ }
}

async function push(key: string) {
  timers.delete(key);
  if (!ready) { waiting.add(key); return; }
  const value = localStorage.getItem(key);
  try {
    if (value === null) { await deleteUserData(key); writeBaseline(key, Date.now()); }
    else {
      const time = Date.parse((await saveUserData(key, value)).updatedAt);
      writeMeta(key, time);
      // Confirmado pela conta: a partir de agora, só uma mudança local depois deste ponto pode vencer um pull
      writeBaseline(key, time);
    }
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

/** Envia já uma chave que ainda espera para subir (ex.: meta recém-criada, antes do check-in que o servidor vai pagar) */
export async function flushIfPending(key: string) {
  if (!timers.has(key) && !waiting.has(key)) return;
  window.clearTimeout(timers.get(key));
  waiting.delete(key);
  await push(key);
}

const withTimeout = <T,>(promise: Promise<T>) => Promise.race([promise, new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error('timeout')), PULL_TIMEOUT_MS))]);

/** Este navegador já guardou dados desta conta antes? (sem isso, não há o que mostrar até a conta responder) */
export const hasLocalSnapshot = () => Object.keys(readMeta()).length > 0;

/**
 * Começa a vigiar as gravações (na hora) e traz da conta o que for mais novo (em segundo plano).
 * Chaves que mudarem avisam as telas abertas com um evento "storage", e elas se atualizam sozinhas.
 * Devolve se a conta respondeu (false: servidor fora do ar ou demorou demais).
 */
export async function startCloudSync(): Promise<boolean> {
  // Chaves que o navegador ainda não tinha ao abrir: se a tela gravar um valor padrão nelas antes de a
  // conta responder (ex.: metas de exemplo), vale o que está na conta
  const absentAtBoot = new Set([...SYNC_KEYS].filter(key => localStorage.getItem(key) === null));
  // Congelado antes de vigiar as gravações: uma escrita de corrida (ex.: a tela planta um valor de exemplo
  // enquanto a conta ainda não respondeu) não pode contar como "histórico de antes desta abertura".
  const metaAtBoot = readMeta();
  watchLocalStorage();
  try {
    const remote = await withTimeout(listUserData());
    ready = true;
    const meta = readMeta();
    const baseline = readBaseline();
    // Navegador que já usava a sincronização antes desta checagem existir: mantém o comportamento de antes
    // (compara os horários) só para quem já tinha essa chave gravada ANTES desta abertura. Uma chave sem
    // nenhum histórico anterior (nem desta abertura) nunca ganha um ponto de partida por aqui — ela só o
    // ganha depois de uma reconciliação de verdade, mais abaixo.
    for (const key of Object.keys(metaAtBoot)) if (!(key in baseline)) { baseline[key] = metaAtBoot[key] - 1; writeBaseline(key, metaAtBoot[key] - 1); }
    const onServer = new Set<string>();
    const changed: { key: string; oldValue: string | null; newValue: string }[] = [];
    for (const item of remote) {
      if (!SYNC_KEYS.has(item.key)) continue;
      onServer.add(item.key);
      const remoteTime = Date.parse(item.updatedAt);
      const local = localStorage.getItem(item.key);
      // Local só vence se este navegador já confirmou esta chave com a conta alguma vez (baseline existe),
      // mudou de verdade depois dessa confirmação, e essa mudança é mais recente que o valor da conta.
      // Sem uma confirmação anterior, não há como saber se a escrita local é uma edição de verdade ou só
      // um valor de exemplo nunca sincronizado — e esse valor nunca pode vencer o que já está na conta.
      const confirmedBefore = baseline[item.key];
      const changedSinceConfirmed = confirmedBefore !== undefined && (meta[item.key] ?? 0) > confirmedBefore;
      const localWins = local !== null && !absentAtBoot.has(item.key) && changedSinceConfirmed && (meta[item.key] ?? 0) > remoteTime;
      if (!localWins) {
        if (local !== item.value) changed.push({ key: item.key, oldValue: local, newValue: item.value });
        nativeSet.call(localStorage, item.key, item.value);
        writeMeta(item.key, remoteTime);
        writeBaseline(item.key, remoteTime);
        // O valor da conta venceu: o que estava esperando para subir (ex.: um padrão gravado ao abrir) não sobe mais
        window.clearTimeout(timers.get(item.key));
        timers.delete(item.key);
        waiting.delete(item.key);
      } else if (local !== item.value) schedule(item.key);
    }
    // As telas já desenhadas trocam para os dados da conta
    for (const change of changed) window.dispatchEvent(new StorageEvent('storage', { ...change, storageArea: localStorage }));
    // O que só existe neste navegador (dados de antes da sincronização) sobe para o servidor
    for (const key of SYNC_KEYS) if (!onServer.has(key) && localStorage.getItem(key) !== null) schedule(key);
    for (const key of waiting) schedule(key);
    waiting.clear();
    return true;
  } catch { /* servidor fora do ar: o app abre com os dados do navegador e envia quando der */ return false; }
}
