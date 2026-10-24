import { PixelIcon } from './PixelIcon';
import { LevelCard } from './home/LevelCard';

export function WorldInfo({ level, totalXp, xpPerLevel, farmName, today }: {
  level: number | null; totalXp: number | null; xpPerLevel: number; farmName: string; today: Date;
}) {
  const dateTime = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(today);
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(today);

  return <div className="world-info" aria-label="Informações do seu sítio">
    <LevelCard level={level} totalXp={totalXp} xpPerLevel={xpPerLevel}/>
    <div className="farm-name-card pixel-frame"><PixelIcon name="leaf" className="farm-leaf size-4 shrink-0 text-olive"/><span>{farmName}</span></div>
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
