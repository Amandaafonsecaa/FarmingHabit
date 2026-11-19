import { PixelSpinner } from '../PixelSpinner';
import type { CheckinsStatus } from '../../lib/checkins';

/** Carregando / erro das listas de metas enquanto o histórico não chega do servidor (pronto: não desenha nada) */
export function GoalsSyncState({ status, onRetry }: { status: CheckinsStatus; onRetry: () => void }) {
  if (status === 'loading') return <PixelSpinner label="Carregando metas"/>;
  if (status === 'error') return <div>
    <p role="alert" className="text-sm font-bold text-[#8c3027]">Não deu para carregar suas metas.</p>
    <button type="button" className="pixel-button mt-2" onClick={onRetry}>Tentar de novo</button>
  </div>;
  return null;
}
