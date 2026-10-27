import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthScreen } from './components/auth/AuthScreen';
import { currentAccessToken } from './lib/auth';
import { supabase } from './lib/supabase';
import { applySettings, readSettings } from './lib/settings';
import { startCloudSync } from './lib/cloudSync';
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

// Com sessão: traz do servidor os dados da conta antes do primeiro desenho, depois aplica as preferências e desenha o app.
// Sem sessão: mostra a entrada. Ao entrar, a tela recarrega e cai no caminho com sessão.
async function boot() {
  const signedIn = (await currentAccessToken()) !== null;
  if (signedIn) await startCloudSync();
  applySettings(readSettings());
  createRoot(document.getElementById('root')!).render(<StrictMode>{signedIn ? <App/> : <AuthScreen/>}</StrictMode>);
}

void boot();
