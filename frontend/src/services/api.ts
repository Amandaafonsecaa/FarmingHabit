import type { Mission, Reward } from '../types/world';
import type { Purchase } from '../lib/shop';
import { toKey } from '../lib/goalLogic';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const USER_ID = import.meta.env.VITE_USER_ID || undefined;

export interface Player { id: string; name: string; level: number; xp: number; coins: number; email?: string; createdAt?: string }
interface ApiMission { id: string; title: string; description: string; xpReward: number; coinsReward: number; completed: boolean; userId: string | null }
interface ApiReward { id: string; title: string; description: string | null; key: string | null; price: number; available: boolean; userId: string | null }
interface ApiPurchase { id: string; rewardId: string | null; title: string; price: number; createdAt: string; used: boolean; usedAt: string | null }
const toPurchase = (item: ApiPurchase): Purchase => ({ id: item.id, rewardId: item.rewardId ?? '', title: item.title, price: item.price, date: toKey(new Date(item.createdAt)), used: item.used, usedAt: item.usedAt });
type PlayerStats = Pick<Player, 'id' | 'level' | 'xp' | 'coins'>;
export interface NewMission { title: string; description: string; xp: number; coins: number }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
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

const userQuery = (userId: string) => `?userId=${encodeURIComponent(userId)}`;

// --- Usuário ---

const toPlayer = ({ id, name, level, xp, coins, email, createdAt }: Player): Player => ({ id, name, level, xp, coins, email, createdAt });

// Sem login ainda: usa VITE_USER_ID, senão o usuário mais recente do banco, senão cria um
export async function loadPlayer(): Promise<Player> {
  if (USER_ID) return toPlayer(await request<Player>(`/users/${USER_ID}`));
  const users = await request<Player[]>('/users');
  if (users.length > 0) return toPlayer(users[0]);
  return toPlayer(await request<Player>('/users', { method: 'POST', body: JSON.stringify({ name: 'Amanda', email: 'amanda@farminghabit.local' }) }));
}

/** Credita moedas e XP (baús e metas cumpridas), com a mesma regra de nível do backend: a cada 100 XP, +1 nível */
export async function grantRewards(player: Player, coins: number, xp: number): Promise<Player> {
  const totalXp = player.xp + xp;
  return toPlayer(await request<Player>(`/users/${player.id}`, { method: 'PATCH', body: JSON.stringify({ coins: player.coins + coins, xp: totalXp, level: Math.floor(totalXp / 100) + 1 }) }));
}

/** Renomeia o jogador (PATCH /users/:id) */
export async function updatePlayerName(id: string, name: string): Promise<Player> {
  return toPlayer(await request<Player>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }));
}

/** Apaga missões, compras e recompensas próprias e zera nível, XP e moedas; a conta continua */
export async function resetPlayerData(id: string): Promise<Player> {
  return toPlayer(await request<Player>(`/users/${id}/data`, { method: 'DELETE' }));
}

// --- Missões ---

// O backend não guarda "rewarded"; uma missão concluída já teve as recompensas creditadas
const toMission = (mission: ApiMission): Mission => ({
  id: mission.id, title: mission.title, description: mission.description,
  xp: mission.xpReward, coins: mission.coinsReward, completed: mission.completed, rewarded: mission.completed,
});

export async function listMissions(userId: string): Promise<Mission[]> {
  return (await request<ApiMission[]>(`/missions${userQuery(userId)}`)).map(toMission);
}

export async function createMission(userId: string, mission: NewMission): Promise<Mission> {
  const created = await request<ApiMission>('/missions', { method: 'POST', body: JSON.stringify({
    title: mission.title, ...(mission.description && { description: mission.description }), xpReward: mission.xp, coinsReward: mission.coins, userId,
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

export async function completeMission(id: string, userId: string): Promise<{ mission: Mission; user: PlayerStats }> {
  const result = await request<{ mission: ApiMission; user: PlayerStats }>(`/missions/${id}/complete${userQuery(userId)}`, { method: 'PATCH' });
  return { mission: toMission(result.mission), user: result.user };
}

/** Desfaz uma missão cumprida: volta para o quadro e o servidor devolve o XP e as moedas */
export async function uncompleteMission(id: string, userId: string): Promise<{ mission: Mission; user: PlayerStats }> {
  const result = await request<{ mission: ApiMission; user: PlayerStats }>(`/missions/${id}/uncomplete${userQuery(userId)}`, { method: 'PATCH' });
  return { mission: toMission(result.mission), user: result.user };
}

export async function deleteMission(id: string): Promise<void> {
  await request<{ message: string }>(`/missions/${id}`, { method: 'DELETE' });
}

// --- Recompensas ---

const toReward = (reward: ApiReward): Reward => ({ id: reward.id, name: reward.title, description: reward.description ?? undefined, price: reward.price, icon: 'book', fixed: Boolean(reward.key) });

export async function listRewards(userId: string): Promise<Reward[]> {
  return (await request<ApiReward[]>(`/rewards${userQuery(userId)}`)).filter(reward=>reward.available).map(toReward);
}

export async function createReward(userId: string, title: string, price: number): Promise<Reward> {
  return toReward(await request<ApiReward>('/rewards', { method: 'POST', body: JSON.stringify({ title, price, userId }) }));
}

/** Tira da vitrine (o backend não apaga recompensas, só marca como indisponível) */
export async function hideReward(id: string, userId: string): Promise<void> {
  await request<ApiReward>(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify({ available: false, userId }) });
}

export async function claimReward(id: string, userId: string): Promise<{ remainingCoins: number; purchase: Purchase }> {
  const result = await request<{ user: { remainingCoins: number }; purchase: ApiPurchase }>(`/rewards/${encodeURIComponent(id)}/claim${userQuery(userId)}`, { method: 'POST' });
  return { ...result.user, purchase: toPurchase(result.purchase) };
}

export async function listPurchases(userId: string): Promise<Purchase[]> {
  return (await request<ApiPurchase[]>(`/purchases${userQuery(userId)}`)).map(toPurchase);
}

export async function setPurchaseUsed(id: string, userId: string, used: boolean): Promise<Purchase> {
  return toPurchase(await request<ApiPurchase>(`/purchases/${id}${userQuery(userId)}`, { method: 'PATCH', body: JSON.stringify({ used }) }));
}

export async function updateReward(id: string, userId: string, changes: { title: string; price: number; description: string }): Promise<Reward> {
  return toReward(await request<ApiReward>(`/rewards/${id}`, { method: 'PATCH', body: JSON.stringify({ ...changes, userId }) }));
}
export async function deleteReward(id: string, userId: string): Promise<void> {
  await request<void>(`/rewards/${id}${userQuery(userId)}`, { method: 'DELETE' });
}
