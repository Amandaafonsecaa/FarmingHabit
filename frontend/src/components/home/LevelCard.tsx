import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

const SPARK_COLORS = ['#f2c453', '#72ad32', '#ffe38b', '#e8ac59'];
interface Spark { id: number; label: string; big: boolean }

/** Partículas que saem da ponta da barra de XP */
function XpSparks({ spark, onDone }: { spark: Spark; onDone: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onDone, 1300); return () => window.clearTimeout(timer); }, [spark.id, onDone]);
  const count = spark.big ? 12 : 7;
  return <span className="xp-sparks" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => {
      const angle = -Math.PI / 2 + (index / (count - 1) - .5) * Math.PI * 1.4;
      const distance = 18 + (index % 3) * 10;
      return <span key={index} className="burst-pixel" style={{ '--dx': `${Math.round(Math.cos(angle) * distance)}px`, '--dy': `${Math.round(Math.sin(angle) * distance)}px`, '--delay': `${(index % 3) * 50}ms`, background: SPARK_COLORS[index % 4] } as CSSProperties}/>;
    })}
    <span className={`xp-float ${spark.big ? 'is-big' : ''}`}>{spark.label}</span>
  </span>;
}

/**
 * Nível e XP: a barra enche ao carregar, solta partículas quando ganha XP, comemora ao subir de nível
 * e, ao clicar, mostra quanto falta para o próximo.
 */
export function LevelCard({ level, totalXp, xpPerLevel }: { level: number | null; totalXp: number | null; xpPerLevel: number }) {
  const levelXp = (totalXp ?? 0) % xpPerLevel;
  const percent = levelXp / xpPerLevel * 100;
  const [shownPercent, setShownPercent] = useState(0);
  const [spark, setSpark] = useState<Spark | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const previous = useRef<{ xp: number; level: number } | null>(null);
  const clearSpark = useCallback(() => setSpark(null), []);

  // Enche a barra a partir de zero no primeiro carregamento (e acompanha mudanças depois)
  useEffect(() => { const frame = requestAnimationFrame(() => setShownPercent(percent)); return () => cancelAnimationFrame(frame); }, [percent]);

  // Compara com o valor anterior: ganho de XP solta partículas, nível novo dispara a comemoração
  useEffect(() => {
    if (totalXp === null || level === null) return;
    const before = previous.current;
    previous.current = { xp: totalXp, level };
    if (!before) return;
    if (level > before.level) {
      setLevelUp(true);
      setSpark({ id: Date.now(), label: `Nível ${level}!`, big: true });
      const timer = window.setTimeout(() => setLevelUp(false), 1800);
      return () => window.clearTimeout(timer);
    }
    if (totalXp > before.xp) setSpark({ id: Date.now(), label: `+${totalXp - before.xp} XP`, big: false });
  }, [totalXp, level]);

  function poke() {
    setHintOpen(open => !open);
    setSpark({ id: Date.now(), label: '✦', big: false });
  }

  return <section className={`level-card pixel-frame ${levelUp ? 'is-level-up' : ''}`} aria-labelledby="level-heading">
    <h2 id="level-heading" className="level-title"><span className="level-star" aria-hidden="true"/>Nível {level ?? '–'}</h2>
    <button type="button" className="xp-bar-button" onClick={poke} aria-expanded={hintOpen} aria-controls="xp-hint" aria-label={`Experiência: ${levelXp} de ${xpPerLevel}. Mostrar quanto falta`}>
      <span className="pixel-progress xp-track" role="progressbar" aria-label="Experiência do nível" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <span className="pixel-progress-fill xp-fill" style={{ width: `${shownPercent}%` }}/>
      </span>
      <span className="xp-tip" style={{ left: `${shownPercent}%` }}>{spark && <XpSparks key={spark.id} spark={spark} onDone={clearSpark}/>}</span>
    </button>
    <p className="mt-2 text-right text-sm font-bold" aria-live="polite">{levelXp} / {xpPerLevel} XP</p>
    {hintOpen && <p id="xp-hint" className="xp-hint">Faltam <strong>{xpPerLevel - levelXp} XP</strong> para o nível {(level ?? 1) + 1}. Cumpra metas e missões para chegar lá!</p>}
  </section>;
}
