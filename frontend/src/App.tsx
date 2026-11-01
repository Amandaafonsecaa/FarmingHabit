import { useEffect, useState, type ReactElement } from 'react';
import { HomePage } from './pages/HomePage';
import { GoalsPage } from './pages/GoalsPage';
import { MissionsPage } from './pages/MissionsPage';
import { DiaryPage } from './pages/DiaryPage';
import { EvolutionPage } from './pages/EvolutionPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShopPage } from './pages/ShopPage';
import { WelcomeWizard } from './components/profile/WelcomeWizard';
import { useProfile } from './hooks/useProfile';
import { useDiaryEnabled } from './hooks/useDiaryEnabled';
import type { AppPage } from './types/navigation';

// Navegação simples por hash (#metas, #missoes); outros hashes (ex.: o link "Pular para o conteúdo") não trocam de página
const HASHES: Record<AppPage, string> = { home: '', goals: '#metas', missions: '#missoes', diary: '#diario', evolution: '#evolucao', settings: '#configuracoes', shop: '#loja' };
const pageFromHash = (): AppPage => (Object.keys(HASHES) as AppPage[]).find(page => HASHES[page] === window.location.hash) ?? 'home';

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [profile] = useProfile();
  const diaryOn = useDiaryEnabled();
  useEffect(() => {
    const onPop = () => { if (Object.values(HASHES).includes(window.location.hash)) setPage(pageFromHash()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Diário desligado: #diario (link salvo, voltar do navegador) cai na Casa sem empilhar histórico
  useEffect(() => {
    if (page !== 'diary' || diaryOn) return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setPage('home');
  }, [page, diaryOn]);

  function navigate(next: AppPage) {
    window.history.pushState(null, '', HASHES[next] || window.location.pathname + window.location.search);
    setPage(next);
    window.scrollTo(0, 0);
  }

  const pages: Record<AppPage, ReactElement> = {
    home: <HomePage onNavigate={navigate}/>, goals: <GoalsPage onNavigate={navigate}/>, missions: <MissionsPage onNavigate={navigate}/>,
    diary: <DiaryPage onNavigate={navigate}/>, evolution: <EvolutionPage onNavigate={navigate}/>, settings: <SettingsPage onNavigate={navigate}/>, shop: <ShopPage onNavigate={navigate}/>,
  };
  // Primeira visita: criação do personagem por cima da página
  return <>{pages[page]}{!profile.onboarded && <WelcomeWizard/>}</>;
}
