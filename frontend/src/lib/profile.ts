import { DEFAULT_AVATAR, type AvatarConfig } from './avatar';

/** Perfil do jogador guardado neste navegador (sincronizado com a conta) */
export interface Profile { avatar: AvatarConfig; bio: string; onboarded: boolean }

export const PROFILE_KEY = 'farminghabit.profile.v1';
export const PROFILE_EVENT = 'farminghabit:profile';
const DEFAULTS: Profile = { avatar: DEFAULT_AVATAR, bio: '', onboarded: false };

export function readProfile(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '{}');
    return { ...DEFAULTS, ...saved, avatar: { ...DEFAULT_AVATAR, ...saved.avatar } };
  } catch { return DEFAULTS; }
}

export function saveProfile(profile: Profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* modo privado: vale só nesta sessão */ }
  window.dispatchEvent(new Event(PROFILE_EVENT));
}
