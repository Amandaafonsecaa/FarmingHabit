import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
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
// Traz do servidor os dados da pessoa (metas, diário, preferências...) antes do primeiro desenho;
// depois aplica modo calmo, celebrações e bichinhos e desenha o app
void startCloudSync().finally(() => {
  applySettings(readSettings());
  createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
});
