import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthScreen } from './components/auth/AuthScreen';
import { BootSplash } from './components/auth/BootSplash';
import { currentAccessToken } from './lib/auth';
import { supabase } from './lib/supabase';
import { SETTINGS_KEY, applySettings, readSettings } from './lib/settings';
import { hasLocalSnapshot, startCloudSync } from './lib/cloudSync';
import './styles/global.css';
import './styles/goals.css';
import './styles/home.css';
import './styles/scene.css';
import './styles/missions.css';
import './styles/diary.css';
import './styles/evolution.css';
import './styles/settings.css';
import './styles/profile.css';
import './styles/shop.css';
import './styles/nav.css';
import './styles/auth.css';

// Ao sair (ou quando a sessão deixa de valer), o navegador esquece os dados da conta anterior e volta para a entrada
supabase?.auth.onAuthStateChange(event => {
  if (event !== 'SIGNED_OUT') return;
  try { localStorage.clear(); } catch { /* sem armazenamento: nada a limpar */ }
  window.location.reload();
});

// Preferências que chegam da conta (ou de outra aba) valem na hora: modo calmo, celebrações, bichinhos
window.addEventListener('storage', event => { if (event.key === SETTINGS_KEY || event.key === null) applySettings(readSettings()); });

// Sem sessão: mostra a entrada (ao entrar, a tela recarrega e cai no caminho com sessão).
// Com sessão: o sítio abre na hora com os dados deste navegador e a conta sincroniza em segundo plano.
// Só no primeiro acesso da conta neste navegador (nada guardado ainda) a porteira espera os dados chegarem.
async function boot() {
  const root = createRoot(document.getElementById('root')!);
  const signedIn = (await currentAccessToken()) !== null;
  if (!signedIn) {
    applySettings(readSettings());
    root.render(<StrictMode><AuthScreen/></StrictMode>);
    return;
  }
  const firstOpen = !hasLocalSnapshot();
  const sync = startCloudSync();
  if (firstOpen) {
    root.render(<StrictMode><BootSplash/></StrictMode>);
    await sync;
  }
  applySettings(readSettings());
  root.render(<StrictMode><App/></StrictMode>);
}

void boot();
