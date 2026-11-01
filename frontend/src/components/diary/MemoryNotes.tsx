import type { CSSProperties } from 'react';
import { hasContent, type DiaryEntry } from '../../lib/diary';
import { PanelHeading, useCollapsible } from '../PanelHeading';
import { MoodIcon, StickerIcon } from './DiaryIcons';

const COLORS = ['#fff1a8', '#ffd6e0', '#d8f0c0', '#d6ecff'];
const TILTS = [-2, 1.5, -1, 2.2];
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

/** Bilhetinhos colados com fita: as últimas páginas escritas */
export function MemoryNotes({ entries, onOpen }: { entries: Record<string, DiaryEntry>; onOpen: (key: string) => void }) {
  const recent = Object.keys(entries).filter(key => hasContent(entries[key])).sort().reverse().slice(0, 6);
  const card = useCollapsible();
  return <section className={`world-panel pixel-frame memory-panel ${card.collapsedClass}`} aria-labelledby="memory-heading">
    <PanelHeading id="memory-heading" icon="book" title="Memórias" open={card.open} onToggle={card.toggle}><span className="panel-tag">últimas páginas</span></PanelHeading>
    <div className="memory-board">
      {recent.length === 0 ? <p className="summary-empty">Suas memórias vão aparecer aqui, coladinhas.</p>
        : <ul className="memory-list">{recent.map((key, index) => {
          const entry = entries[key];
          const [year, month, day] = key.split('-').map(Number);
          const text = entry.gratitude || entry.note;
          return <li key={key} style={{ '--note': COLORS[index % COLORS.length], '--tilt': `${TILTS[index % TILTS.length]}deg`, animationDelay: `${index * 80}ms` } as CSSProperties}>
            <button type="button" className="memory-note" onClick={()=>onOpen(key)}>
              <span className="memory-tape" aria-hidden="true"/>
              <span className="memory-head"><strong>{shortDate.format(new Date(year, month - 1, day))}</strong>
                <span className="flex gap-1">{entry.mood && <MoodIcon mood={entry.mood} className="size-5"/>}{entry.sticker && <StickerIcon sticker={entry.sticker} className="size-5"/>}</span></span>
              {text && <span className="memory-text">{text.length > 90 ? `${text.slice(0, 89)}…` : text}</span>}
            </button>
          </li>;
        })}</ul>}
    </div>
  </section>;
}
