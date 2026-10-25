import { useEffect, useState } from 'react';
import { SETTINGS_EVENT, readSettings, saveSettings, type Settings } from '../lib/settings';

/** Lê as preferências e atualiza quando mudam (nesta aba ou em outra janela) */
export function useSettings() {
  const [settings, setSettings] = useState(readSettings);
  useEffect(() => {
    const refresh = () => setSettings(readSettings());
    window.addEventListener(SETTINGS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(SETTINGS_EVENT, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const update = (patch: Partial<Settings>) => saveSettings({ ...readSettings(), ...patch });
  return [settings, update] as const;
}
