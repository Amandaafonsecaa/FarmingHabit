import { useEffect, useState } from 'react';
import { NpcDialog } from '../NpcDialog';
import { ProgressBar } from '../ProgressBar';
import type { GoalLog, TrackedGoal } from '../../types/goals';
import { StreakHud } from './StreakHud';
import { toKey } from '../../lib/goalLogic';
import { coachChoices, coachGreeting, coachRespond, type CoachChoice, type CoachContext } from '../../lib/coach';

const SKIN = '#5a3a2a', SKIN_LIGHT = '#7a5038', SKIN_DARK = '#3f281c', SHINE = '#93664a';
const TANK = '#d64d3c', TANK_DARK = '#a8382b';
const IRON = '#2c2f36', STEEL = '#c6ccd6';

/**
 * Coach Rocha: fortão, careca, de regata, fazendo rosca com o halter (o antebraço direito sobe e desce).
 * Desenhado em 64×96, com os pés em y=95.
 */
function CoachFigure() {
  return <g shapeRendering="crispEdges">
    <ellipse cx="32" cy="95" rx="26" ry="3" fill="#000" opacity=".25"/>
    <g className="coach-breathe">
      {/* Pernas, meias e tênis */}
      <path d="M20 68h10v18H20Zm14 0h10v18H34Z" fill={SKIN}/><path d="M21 69h2v15h-2Zm14 0h2v15h-2Z" fill={SKIN_LIGHT}/>
      <path d="M20 84h10v4H20Zm14 0h10v4H34Z" fill="#f3f1ea"/>
      <path d="M18 88h13v6H18Zm15 0h13v6H33Z" fill="#ffffff"/><path d="M18 93h13v2H18Zm15 0h13v2H33Z" fill="#8d8fa0"/><path d="M22 90h5v2h-5Zm15 0h5v2h-5Z" fill={TANK}/>
      {/* Bermuda */}
      <path d="M18 54h28v15H35v-4h-6v4H18Z" fill="#2f3440"/><path d="M18 54h2v15h-2Zm26 0h2v15h-2Z" fill="#f3f1ea"/>
      {/* Ombros, trapézio e regata */}
      <path d="M12 22h40v10H12Z" fill={SKIN}/><path d="M14 22h10v3H14Z" fill={SKIN_LIGHT}/>
      <path d="M6 25h10v13H6Zm42 0h10v13H48Z" fill={SKIN}/><path d="M7 26h4v6H7Zm42 0h4v6h-4Z" fill={SKIN_LIGHT}/>
      <path d="M17 26h30v24h-3v6H20v-6h-3Z" fill={TANK}/><path d="M21 22h6v5h-6Zm16 0h6v5h-6Z" fill={TANK}/>
      <path d="M22 35h20v2H22Z M31 37h2v12h-2Z" fill={TANK_DARK}/><path d="M20 28h3v6h-3Z" fill="#e8765f"/>
      {/* Braço esquerdo (parado, com munhequeira) */}
      <path d="M6 38h10v12H6Z" fill={SKIN}/><path d="M7 50h9v12H7Z" fill={SKIN}/><path d="M7 39h3v9H7Z" fill={SKIN_LIGHT}/>
      <path d="M7 56h9v3H7Z" fill="#f3f1ea"/><path d="M7 62h9v6H7Z" fill={SKIN_DARK}/>
      {/* Braço direito: bíceps fixo, antebraço + halter fazendo rosca */}
      <path d="M48 38h10v12H48Z" fill={SKIN}/><path d="M51 39h4v7h-4Z" fill={SKIN_LIGHT}/>
      <g className="coach-curl">
        <path d="M48 49h9v13h-9Z" fill={SKIN}/><path d="M48 56h9v3h-9Z" fill="#f3f1ea"/><path d="M48 62h9v6h-9Z" fill={SKIN_DARK}/>
        <path d="M41 63h23v3H41Z" fill={STEEL}/><path d="M37 59h5v11h-5Zm23 0h5v11h-5Z" fill={IRON}/><path d="M38 60h1v9h-1Zm23 0h1v9h-1Z" fill="#5d6382"/>
      </g>
      {/* Pescoço e cabeça careca com cavanhaque */}
      <path d="M25 17h14v6H25Z" fill={SKIN_DARK}/>
      <path d="M23 2h18v17H23Z M25 0h14v2H25Z" fill={SKIN}/><path d="M27 1h6v3h-6Z" fill={SHINE}/><path d="M21 8h2v6h-2Zm20 0h2v6h-2Z" fill={SKIN_DARK}/>
      <path d="M25 7h5v2h-5Zm9 0h5v2h-5Z" fill="#1e1410"/><path d="M26 9h3v2h-3Zm9 0h3v2h-3Z" fill="#f3f1ea"/><path d="M27 9h2v2h-2Zm9 0h2v2h-2Z" fill="#1e1410"/>
      <path d="M29 14h6v1h-6Z" fill="#2a1a12"/><path d="M28 15h8v4h-8Z" fill="#1e1410"/><path d="M30 15h4v1h-4Z" fill="#8c4a3a"/>
    </g>
    {/* Gotas de suor */}
    <path className="coach-sweat" d="M44 4h2v3h-2Z" fill="#a9dcef"/><path className="coach-sweat is-late" d="M19 10h2v3h-2Z" fill="#a9dcef"/>
  </g>;
}

/** Retrato do Coach Rocha para a caixa de diálogo (cabeça e ombros) */
function CoachPortrait({ talking }: { talking: boolean }) {
  return <div className={`vendor-portrait coach-portrait ${talking ? 'is-talking' : ''}`} aria-hidden="true">
    <svg viewBox="8 -4 48 46" className="coach-portrait-art"><CoachFigure/></svg>
  </div>;
}

function CoachDialog({ context, onClose }: { context: CoachContext; onClose: () => void }) {
  const [greeting] = useState(() => coachGreeting(context));
  const [mode, setMode] = useState<'main' | 'goals'>('main');
  return <NpcDialog<CoachChoice> name="Coach Rocha" portrait={talking => <CoachPortrait talking={talking}/>} greeting={greeting}
    choices={coachChoices(mode, context.weeks)} farewell="bye" onClose={onClose}
    respond={choice => { setMode(choice === 'pick' ? 'goals' : 'main'); return coachRespond(choice, context); }}/>;
}

/** A mesma gatinha laranja do Diário, agora de pé, andando pela academia (desenhada virada para a direita, pés em y=28) */
function WalkingCat() {
  return <g shapeRendering="crispEdges">
    <ellipse cx="32" cy="29" rx="28" ry="3" fill="#000" opacity=".25"/>
    <g className="gym-cat-tail"><rect x="0" y="6" width="12" height="4" fill="#e8954a"/><rect x="0" y="-2" width="4" height="10" fill="#e8954a"/></g>
    {/* Patinhas em dois quadros, alternando a cada passo */}
    <g className="gym-cat-legs"><rect x="12" y="20" width="4" height="8" fill="#e8954a"/><rect x="34" y="20" width="4" height="8" fill="#e8954a"/><rect x="12" y="26" width="4" height="2" fill="#fff1d6"/><rect x="34" y="26" width="4" height="2" fill="#fff1d6"/></g>
    <g className="gym-cat-legs is-alt"><rect x="18" y="20" width="4" height="8" fill="#e8954a"/><rect x="40" y="20" width="4" height="8" fill="#e8954a"/><rect x="18" y="26" width="4" height="2" fill="#fff1d6"/><rect x="40" y="26" width="4" height="2" fill="#fff1d6"/></g>
    <rect x="10" y="6" width="34" height="14" fill="#e8954a"/><rect x="16" y="8" width="3" height="8" fill="#c8743a"/><rect x="24" y="8" width="3" height="8" fill="#c8743a"/><rect x="32" y="8" width="3" height="8" fill="#c8743a"/>
    {/* Cabeça igual à do Diário: orelhas, olhos acordados e narizinho rosa */}
    <rect x="40" y="-2" width="22" height="16" fill="#e8954a"/><rect x="40" y="-6" width="5" height="5" fill="#e8954a"/><rect x="56" y="-6" width="5" height="5" fill="#e8954a"/>
    <rect x="44" y="3" width="4" height="4" fill="#3b2418"/><rect x="53" y="3" width="4" height="4" fill="#3b2418"/><rect x="44" y="3" width="1" height="1" fill="#fff"/><rect x="53" y="3" width="1" height="1" fill="#fff"/>
    <rect x="49" y="8" width="3" height="2" fill="#e8576f"/>
  </g>;
}

// A gatinha passa uma vez por dia (na primeira visita à Evolução) para lembrar que dá para conversar com o coach
const CAT_VISIT_KEY = 'farminghabit.coach-cat-day';
const CAT_VISIT_MS = 10000;

/** Topo da Evolução: academia com o Coach Rocha treinando; clicar nele abre a conversa */
export function GymHero({ level, xpInLevel, xpPerLevel, goals, log, coach }: { level: number; xpInLevel: number; xpPerLevel: number; goals: TrackedGoal[]; log: GoalLog; coach: CoachContext }) {
  const [talking, setTalking] = useState(false);
  // A gatinha avisa que dá para conversar com o coach até a pessoa conversar a primeira vez
  const [catVisit] = useState(() => { try { return localStorage.getItem(CAT_VISIT_KEY) !== toKey(coach.today); } catch { return false; } });
  const [showCat, setShowCat] = useState(catVisit);
  // Marca a visita do dia e tira a gatinha de cena quando o passeio termina (o timer cobre o modo sem animações)
  useEffect(() => {
    if (!catVisit) return;
    try { localStorage.setItem(CAT_VISIT_KEY, toKey(coach.today)); } catch { /* ignora */ }
    const timer = window.setTimeout(() => setShowCat(false), CAT_VISIT_MS + 500);
    return () => window.clearTimeout(timer);
  }, [catVisit]); // eslint-disable-line react-hooks/exhaustive-deps
  function talk() {
    setTalking(true);
  }
  return <section className="evolution-hero gym-hero" aria-labelledby="evolution-title">
    <svg className="gym-scene" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMin slice" shapeRendering="crispEdges" aria-hidden="true">
      {/* Parede de tijolos, lambri e viga do teto */}
      <rect width="1000" height="240" fill="#b5654a"/>
      {Array.from({ length: 15 }, (_, row) => <g key={row}>
        <rect y={row * 16} width="1000" height="2" fill="#94503a"/>
        {Array.from({ length: 22 }, (_, col) => <rect key={col} x={col * 48 + (row % 2) * 24} y={row * 16} width="2" height="16" fill="#94503a"/>)}
      </g>)}
      <rect y="200" width="1000" height="40" fill="#6b4426"/><rect y="200" width="1000" height="4" fill="#8a5838"/>
      <rect width="1000" height="14" fill="#3b2418"/>
      {[250, 750].map(x => <g key={x}><rect x={x - 1} y="14" width="2" height="22" fill="#2c2f36"/><path d={`M${x - 14} 36h28l6 10h-40Z`} fill="#2f6b55"/><rect x={x - 6} y="46" width="12" height="4" fill="#ffe38b"/><path className="gym-light" d={`M${x - 20} 50h40l50 150h-140Z`} fill="#fff6c2" opacity=".08"/></g>)}

      {/* Janelas */}
      {[60, 850].map(x => <g key={x}><rect x={x} y="50" width="96" height="96" fill="#57311f"/><rect x={x + 6} y="56" width="84" height="84" fill="#9fd8f0"/><rect x={x + 46} y="56" width="4" height="84" fill="#57311f"/><rect x={x + 6} y="96" width="84" height="4" fill="#57311f"/><rect x={x + 12} y="62" width="20" height="6" fill="#ffffff" opacity=".6"/></g>)}

      {/* Relógio de parede */}
      <g transform="translate(640 40)"><rect x="-16" y="-16" width="32" height="32" fill="#3b2418"/><rect x="-13" y="-13" width="26" height="26" fill="#fff1c7"/><rect x="-1" y="-10" width="2" height="10" fill="#3b2418"/><rect x="0" y="-1" width="7" height="2" fill="#3b2418"/><g className="gym-second"><rect x="-.5" y="-11" width="1" height="11" fill="#d64d3c"/></g></g>

      {/* Pôsteres: braço forte e halter */}
      <g transform="translate(676 66)"><rect width="56" height="72" fill="#57311f"/><rect x="4" y="4" width="48" height="64" fill="#f2c453"/>
        <path d="M14 46h8v-8h-4v-8h4v-6h8v6h6v8h4v8h4v8H14Z" fill="#bf5837"/><path d="M22 24h8v4h-8Z" fill="#e87a5c"/><rect x="10" y="58" width="36" height="4" fill="#3b2418"/></g>
      <g transform="translate(296 82)"><rect width="52" height="58" fill="#57311f"/><rect x="4" y="4" width="44" height="50" fill="#5fa8d3"/>
        <rect x="14" y="27" width="24" height="4" fill="#c6ccd6"/><rect x="10" y="20" width="6" height="18" fill="#2c2f36"/><rect x="36" y="20" width="6" height="18" fill="#2c2f36"/><rect x="10" y="44" width="32" height="4" fill="#fff1c7"/></g>

      {/* Espelho grande atrás do coach */}
      <rect x="384" y="58" width="232" height="146" fill="#8a5838"/><rect x="390" y="64" width="220" height="134" fill="#cfe6ee"/>
      <path d="M410 64h18l-40 134h-0v-14Z M440 64h8l-40 134h-8Z" fill="#ffffff" opacity=".45"/><path d="M560 64h14l-36 134h-14Z" fill="#ffffff" opacity=".3"/>

      {/* Chão de borracha */}
      <rect y="240" width="1000" height="80" fill="#3f4450"/>
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 52} y="240" width="2" height="80" fill="#353a45"/>)}
      <rect y="276" width="1000" height="2" fill="#353a45"/><rect y="240" width="1000" height="3" fill="#2c2f36"/>

      {/* Rack de halteres */}
      <g transform="translate(96 194)">
        <rect width="196" height="6" fill="#2c2f36"/><rect y="30" width="196" height="6" fill="#2c2f36"/><rect x="4" width="6" height="60" fill="#2c2f36"/><rect x="186" width="6" height="60" fill="#2c2f36"/>
        {['#e8576f', '#5fa8d3', '#72ad32', '#f2c453', '#e8954a'].map((color, i) => <g key={i}>
          {[-6, 24].map(y => <g key={y} transform={`translate(${18 + i * 36} ${y})`}><rect x="4" y="4" width="16" height="3" fill="#c6ccd6"/><rect width="6" height="11" fill={color}/><rect x="18" width="6" height="11" fill={color}/><rect x="1" y="1" width="2" height="4" fill="#ffffff" opacity=".4"/></g>)}
        </g>)}
      </g>

      {/* Gaiola com barra e anilhas */}
      <g transform="translate(700 70)">
        <rect width="8" height="176" fill="#2c2f36"/><rect x="104" width="8" height="176" fill="#2c2f36"/><rect width="112" height="8" fill="#2c2f36"/>
        {Array.from({ length: 10 }, (_, i) => <g key={i}><rect x="3" y={20 + i * 15} width="2" height="2" fill="#8d8fa0"/><rect x="107" y={20 + i * 15} width="2" height="2" fill="#8d8fa0"/></g>)}
        <rect x="-26" y="78" width="164" height="4" fill="#c6ccd6"/>
        <rect x="-22" y="62" width="10" height="36" fill="#bf5837"/><rect x="-12" y="68" width="6" height="24" fill="#2c4a7a"/><rect x="124" y="62" width="10" height="36" fill="#bf5837"/><rect x="118" y="68" width="6" height="24" fill="#2c4a7a"/>
      </g>
      <g transform="translate(838 214)"><rect width="34" height="8" fill="#2c4a7a"/><rect x="2" y="-8" width="30" height="8" fill="#bf5837"/><rect x="5" y="-14" width="24" height="6" fill="#2c2f36"/><rect x="15" y="-16" width="4" height="26" fill="#8d8fa0"/></g>

      {/* Saco de pancada balançando */}
      <g className="gym-bag" transform="translate(930 14)"><rect x="-1" width="2" height="40" fill="#8d8fa0"/><rect x="-22" y="40" width="44" height="120" fill="#bf5837"/><rect x="-22" y="40" width="44" height="8" fill="#8c3a22"/><rect x="-22" y="152" width="44" height="8" fill="#8c3a22"/><rect x="-16" y="56" width="6" height="80" fill="#e07a5a"/></g>

      {/* Banco, kettlebells, garrafinha e toalha */}
      <g transform="translate(300 222)"><rect width="70" height="10" fill="#bf5837"/><rect y="8" width="70" height="3" fill="#8c3a22"/><rect x="8" y="11" width="6" height="16" fill="#2c2f36"/><rect x="56" y="11" width="6" height="16" fill="#2c2f36"/></g>
      {[[648, '#2c2f36'], [672, '#3f6b35']].map(([x, color]) => <g key={x as number} transform={`translate(${x} 232)`}><rect x="4" width="12" height="4" fill={color as string}/><rect x="2" y="2" width="3" height="6" fill={color as string}/><rect x="15" y="2" width="3" height="6" fill={color as string}/><rect y="8" width="20" height="16" fill={color as string}/><rect x="3" y="11" width="4" height="4" fill="#ffffff" opacity=".25"/></g>)}
      <g transform="translate(330 214)"><rect width="10" height="18" fill="#5fa8d3" opacity=".9"/><rect x="2" y="-4" width="6" height="4" fill="#2c2f36"/></g>
      <rect x="350" y="218" width="16" height="4" fill="#fff1c7"/>

      {/* Coach Rocha no centro, na frente do espelho */}
      <g className="gym-coach npc-clickable" transform="translate(456 124) scale(1.4)" onClick={talk}>
        <rect x="0" y="-4" width="64" height="100" fill="transparent"/>
        <CoachFigure/>
        <g className="talk-prompt"><rect x="2" y="-20" width="60" height="14" fill="#57311f"/><rect x="4" y="-18" width="56" height="10" fill="#fff1c7"/><rect x="29" y="-6" width="6" height="3" fill="#57311f"/>
          <text x="32" y="-10.5" textAnchor="middle" className="talk-prompt-text coach-prompt-text">Conversar</text></g>
      </g>

      {/* A gatinha do Diário entra, dá a dica de conversar com o coach e vai embora (uma vez por dia, sem clique) */}
      {/* Desenhada depois do coach para o balão ficar na frente dele. Para perto do coach, no trecho do cenário que aparece até no celular */}
      {showCat && <g transform="translate(372 250)" aria-hidden="true"><g className="gym-cat-walk" onAnimationEnd={()=>setShowCat(false)}>
        <g className="gym-cat-bubble">
          <rect x="-6" y="-48" width="140" height="34" fill="#57311f"/><rect x="-4" y="-46" width="136" height="30" fill="#fff1c7"/><rect x="22" y="-14" width="8" height="5" fill="#57311f"/>
          <text x="64" y="-34" textAnchor="middle" className="cat-tip-text">Fale com o treinador!</text>
          <text x="64" y="-22" textAnchor="middle" className="cat-tip-text is-small">Ele sabe das coisas 😉</text>
        </g>
        <g className="gym-cat-flip"><WalkingCat/></g>
      </g></g>}

    </svg>
    <button type="button" className="talk-sr-button sr-only focus:not-sr-only" onClick={talk}>Conversar com o Coach Rocha</button>

    <div className="evolution-hero-top">
      <div className="evolution-sign pixel-frame">
        <p className="eyebrow">Nível {level}</p>
        <h1 id="evolution-title">Evolução</h1>
        <ProgressBar value={xpInLevel / xpPerLevel * 100} label="Experiência do nível" className="mt-1 h-2.5"/>
        <p className="evolution-xp">{xpInLevel} / {xpPerLevel} XP</p>
      </div>
      {/* Aqui importa a constância, não o dinheiro: sequência no lugar das moedas */}
      <StreakHud goals={goals} log={log} today={coach.today}/>
    </div>
    {talking && <CoachDialog context={coach} onClose={()=>setTalking(false)}/>}
  </section>;
}
