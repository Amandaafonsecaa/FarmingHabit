import { FARM_STAGES } from '../../lib/evolution';
import { PixelIcon } from '../PixelIcon';

/** Estrada dos níveis: pedras numeradas, a exploradora no nível atual e as reformas do sítio marcadas no caminho */
export function LevelRoad({ level, xpInLevel, xpPerLevel }: { level: number; xpInLevel: number; xpPerLevel: number }) {
  const first = Math.max(1, level - 2);
  const levels = Array.from({ length: 8 }, (_, index) => first + index);
  return <section className="world-panel pixel-frame level-road-panel" aria-labelledby="road-heading">
    <header className="panel-heading"><h2 id="road-heading"><PixelIcon name="target" className="size-5"/>Estrada dos níveis</h2><span className="panel-tag">{xpPerLevel - xpInLevel} XP para o Nv {level + 1}</span></header>
    <ol className="level-road">
      {levels.map(value => {
        const stage = FARM_STAGES.find(item => item.level === value);
        const state = value < level ? 'past' : value === level ? 'current' : 'future';
        return <li key={value} className={`road-stop is-${state}`}>
          <span className="road-stone">{state === 'past' ? '✓' : value}</span>
          <div className="road-info">
            <strong>Nível {value}</strong>
            {stage && <span className="road-unlock"><PixelIcon name="home" className="size-3"/>{stage.name}</span>}
            {state === 'current' && <span className="road-progress"><span style={{ width: `${xpInLevel / xpPerLevel * 100}%` }}/></span>}
          </div>
          {state === 'current' && <span className="road-explorer" aria-label="Você está aqui"/>}
        </li>;
      })}
    </ol>
  </section>;
}
