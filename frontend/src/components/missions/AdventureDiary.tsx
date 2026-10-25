import type { Mission } from '../../types/world';
import { rankOf } from '../../hooks/useMissionBoard';
import { PixelIcon } from '../PixelIcon';

/** Caderno com as missões cumpridas, cada uma lacrada com selo de cera; a mais recente é "escrita" na hora */
export function AdventureDiary({ entries, freshId }: { entries: Mission[]; freshId: string | null }) {
  return <section className="world-panel pixel-frame adventure-diary" aria-labelledby="diary-heading">
    <header className="panel-heading"><h2 id="diary-heading"><PixelIcon name="book" className="size-5"/>Diário de descobertas</h2><span className="panel-tag">{entries.length} cumpridas</span></header>
    <div className="diary-page">
      {entries.length === 0
        ? <p className="diary-empty">As páginas esperam a sua primeira descoberta…</p>
        : <ol className="diary-list">{entries.map(mission => <li key={mission.id} className={`diary-entry ${mission.id === freshId ? 'is-fresh' : ''}`}>
            <span className="wax-seal" aria-hidden="true"/>
            <div className="min-w-0">
              <h3 className="diary-title">{mission.title}</h3>
              {mission.description && <p className="diary-text">{mission.description}</p>}
              <p className="diary-reward">{'★'.repeat(rankOf(mission).stars)} · +{mission.xp} XP · +{mission.coins} moedas</p>
            </div>
          </li>)}</ol>}
    </div>
  </section>;
}
