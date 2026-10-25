import { MOODS, STICKERS, type DiaryEntry } from '../../lib/diary';
import { PixelIcon } from '../PixelIcon';
import { MoodIcon, StickerIcon } from './DiaryIcons';

const QUOTES = ['Devagar também é caminho.', 'Regar um pouco todo dia faz a flor crescer.', 'Dias nublados também fazem a horta crescer.',
  'Você não precisa florescer o tempo todo.', 'Pequenas colheitas, grandes estações.', 'Respire. O sítio espera por você.', 'Toda curiosidade é uma semente.'];

interface DiaryBookProps {
  dateKey: string; date: Date; entry: DiaryEntry; turn: 'next' | 'prev' | null; canNext: boolean;
  harvests: { title: string; done: boolean }[]; adventures: string[];
  onChange: (patch: Partial<DiaryEntry>) => void; onPrev: () => void; onNext: () => void;
}

/** Diário aberto: página da esquerda para escrever, da direita com o resumo do dia. Vira a página ao trocar de dia. */
export function DiaryBook({ dateKey, date, entry, turn, canNext, harvests, adventures, onChange, onPrev, onNext }: DiaryBookProps) {
  const title = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
  const quote = QUOTES[(date.getDate() + date.getMonth()) % QUOTES.length];
  return <section className="diary-book" aria-labelledby="book-heading">
    <span className="book-ribbon" aria-hidden="true"/>
    {/* key por dia: remonta a página e dispara a animação de virar */}
    <div key={dateKey} className={`book-spread ${turn ? `is-turning-${turn}` : ''}`}>
      {turn && <span className={`page-turner is-${turn}`} aria-hidden="true"/>}
      <div className="book-page is-left">
        <header className="page-date">
          <button type="button" className="page-arrow" onClick={onPrev} aria-label="Dia anterior">◀</button>
          <h2 id="book-heading">{title}</h2>
          <button type="button" className="page-arrow" onClick={onNext} disabled={!canNext} aria-label="Próximo dia">▶</button>
        </header>

        <fieldset className="diary-field"><legend>Como está o tempo aí dentro?</legend>
          <div className="mood-picker">{MOODS.map(mood => <button key={mood.id} type="button" className="mood-option" aria-pressed={entry.mood === mood.id}
            onClick={()=>onChange({ mood: entry.mood === mood.id ? undefined : mood.id })}><MoodIcon mood={mood.id} className="size-7"/><span>{mood.label}</span></button>)}</div>
        </fieldset>

        <label className="diary-field" htmlFor="diary-gratitude"><span className="diary-label">Hoje eu agradeço por…</span>
          <input id="diary-gratitude" className="diary-line" maxLength={120} value={entry.gratitude} onChange={event=>onChange({ gratitude: event.target.value })} placeholder="um café quentinho, uma conversa boa…"/>
        </label>
        <label className="diary-field" htmlFor="diary-note"><span className="diary-label">Querido diário…</span>
          <textarea id="diary-note" className="diary-lines" rows={7} maxLength={1200} value={entry.note} onChange={event=>onChange({ note: event.target.value })} placeholder="O que aconteceu hoje? O que você descobriu?"/>
        </label>

        <fieldset className="diary-field"><legend>Adesivo do dia</legend>
          <div className="sticker-picker">{STICKERS.map(sticker => <button key={sticker.id} type="button" className="sticker-option" aria-pressed={entry.sticker === sticker.id}
            aria-label={sticker.label} title={sticker.label} onClick={()=>onChange({ sticker: entry.sticker === sticker.id ? undefined : sticker.id })}><StickerIcon sticker={sticker.id} className="size-7"/></button>)}</div>
        </fieldset>
        <p className="save-hint"><span className="ink-drop" aria-hidden="true"/>Salvo automaticamente neste navegador</p>
      </div>

      <div className="book-page is-right">
        <h3 className="page-heading">Resumo do dia</h3>
        <div className="day-summary">
          <h4><PixelIcon name="leaf" className="size-3"/>Colheitas</h4>
          {harvests.length ? <ul>{harvests.map(item => <li key={item.title} className={item.done ? 'is-done' : ''}>{item.done ? '✓' : '◐'} {item.title}</li>)}</ul> : <p className="summary-empty">Nenhuma colheita neste dia.</p>}
          <h4><PixelIcon name="mission" className="size-3"/>Aventuras</h4>
          {adventures.length ? <ul>{adventures.map((item, index) => <li key={`${item}-${index}`} className="is-adventure">✦ {item}</li>)}</ul> : <p className="summary-empty">Nenhuma aventura cumprida neste dia.</p>}
        </div>
        {entry.sticker && <span key={entry.sticker} className="big-sticker" aria-hidden="true"><StickerIcon sticker={entry.sticker} className="size-full"/></span>}
        <p className="page-quote">“{quote}”</p>
        <svg className="pressed-flower" viewBox="0 0 24 32" shapeRendering="crispEdges" aria-hidden="true"><path d="M11 12h2v20h-2Z" fill="#6d8a4a"/><path d="M13 20h5v2h-5Zm-7 4h5v2H6Z" fill="#8aa860"/><path d="M8 2h8v3h3v6h-3v3H8v-3H5V5h3Z" fill="#d98aa0"/><path d="M10 6h4v4h-4Z" fill="#f2c453"/></svg>
      </div>
    </div>
  </section>;
}
