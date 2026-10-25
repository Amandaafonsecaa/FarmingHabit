import type { DiaryEntry } from '../../lib/diary';
import { WEEKDAY_NAMES, WEEK_ORDER, toKey } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { MoodIcon, StickerIcon } from './DiaryIcons';

/** "Estações do humor": o mês inteiro com o clima de cada dia; clicar abre aquela página do diário */
export function MoodCalendar({ month, entries, selectedKey, todayKey, onSelect, onMonth }: {
  month: Date; entries: Record<string, DiaryEntry>; selectedKey: string; todayKey: string; onSelect: (date: Date) => void; onMonth: (delta: number) => void;
}) {
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const isCurrentMonth = toKey(month).slice(0, 7) === todayKey.slice(0, 7);
  return <section className="world-panel pixel-frame mood-calendar" aria-labelledby="mood-heading">
    <header className="panel-heading"><h2 id="mood-heading"><PixelIcon name="sun" className="size-5"/>Estações do humor</h2></header>
    <div className="panel-content pb-3">
      <div className="calendar-toolbar">
        <button type="button" className="pixel-button" aria-label="Mês anterior" onClick={()=>onMonth(-1)}>◀</button>
        <p className="calendar-month-name">{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month)}</p>
        <button type="button" className="pixel-button" aria-label="Próximo mês" disabled={isCurrentMonth} onClick={()=>onMonth(1)}>▶</button>
      </div>
      <div className="mood-grid">
        {WEEK_ORDER.map(day => <span key={day} className="harvest-weekday" aria-hidden="true">{WEEKDAY_NAMES[day]}</span>)}
        {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} aria-hidden="true"/>)}
        {Array.from({ length: days }, (_, index) => {
          const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
          const key = toKey(date);
          const entry = entries[key];
          return <button key={key} type="button" className={`mood-day ${key === selectedKey ? 'is-selected' : ''} ${key === todayKey ? 'is-today' : ''}`}
            disabled={key > todayKey} onClick={()=>onSelect(date)} title={entry?.gratitude || undefined} aria-label={`Dia ${index + 1}${entry?.mood ? `: ${entry.mood}` : ''}`}
            style={{ animationDelay: `${index * 14}ms` }}>
            <span className="day-number">{index + 1}</span>
            {entry?.mood ? <MoodIcon mood={entry.mood} className="size-[60%]"/> : entry?.sticker ? <StickerIcon sticker={entry.sticker} className="size-[55%]"/> : entry && (entry.note || entry.gratitude) ? <span className="ink-dot"/> : null}
          </button>;
        })}
      </div>
    </div>
  </section>;
}
