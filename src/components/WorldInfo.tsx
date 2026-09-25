import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { PixelIcon } from './PixelIcon';

export function WorldInfo({ level, xp, maxXp, farmName }: {
  level: number; xp: number; maxXp: number; farmName: string;
}) {
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const updateDate = () => setToday(new Date());
    const timer = window.setInterval(updateDate, 60000);
    window.addEventListener('focus', updateDate);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', updateDate); };
  }, []);
  const dateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(today);
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(today);

  return <div className="world-info" aria-label="Informações do seu sítio">
    <section className="level-card pixel-frame" aria-labelledby="level-heading">
      <h2 id="level-heading" className="text-lg font-bold">Nível {level}</h2>
      <ProgressBar value={xp / maxXp * 100} label="Experiência do nível" className="mt-3 h-2.5"/>
      <p className="mt-2 text-right text-sm font-bold" aria-live="polite">{xp} / {maxXp} XP</p>
    </section>
    <div className="farm-name-card pixel-frame"><PixelIcon name="leaf" className="size-4 shrink-0 text-olive"/><span>{farmName}</span></div>
    <section className="calendar-card pixel-frame" aria-labelledby="calendar-heading">
      <h2 id="calendar-heading" className="calendar-heading">Hoje</h2>
      <time dateTime={dateTime} className="calendar-date">
        <span className="calendar-day">{today.getDate()}</span>
        <span className="calendar-month">de {month}</span>
        <span className="calendar-weekday">{weekday}</span>
      </time>
    </section>
  </div>;
}
