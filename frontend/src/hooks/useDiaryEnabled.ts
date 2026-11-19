import { useEffect, useState } from 'react';
import { useStorageChange } from './useStorageChange';
import { GOALS_EVENT, readDiaryPage } from '../lib/diaryGoal';
import { SETTINGS_EVENT, SETTINGS_KEY } from '../lib/settings';

const GOALS_KEY = 'farminghabit.goals.v1';

/** A aba do Diário está ligada? (navegação, rotas, Configurações). Metas entram só na dedução das contas antigas */
export function useDiaryEnabled() {
  const [on, setOn] = useState(readDiaryPage);
  const refresh = () => setOn(readDiaryPage());
  useStorageChange(SETTINGS_KEY, refresh);
  useStorageChange(GOALS_KEY, refresh);
  useEffect(() => {
    window.addEventListener(SETTINGS_EVENT, refresh);
    window.addEventListener(GOALS_EVENT, refresh);
    // Confere de novo ao se inscrever: um aviso disparado entre o desenho e este efeito não se perde
    refresh();
    return () => { window.removeEventListener(SETTINGS_EVENT, refresh); window.removeEventListener(GOALS_EVENT, refresh); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return on;
}
