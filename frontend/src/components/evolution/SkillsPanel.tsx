import type { CSSProperties } from 'react';
import { skillLevel, type Skill } from '../../lib/evolution';
import { useInView } from '../../hooks/useScrollGrowth';
import { PixelIcon } from '../PixelIcon';

/** Habilidades no estilo da tela de skills do Stardew: 10 caixinhas que acendem uma a uma, estrela nos níveis 5 e 10 */
export function SkillsPanel({ skills }: { skills: Skill[] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  return <section className="world-panel pixel-frame skills-panel" aria-labelledby="skills-heading">
    <header className="panel-heading"><h2 id="skills-heading"><PixelIcon name="growth" className="size-5"/>Habilidades</h2><span className="panel-tag">crescem com o que você faz</span></header>
    <div ref={ref} className={`skills-list ${inView ? 'is-visible' : ''}`}>
      {skills.map(skill => {
        const level = skillLevel(skill);
        const next = skill.thresholds[level];
        return <article key={skill.id} className="skill-row">
          <span className="skill-icon"><PixelIcon name={skill.icon} className="size-6"/></span>
          <div className="min-w-0 flex-1">
            <div className="skill-head"><h3>{skill.name}</h3><span className="skill-level">Nv {level}</span></div>
            <ol className="skill-boxes" aria-label={`${skill.name}: nível ${level} de 10`}>
              {Array.from({ length: 10 }, (_, index) => <li key={index} className={`${index < level ? 'is-filled' : ''} ${index === 4 || index === 9 ? 'is-milestone' : ''}`} style={{ '--box': index } as CSSProperties}/>)}
            </ol>
            <p className="skill-meta">{next === undefined ? `Nível máximo! ${skill.value} ${skill.unit}.` : `${skill.value}/${next} ${skill.unit} para o nível ${level + 1}`}</p>
            <div className="skill-perks">{skill.perks.map((perk, index) => <span key={perk} className={`skill-perk ${level >= (index + 1) * 5 ? 'is-unlocked' : ''}`}>{level >= (index + 1) * 5 ? '★' : '🔒'} {perk}<small> · Nv {(index + 1) * 5}</small></span>)}</div>
          </div>
        </article>;
      })}
    </div>
  </section>;
}
