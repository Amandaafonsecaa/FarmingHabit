import { useEffect, useState } from 'react';
import { PROFILE_EVENT, readProfile, saveProfile, type Profile } from '../lib/profile';

/** Lê o perfil (personagem, frase, cadastro feito) e atualiza quando muda em qualquer lugar */
export function useProfile() {
  const [profile, setProfile] = useState(readProfile);
  useEffect(() => {
    const refresh = () => setProfile(readProfile());
    window.addEventListener(PROFILE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(PROFILE_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const update = (patch: Partial<Profile>) => saveProfile({ ...readProfile(), ...patch });
  return [profile, update] as const;
}
