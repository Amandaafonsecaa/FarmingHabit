import type { CSSProperties } from 'react';
import type { Achievement } from '../../lib/evolution';
import { PixelIcon } from '../PixelIcon';

/** Medalhas pixeladas: douradas e brilhando quando conquistadas, apagadas com progresso quando não */
export function AchievementsPanel({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter(item => item.current >= item.goal).length;
  return <section className="world-panel pixel-frame achievements-panel" aria-labelledby="achievements-heading">
    <header className="panel-heading"><h2 id="achievements-heading"><PixelIcon name="sun" className="size-5"/>Conquistas</h2><span className="panel-tag">{unlocked}/{achievements.length}</span></header>
    <ul className="achievement-grid">{achievements.map((item, index) => {
      const done = item.current >= item.goal;
      return <li key={item.id} className={`achievement ${done ? 'is-unlocked' : ''}`} style={{ animationDelay: `${index * 50}ms`, '--shine-delay': `${(index % 5) * 0.6}s` } as CSSProperties}>
        <span className="medal" aria-hidden="true"><PixelIcon name={item.icon} className="size-5"/></span>
        <h3>{item.title}</h3>
        <p>{item.text}</p>
        {done ? <span className="achievement-state">Conquistada!</span> : <span className="achievement-state is-progress">{Math.min(item.current, item.goal)}/{item.goal}</span>}
      </li>;
    })}</ul>
  </section>;
}
