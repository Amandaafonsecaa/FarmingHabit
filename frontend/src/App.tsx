import { useEffect, useState } from 'react';
import { HomePage } from './pages/HomePage';
import { GoalsPage } from './pages/GoalsPage';
import type { AppPage } from './types/navigation';

// Navegação simples por hash (#metas); outros hashes (ex.: o link "Pular para o conteúdo") não trocam de página
const pageFromHash = (): AppPage => window.location.hash === '#metas' ? 'goals' : 'home';

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  useEffect(() => {
    const onPop = () => { if (window.location.hash === '#metas' || window.location.hash === '') setPage(pageFromHash()); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigate(next: AppPage) {
    window.history.pushState(null, '', next === 'goals' ? '#metas' : window.location.pathname + window.location.search);
    setPage(next);
    window.scrollTo(0, 0);
  }

  return page === 'goals' ? <GoalsPage onNavigate={navigate}/> : <HomePage onNavigate={navigate}/>;
}
