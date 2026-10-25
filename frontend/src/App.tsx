import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { GoalsPage } from './pages/GoalsPage';
import { MissionsPage } from './pages/MissionsPage';
import { DiaryPage } from './pages/DiaryPage';
import type { AppPage } from './types/navigation';

// Navegação simples por hash (#metas, #missoes); outros hashes (ex.: o link "Pular para o conteúdo") não trocam de página
const HASHES: Record<AppPage, string> = { home: '', goals: '#metas', missions: '#missoes', diary: '#diario' };
const pageFromHash = (): AppPage => (Object.keys(HASHES) as AppPage[]).find(page => HASHES[page] === window.location.hash) ?? 'home';

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onPop = () => { if (Object.values(HASHES).includes(window.location.hash)) setPage(pageFromHash()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigate(next: AppPage) {
    window.history.pushState(null, '', HASHES[next] || window.location.pathname + window.location.search);
    setPage(next);
    window.scrollTo(0, 0);
  }

  if (page === 'goals') return <GoalsPage onNavigate={navigate}/>;
  if (page === 'missions') return <MissionsPage onNavigate={navigate}/>;
  if (page === 'diary') return <DiaryPage onNavigate={navigate}/>;
  return <HomePage onNavigate={navigate}/>;
}
