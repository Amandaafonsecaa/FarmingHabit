/** Opções do criador de personagem. Os índices apontam para as paletas abaixo. */
export type HairStyle = 'long' | 'short' | 'braids' | 'curly' | 'bun';
export type Outfit = 'overalls' | 'dress' | 'shirt';
export type Hat = 'straw' | 'cap' | 'flowers' | 'none';
export type Detail = 'none' | 'glasses' | 'freckles' | 'blush';
export interface AvatarConfig { skin: number; hairStyle: HairStyle; hairColor: number; outfit: Outfit; outfitColor: number; hat: Hat; detail: Detail }

export const SKINS = [
  { face: '#f6d3b3', arm: '#efc29c' }, { face: '#efc5a1', arm: '#e9b894' }, { face: '#d9a274', arm: '#cf9566' },
  { face: '#b07448', arm: '#a46a40' }, { face: '#7a4a2c', arm: '#6e4227' },
];
export const HAIR_COLORS = ['#513524', '#2b1d16', '#8a5838', '#d9a441', '#c2562e', '#e3dbd0', '#d67aa0'];
export const OUTFIT_COLORS = [
  { main: '#648244', dark: '#3f6b35' }, { main: '#5f86b8', dark: '#3d5f8f' }, { main: '#bf5837', dark: '#8c3a22' },
  { main: '#9b7fd4', dark: '#6f56a8' }, { main: '#e8ac59', dark: '#b07a2e' }, { main: '#4a4a5a', dark: '#2e2e3a' },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'long', label: 'Longo' }, { id: 'short', label: 'Curtinho' }, { id: 'braids', label: 'Tranças' }, { id: 'curly', label: 'Cacheado' }, { id: 'bun', label: 'Coque' },
];
export const OUTFITS: { id: Outfit; label: string }[] = [{ id: 'overalls', label: 'Jardineira' }, { id: 'dress', label: 'Vestido' }, { id: 'shirt', label: 'Camiseta e jeans' }];
export const HATS: { id: Hat; label: string }[] = [{ id: 'straw', label: 'Chapéu de palha' }, { id: 'cap', label: 'Boné' }, { id: 'flowers', label: 'Coroa de flores' }, { id: 'none', label: 'Sem chapéu' }];
export const DETAILS: { id: Detail; label: string }[] = [{ id: 'none', label: 'Nenhum' }, { id: 'glasses', label: 'Óculos' }, { id: 'freckles', label: 'Sardas' }, { id: 'blush', label: 'Bochechas' }];

/** A personagem original do sítio */
export const DEFAULT_AVATAR: AvatarConfig = { skin: 1, hairStyle: 'long', hairColor: 0, outfit: 'overalls', outfitColor: 0, hat: 'straw', detail: 'none' };

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
export function randomAvatar(): AvatarConfig {
  return {
    skin: Math.floor(Math.random() * SKINS.length), hairStyle: pick(HAIR_STYLES).id, hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
    outfit: pick(OUTFITS).id, outfitColor: Math.floor(Math.random() * OUTFIT_COLORS.length), hat: pick(HATS).id, detail: pick(DETAILS).id,
  };
}

/** Cores principais do personagem, para sprites pequenos (ex.: a exploradora do mapa) */
export function avatarColors(avatar: AvatarConfig) {
  const outfit = OUTFIT_COLORS[avatar.outfitColor] ?? OUTFIT_COLORS[0];
  const hair = HAIR_COLORS[avatar.hairColor] ?? HAIR_COLORS[0];
  const hat = avatar.hat === 'straw' ? '#e7b84b' : avatar.hat === 'cap' ? outfit.dark : avatar.hat === 'flowers' ? '#ee6996' : hair;
  return { skin: (SKINS[avatar.skin] ?? SKINS[1]).face, hair, outfit: outfit.main, hat };
}
