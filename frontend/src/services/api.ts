import type { Mission, Reward } from '../types/world';
import type { Purchase } from '../lib/shop';
import { toKey } from '../lib/goalLogic';
import { currentAccessToken } from '../lib/auth';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export interface Player { id: string; name: string; level: number; xp: number; coins: number; email?: string; createdAt?: string }
interface ApiMission { id: string; title: string; description: string; xpReward: number; coinsReward: number; completed: boolean; completedAt?: string | null; userId: string | null }
interface ApiReward { id: string; title: string; description: string | null; key: string | null; price: number; available: boolean; userId: string | null }
interface ApiPurchase { id: string; rewardId: string | null; title: string; price: number; createdAt: string; used: boolean; usedAt: string | null }
const toPurchase = (item: ApiPurchase): Purchase => ({ id: item.id, rewardId: item.rewardId ?? '', title: item.title, price: item.price, date: toKey(new Date(item.createdAt)), used: item.used, usedAt: item.usedAt });
type PlayerStats = Pick<Player, 'id' | 'level' | 'xp' | 'coins'>;
export interface NewMission { title: string; description: string; xp: number; coins: number }

/** Todo pedido leva o token da sessão: o backend descobre o jogador por ele, nunca por um id na URL */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await currentAccessToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
    });
  } catch {
    throw new Error(`Servidor indisponível em ${API_URL}. O backend está rodando?`);
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
    throw new Error(message || `Erro ${response.status} ao acessar ${path}`);
  }
  return body as T;
}

// --- Jogador (GET /users/me: o jogador do token; é criado no primeiro acesso) ---

const toPlayer = ({ id, name, level, xp, coins, email, createdAt }: Player): Player => ({ id, name, level, xp, coins, email, createdAt });

export async function loadPlayer(): Promise<Player> {
  return toPlayer(await request<Player>('/users/me'));
}

/** Credita moedas e XP (baús e metas cumpridas), com a mesma regra de nível do backend: a cada 100 XP, +1 nível */
export async function grantRewards(player: Player, coins: number, xp: number): Promise<Player> {
  const totalXp = player.xp + xp;
  return toPlayer(await request<Player>('/users/me', { method: 'PATCH', body: JSON.stringify({ coins: player.coins + coins, xp: totalXp, level: Math.floor(totalXp / 100) + 1 }) }));
}

/** Renomeia o jogador (PATCH /users/me) */
export async function updatePlayerName(name: string): Promise<Player> {
  return toPlayer(await request<Player>('/users/me', { method: 'PATCH', body: JSON.stringify({ name }) }));
}

// --- Dados do jogador sincronizados com o servidor (ver lib/cloudSync) ---

export interface StoredData { key: string; value: string; updatedAt: string }

export async function listUserData(): Promise<StoredData[]> {
  return request<StoredData[]>('/users/me/storage');
}

export async function saveUserData(key: string, value: string): Promise<{ key: string; updatedAt: string }> {
  return request(`/users/me/storage/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify({ value }) });
}

export async function deleteUserData(key: string): Promise<void> {
  await request(`/users/me/storage/${encodeURIComponent(key)}`, { method: 'DELETE' });
}

/** Endereço da rota de dados, para o envio de última hora ao fechar a página (fetch keepalive) */
export const userDataUrl = (key: string) => `${API_URL}/users/me/storage/${encodeURIComponent(key)}`;

// --- Motivação (quadro-negro e porta-retrato da Evolução) ---

/** A frase vem do servidor; photoUrl, por enquanto, é a foto guardada no navegador (ver useMotivation) */
export interface Motivation { text: string; photoUrl: string | null; createdAt: string | null; updatedAt: string | null }

export async function getMotivation(): Promise<Motivation> {
  return request<Motivation>('/users/me/motivation');
}

/** Salva a frase. O backend também aceita photo (Supabase Storage), mas por enquanto a foto fica no navegador */
export async function saveMotivation(motivation: { text: string; photo?: string | null }): Promise<Motivation> {
  return request<Motivation>('/users/me/motivation', { method: 'PUT', body: JSON.stringify(motivation) });
}

/** Partes que o servidor sabe apagar separadamente (a conta fica) */
export type ResetScope = 'goals' | 'diary' | 'missions' | 'shop' | 'treasure' | 'motivation' | 'progress';

/** Apaga as partes escolhidas e zera o progresso quando "progress" está entre elas; a conta continua */
export async function resetPlayerData(scopes: ResetScope[]): Promise<Player> {
  return toPlayer(await request<Player>(`/users/me/data?scopes=${scopes.join(',')}`, { method: 'DELETE' }));
}

// --- Missões ---

// O backend não guarda "rewarded"; uma missão concluída já teve as recompensas creditadas
const toMission = (mission: ApiMission): Mission => ({
  id: mission.id, title: mission.title, description: mission.description,
  xp: mission.xpReward, coins: mission.coinsReward, completed: mission.completed, rewarded: mission.completed,
  completedAt: mission.completedAt ?? null,
});

export async function listMissions(): Promise<Mission[]> {
  return (await request<ApiMission[]>('/missions')).map(toMission);
}

export async function createMission(mission: NewMission): Promise<Mission> {
  const created = await request<ApiMission>('/missions', { method: 'POST', body: JSON.stringify({
    title: mission.title, ...(mission.description && { description: mission.description }), xpReward: mission.xp, coinsReward: mission.coins,
  }) });
  return toMission(created);
}

export async function updateMission(id: string, changes: Partial<NewMission & { completed: boolean }>): Promise<Mission> {
  const updated = await request<ApiMission>(`/missions/${id}`, { method: 'PATCH', body: JSON.stringify({
    ...(changes.title !== undefined && { title: changes.title }),
    ...(changes.description !== undefined && { description: changes.description }),
    ...(changes.xp !== undefined && { xpReward: changes.xp }),
    ...(changes.coins !== undefined && { coinsReward: changes.coins }),
    ...(changes.completed !== undefined && { completed: changes.completed }),
  }) });
  return toMission(updated);
}

export async function completeMission(id: string): Promise<{ mission: Mission; user: PlayerStats }> {
  const result = await request<{ mission: ApiMission; user: PlayerStats }>(`/missions/${id}/complete`, { method: 'PATCH' });
  return { mission: toMission(result.mission), user: result.user };
}

/** Desfaz uma missão cumprida: volta para o quadro e o servidor devolve o XP e as moedas */
export async function uncompleteMission(id: string): Promise<{ mission: Mission; user: PlayerStats }> {
  const result = await request<{ mission: ApiMission; user: PlayerStats }>(`/missions/${id}/uncomplete`, { method: 'PATCH' });
  return { mission: toMission(result.mission), user: result.user };
}

export async function deleteMission(id: string): Promise<void> {
  await request<{ message: string }>(`/missions/${id}`, { method: 'DELETE' });
}

// --- Recompensas ---

const toReward = (reward: ApiReward): Reward => ({ id: reward.id, name: reward.title, description: reward.description ?? undefined, price: reward.price, icon: 'book', fixed: Boolean(reward.key) });

export async function listRewards(): Promise<Reward[]> {
  return (await request<ApiReward[]>('/rewards')).filter(reward=>reward.available).map(toReward);
}

export async function createReward(title: string, price: number): Promise<Reward> {
  return toReward(await request<ApiReward>('/rewards', { method: 'POST', body: JSON.stringify({ title, price }) }));
}

/** Tira da vitrine (o backend não apaga recompensas, só marca como indisponível) */
export async function hideReward(id: string): Promise<void> {
  await request<ApiReward>(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify({ available: false }) });
}

export async function claimReward(id: string): Promise<{ remainingCoins: number; purchase: Purchase }> {
  const result = await request<{ user: { remainingCoins: number }; purchase: ApiPurchase }>(`/rewards/${encodeURIComponent(id)}/claim`, { method: 'POST' });
  return { ...result.user, purchase: toPurchase(result.purchase) };
}

export async function listPurchases(): Promise<Purchase[]> {
  return (await request<ApiPurchase[]>('/purchases')).map(toPurchase);
}

export async function setPurchaseUsed(id: string, used: boolean): Promise<Purchase> {
  return toPurchase(await request<ApiPurchase>(`/purchases/${id}`, { method: 'PATCH', body: JSON.stringify({ used }) }));
}

export async function updateReward(id: string, changes: { title: string; price: number; description: string }): Promise<Reward> {
  return toReward(await request<ApiReward>(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }));
}

export async function deleteReward(id: string): Promise<void> {
  await request<void>(`/rewards/${id}`, { method: 'DELETE' });
}
