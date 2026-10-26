import { useEffect, useRef, useState } from 'react';
import type { Mood } from '../../lib/diary';
import { MoodIcon } from './DiaryIcons';
import { CatDialog } from './CatDialog';
import { WAKES_TO_UNLOCK, WAKE_WINDOW_MS, readCatUnlocked, saveCatUnlocked } from '../../lib/diaryCat';
import { toast } from '../../lib/toast';

const AWAKE_MS = 2600;
const WAKE_BUBBLES = ['Mrrr…', 'Miau?!', 'Miau! ♥'];

/**
 * Pipoca, a gatinha do tapete: cutucar acorda (e ela volta a dormir logo depois).
 * Acordar 3 vezes em 1 minuto libera a conversa, que fica liberada neste navegador.
 */
function useSleepyCat() {
  const [unlocked, setUnlocked] = useState(readCatUnlocked);
  const [awake, setAwake] = useState(false);
  const [bubble, setBubble] = useState('');
  const [talking, setTalking] = useState(false);
  const wakes = useRef<number[]>([]);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function sleepLater() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setAwake(false); setBubble(''); }, AWAKE_MS);
  }

  function poke() {
    if (unlocked) { window.clearTimeout(timer.current); setAwake(true); setBubble(''); setTalking(true); return; }
    if (awake) return; // já acordada: só conta quando ela estava dormindo
    const now = Date.now();
    wakes.current = [...wakes.current.filter(time => now - time < WAKE_WINDOW_MS), now];
    const count = wakes.current.length;
    setAwake(true);
    setBubble(WAKE_BUBBLES[Math.min(count, WAKES_TO_UNLOCK) - 1]);
    if (count >= WAKES_TO_UNLOCK) {
      saveCatUnlocked();
      setUnlocked(true);
      toast('A Pipoca acordou de vez! 😺 Agora dá pra conversar com ela.', 'info');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { setBubble(''); setTalking(true); }, 900);
      return;
    }
    sleepLater();
  }

  function stopTalking() { setTalking(false); sleepLater(); }
  return { unlocked, awake, bubble, talking, poke, stopTalking };
}

/** Clima da janela: segue o humor do dia (chuva, tempestade, arco-íris...) */
function WindowWeather({ mood, night }: { mood?: Mood; night: boolean }) {
  const rain = mood === 'rainy' || mood === 'stormy';
  return <g clipPath="url(#diary-window)">
    <rect x="612" y="42" width="256" height="146" fill={mood === 'stormy' ? '#3a3f55' : rain ? (night ? '#2d3550' : '#7f97ad') : night ? '#2b3a67' : '#8fd0f0'}/>
    {night
      ? <><circle cx="810" cy="82" r="18" fill="#fff6dd"/><circle cx="803" cy="76" r="4" fill="#efe2bf"/><circle cx="816" cy="90" r="3" fill="#efe2bf"/>
          <g className="window-stars" fill="#fff6c2">{[[640, 60], [690, 90], [730, 55], [760, 120], [660, 140], [850, 130], [840, 56]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" style={{ animationDelay: `${-i * 0.5}s` }}/>)}</g>
          {!rain && <g className="window-fireflies" fill="#f6d34a">{[[650, 170], [700, 160], [790, 172], [840, 162]].map(([x, y], i) => <rect key={i} x={x} y={y} width="3" height="3" style={{ animationDelay: `${-i * 0.7}s` }}/>)}</g>}</>
      : <g className="window-sun"><path d="M796 66h20v4h4v20h-4v4h-20v-4h-4V70h4Z" fill="#ffe38b"/><path d="M804 58h4v4h-4Zm0 40h4v4h-4ZM784 78h4v4h-4Zm40 0h4v4h-4Z" fill="#f2c453"/></g>}
    {(mood === 'cloudy' || rain) && <g className="window-clouds" fill={rain ? '#8a90a3' : '#eef1f6'}><path d="M630 70h30v-8h24v8h16v12h-70Z"/><path d="M720 96h26v-8h22v8h14v10h-62Z"/><path d="M800 60h24v-8h20v8h12v10h-56Z" opacity=".9"/></g>}
    {rain && <g className="window-rain" fill="#a9dcef">{Array.from({ length: 26 }, (_, i) => <rect key={i} x={616 + (i * 37) % 250} y={30 + (i * 23) % 150} width="2" height="9" style={{ animationDelay: `${-(i * 0.13) % 0.9}s` }}/>)}</g>}
    {mood === 'stormy' && <rect className="window-lightning" x="612" y="42" width="256" height="146" fill="#fff"/>}
    {mood === 'rainbow' && <g className="window-rainbow" fill="none" strokeWidth="6">{['#e8576f', '#f2a33a', '#f2c453', '#72ad32', '#5fa8d3', '#9b7fd4'].map((color, i) => <path key={color} d={`M${650 + i * 6} 190a${90 - i * 6} ${90 - i * 6} 0 0 1 ${180 - i * 12} 0`} stroke={color}/>)}</g>}
    {mood === 'sunny' && !night && <g className="window-rays" fill="#fff6c2" opacity=".45"><path d="M806 94l-60 94h20Zm8 0l40 94h18Z"/></g>}
  </g>;
}

/** Cantinho do diário: quarto aconchegante com janela, escrivaninha, vela, estante e gatinho dormindo */
export function DiaryHero({ todayMood, night, dateLabel, written, streak, monthMood }: {
  todayMood?: Mood; night: boolean; dateLabel: string; written: number; streak: number; monthMood?: Mood;
}) {
  const cat = useSleepyCat();
  return <section className="diary-hero" aria-labelledby="diary-title">
    <svg className="diary-room" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" aria-hidden="true">
      <defs><clipPath id="diary-window"><rect x="612" y="42" width="256" height="146"/></clipPath></defs>
      {/* Parede de tábuas, rodapé e assoalho */}
      <rect width="1000" height="250" fill={night ? '#a8733f' : '#b9814a'}/>
      {Array.from({ length: 21 }, (_, i) => <g key={i}><rect x={i * 50} y="0" width="2" height="250" fill="#8a5838"/><rect x={i * 50 + 2} y="0" width="1" height="250" fill="#d39a5e"/></g>)}
      <rect y="200" width="1000" height="50" fill="#9a6638"/><rect y="198" width="1000" height="4" fill="#6b4426"/>
      <rect y="250" width="1000" height="70" fill="#8a5838"/>{[268, 286, 304].map(y => <rect key={y} y={y} width="1000" height="2" fill="#6b4426"/>)}
      {night && <rect width="1000" height="320" fill="#1d1640" opacity=".18"/>}

      {/* Varal de luzinhas */}
      <path d="M0 18Q250 46 500 18T1000 18" fill="none" stroke="#3b2418" strokeWidth="2" shapeRendering="auto"/>
      <g className="fairy-lights">{Array.from({ length: 16 }, (_, i) => { const x = 30 + i * 62; const y = 18 + Math.sin((x / 1000) * Math.PI * 2) * -14 + 12; return <rect key={i} x={x} y={y} width="6" height="8" fill={['#f2c453', '#ee6996', '#72ad32', '#5fa8d3'][i % 4]} style={{ animationDelay: `${(i % 4) * 0.4}s` }}/>; })}</g>

      {/* Janela com clima */}
      <rect x="600" y="30" width="280" height="170" fill="#6b4426"/>
      <WindowWeather mood={todayMood} night={night}/>
      <rect x="738" y="42" width="6" height="146" fill="#6b4426"/><rect x="612" y="112" width="256" height="6" fill="#6b4426"/>
      <rect x="590" y="198" width="300" height="12" fill="#8a5838"/><rect x="590" y="198" width="300" height="3" fill="#b07a4c"/>
      <g className="sill-plant"><rect x="636" y="180" width="18" height="18" fill="#b96845"/><rect x="634" y="178" width="22" height="4" fill="#d98a5c"/><path d="M640 160h4v18h-4Zm6 6h4v12h-4Zm-12 4h4v8h-4Z" fill="#53922d"/><path d="M638 156h8v6h-8Z" fill="#ee6996"/></g>
      <rect x="575" y="20" width="330" height="6" fill="#3b2418"/>
      <g className="curtain"><rect x="582" y="24" width="40" height="190" fill="#bf5837"/><path d="M590 24h4v190h-4Zm14 0h4v190h-4Z" fill="#a83e33"/></g>
      <g className="curtain is-right"><rect x="858" y="24" width="40" height="190" fill="#bf5837"/><path d="M866 24h4v190h-4Zm14 0h4v190h-4Z" fill="#a83e33"/></g>

      {/* Estante com livros e pote de vaga-lumes */}
      <rect x="50" y="120" width="190" height="132" fill="#6b4426"/><rect x="56" y="126" width="178" height="120" fill="#4d2e1c"/>
      {[162, 204, 246].map(y => <rect key={y} x="56" y={y} width="178" height="5" fill="#8a5838"/>)}
      {/* Livros: [x, altura, cor, prateleira] apoiados na prateleira */}
      {([[62, 26, '#bf5837', 162], [74, 30, '#5fa8d3', 162], [86, 22, '#f2c453', 162], [96, 28, '#72ad32', 162], [150, 24, '#9b7fd4', 162], [162, 30, '#e8954a', 162],
        [64, 28, '#3f7a2e', 204], [76, 32, '#e8576f', 204], [88, 24, '#f6e2b0', 204], [180, 30, '#5fa8d3', 204], [192, 26, '#bf5837', 204]] as const).map(([x, height, color, shelf]) => <rect key={`${x}-${shelf}`} x={x} y={shelf - height} width="10" height={height} fill={color}/>)}
      <g className="firefly-jar"><rect x="120" y="136" width="22" height="26" fill="#d8f0f6" opacity=".55"/><rect x="118" y="132" width="26" height="5" fill="#8a5838"/><g fill="#ffe38b">{[[124, 146], [134, 140], [130, 154]].map(([x, y], i) => <rect key={i} className="jar-bug" x={x} y={y} width="3" height="3" style={{ animationDelay: `${-i * 0.5}s` }}/>)}</g></g>
      <g className="shelf-plant"><rect x="196" y="146" width="16" height="16" fill="#b96845"/><path d="M200 132h3v14h-3Zm6 4h3v10h-3Zm-12 4h3v6h-3Z" fill="#53922d"/></g>

      {/* Escrivaninha: diário aberto, tinteiro com pena e vela */}
      <rect x="320" y="202" width="250" height="12" fill="#8a5838"/><rect x="320" y="202" width="250" height="3" fill="#b07a4c"/><rect x="330" y="214" width="10" height="38" fill="#6b4426"/><rect x="550" y="214" width="10" height="38" fill="#6b4426"/>
      <rect x="390" y="186" width="96" height="16" fill="#fff8e1"/><rect x="437" y="184" width="2" height="18" fill="#c9a46a"/>{[190, 194, 198].map(y => <g key={y}><rect x="396" y={y} width="34" height="1" fill="#c9a46a"/><rect x="444" y={y} width="34" height="1" fill="#c9a46a"/></g>)}
      <rect x="500" y="190" width="14" height="12" fill="#3b2438"/><rect x="502" y="188" width="10" height="3" fill="#57311f"/>
      <g className="quill"><path d="M508 188l8-24h4l-6 22Z" fill="#fff8ec"/><path d="M516 166h4v6h-4Z" fill="#e8d2a8"/></g>
      <g className="candle-glow"><rect x="334" y="140" width="40" height="40" fill="#ffd76a" opacity=".12"/><rect x="340" y="146" width="28" height="28" fill="#ffd76a" opacity=".16"/></g>
      <rect x="346" y="176" width="16" height="26" fill="#fff1d6"/><rect x="346" y="176" width="4" height="26" fill="#ffffff"/><rect x="342" y="198" width="24" height="4" fill="#b07a4c"/>
      <g className="candle-flame"><rect x="351" y="164" width="6" height="10" fill="#f2a33a"/><rect x="353" y="167" width="2" height="6" fill="#ffe38b"/></g>

      {/* Tapete e gatinho dormindo */}
      <rect x="150" y="282" width="320" height="30" fill="#bf5837"/><rect x="156" y="286" width="308" height="22" fill="#d9734f"/>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={170 + i * 30} y="294" width="8" height="6" fill="#f2c453"/>)}
      <g className={`sleepy-cat ${cat.awake ? 'is-awake' : ''} ${cat.unlocked ? 'npc-clickable' : 'is-pokeable'}`} onClick={cat.poke}>
        <rect x="252" y="236" width="112" height="56" fill="transparent"/>
        <g className="cat-tail"><rect x="330" y="282" width="24" height="5" fill="#e8954a"/><rect x="350" y="276" width="5" height="8" fill="#e8954a"/></g>
        <g className="cat-body"><rect x="274" y="272" width="60" height="16" fill="#e8954a"/><rect x="278" y="268" width="50" height="6" fill="#e8954a"/><rect x="282" y="276" width="40" height="3" fill="#c8743a"/><rect x="290" y="281" width="30" height="3" fill="#c8743a"/></g>
        <g className="cat-head">
          <rect x="262" y="270" width="22" height="16" fill="#e8954a"/><rect x="262" y="266" width="5" height="5" fill="#e8954a"/><rect x="278" y="266" width="5" height="5" fill="#e8954a"/>
          {cat.awake
            ? <><rect x="266" y="275" width="4" height="4" fill="#3b2418"/><rect x="275" y="275" width="4" height="4" fill="#3b2418"/><rect x="266" y="275" width="1" height="1" fill="#fff"/><rect x="275" y="275" width="1" height="1" fill="#fff"/></>
            : <><rect x="266" y="277" width="5" height="1" fill="#3b2418"/><rect x="275" y="277" width="5" height="1" fill="#3b2418"/></>}
          <rect x="271" y="280" width="3" height="2" fill="#e8576f"/>
        </g>
        {!cat.awake && <g className="cat-zzz"><text x="286" y="258">z</text><text x="296" y="246">Z</text></g>}
        {/* Balãozinho ao acordar */}
        {cat.bubble && <g key={cat.bubble} className="cat-bubble"><rect x="240" y="232" width="62" height="20" fill="#57311f"/><rect x="242" y="234" width="58" height="16" fill="#fff1c7"/><rect x="266" y="252" width="6" height="5" fill="#57311f"/>
          <text x="271" y="246" textAnchor="middle" className="cat-bubble-text">{cat.bubble}</text></g>}
        {/* Aviso de interação no hover: "Cutucar" antes de liberar, "Conversar" depois */}
        {!cat.bubble && <g className="talk-prompt"><rect x="236" y="234" width="70" height="18" fill="#57311f"/><rect x="238" y="236" width="66" height="14" fill="#fff1c7"/><rect x="268" y="252" width="6" height="4" fill="#57311f"/>
          <text x="271" y="247" textAnchor="middle" className="talk-prompt-text">{cat.unlocked ? 'Conversar' : 'Cutucar'}</text></g>}
      </g>

      {/* Planta grande no canto */}
      <g className="corner-plant"><path d="M930 200h8v50h-8Zm-20 10h20v6h-20Zm28-14h22v6h-22Zm-24-14h18v6h-18Zm28 32h18v6h-18Z" fill="#3f7a2e"/><path d="M906 206h12v4h-12Zm38-14h12v4h-12Z" fill="#72ad32"/></g>
      <rect x="914" y="240" width="40" height="30" fill="#b96845"/><rect x="910" y="236" width="48" height="6" fill="#d98a5c"/>
    </svg>

    {/* Para teclado e leitores de tela: aparece só quando recebe foco */}
    <button type="button" className="talk-sr-button sr-only focus:not-sr-only" onClick={cat.poke}>{cat.unlocked ? 'Conversar com a Pipoca' : 'Cutucar a gatinha'}</button>
    <div className="diary-hero-top">
      <div className="diary-sign pixel-frame">
        <p className="eyebrow">{dateLabel}</p>
        <h1 id="diary-title">Meu Diário</h1>
        <p className="missions-motto">Um cantinho só seu para guardar os dias.</p>
      </div>
      <dl className="goals-stats">
        <div className="hero-stat pixel-frame"><dt>Dias escritos</dt><dd>{written}</dd></div>
        <div className="hero-stat pixel-frame"><dt>Sequência</dt><dd>{streak}<small> dias</small></dd></div>
        <div className="hero-stat pixel-frame"><dt>Humor do mês</dt><dd>{monthMood ? <MoodIcon mood={monthMood} className="mx-auto size-8"/> : '–'}</dd></div>
      </dl>
    </div>
    {cat.talking && <CatDialog context={{ written, streak, todayMood }} onClose={cat.stopTalking}/>}
  </section>;
}
