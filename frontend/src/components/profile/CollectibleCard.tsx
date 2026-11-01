import { useRef, useState, type CSSProperties, type PointerEvent, type Ref } from 'react';
import type { AvatarConfig } from '../../lib/avatar';
import { downloadSvgAsPng } from '../../lib/cardExport';
import { prefersCalm } from '../../hooks/useRollingNumber';
import { toast } from '../../lib/toast';
import { PixelAvatar } from '../PixelAvatar';
import { PixelIcon } from '../PixelIcon';

const XP_PER_LEVEL = 100;
const FONT = '"Courier New", Courier, monospace';
// Carta no formato das cartas colecionáveis (63 × 88), em unidades de pixel do desenho
const W = 252, H = 352;

/** O que um amigo veria: quem é, o sítio, a constância (sequência de dias) e a área da vida mais cuidada na semana */
export interface CardData { name: string; farm: string; level: number | null; xp: number; streak: number; area: string | null; since: string | null; avatar: AvatarConfig }

/** Texto que não cabe é comprimido para a largura disponível (nomes longos não estouram a carta) */
const fit = (text: string, size: number, maxWidth: number) => text.length * size * 0.6 > maxWidth ? { textLength: maxWidth, lengthAdjust: 'spacingAndGlyphs' as const } : {};

/** Raridade pelo nível: ★ até o 4, ★★ do 5 ao 9, ★★★ a partir do 10 */
const rarity = (level: number) => '★'.repeat(level >= 10 ? 3 : level >= 5 ? 2 : 1);

/** Desenho da carta (é o mesmo SVG que vira PNG no "Baixar carta"; por isso tudo é atributo, sem classes de CSS) */
function CardArt({ data, svgRef }: { data: CardData; svgRef: Ref<SVGSVGElement> }) {
  const level = data.level ?? 1;
  const xpInLevel = data.xp % XP_PER_LEVEL;
  const since = data.since ? new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(data.since)).replace('.', '') : null;
  const label = `Carta de ${data.name}, nível ${data.level ?? '?'}, do ${data.farm}`;

  return <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H} shapeRendering="crispEdges" role="img" aria-label={label} fontFamily={FONT}>
    {/* Moldura dourada com contorno escuro e luz/sombra em degraus */}
    <rect width={W} height={H} fill="#3b2418"/>
    <rect x="3" y="3" width={W - 6} height={H - 6} fill="#e7b84b"/>
    <path d={`M3 3h${W - 6}v3H6v${H - 9}H3Z`} fill="#ffe38b"/>
    <path d={`M${W - 6} 6h3v${H - 9}H6v-3h${W - 12}Z`} fill="#b8862f"/>

    {/* Face da carta em pergaminho */}
    <rect x="11" y="11" width={W - 22} height={H - 22} fill="#3b2418"/>
    <rect x="13" y="13" width={W - 26} height={H - 26} fill="#fff1c7"/>

    {/* Cabeçalho: nome e nível */}
    <text x="20" y="36" fontSize="17" fontWeight="bold" fill="#3b2418" {...fit(data.name, 17, 150)}>{data.name}</text>
    <text x={228 - String(data.level ?? "–").length * 12} y="36" fontSize="9" fontWeight="bold" fill="#765337" textAnchor="end">Nv</text>
    <text x="232" y="37" fontSize="20" fontWeight="bold" fill="#b96845" textAnchor="end">{data.level ?? '–'}</text>

    {/* Janela da arte: céu, morros, gramado e a personagem */}
    <rect x="18" y="45" width="216" height="140" fill="#3b2418"/>
    <rect x="20" y="47" width="212" height="136" fill="#74c9ef"/>
    <rect x="20" y="102" width="212" height="22" fill="#8fd4f1"/>
    <rect x="20" y="124" width="212" height="22" fill="#b5e3f2"/>
    <path d="M20 132h30v-8h26v6h22v-10h34v8h28v-6h30v8h42v38H20Z" fill="#6d9b45" opacity=".55"/>
    <rect x="20" y="152" width="212" height="31" fill="#6d9b45"/>
    <rect x="20" y="152" width="212" height="2" fill="#fff1c7" opacity=".3"/>
    <path d="M194 58h16v16h-16Z M190 62h24v8h-24Z" fill="#ffe38b"/>
    <path d="M34 66h22v4H34Zm6-4h12v4H40Z M150 78h18v4h-18Zm4-4h10v4h-10Z" fill="#fff7df"/>
    <svg x="81" y="70" width="90" height="99"><PixelAvatar avatar={data.avatar}/></svg>
    {/* Faixas de brilho fixas: a carta exportada também sai "holográfica" */}
    <path d="M20 47h30L20 77Z M92 47h18l-72 136H20v-6Z" fill="#ffffff" opacity=".18"/>

    {/* Faixa do tipo: o sítio do jogador, com um brotinho */}
    <rect x="18" y="190" width="216" height="18" fill="#8a5838"/>
    <rect x="18" y="190" width="216" height="2" fill="#b07a4c"/>
    <path d="M30 196h2v8h-2Zm-4-2h4v2h-4Zm6-2h4v2h-4Z" fill="#b4de54"/>
    <text x={W / 2} y="203" fontSize="10" fontWeight="bold" fill="#fff1c7" textAnchor="middle" {...fit(data.farm, 10, 180)}>{data.farm}</text>

    {/* Atributos, como os "ataques" da carta: constância e área mais cuidada */}
    <g fontSize="11" fill="#3b2418">
      <path d="M26 220h2v2h2v2h2v6h-2v2h-8v-2h-2v-4h2v-2h2v-2h2Z" fill="#e8762f"/><path d="M26 226h2v4h-4v-2h2Z" fill="#ffe38b"/>
      <text x="38" y="231" fontWeight="bold">Sequência</text>
      <text x="230" y="231" fontWeight="bold" textAnchor="end">{data.streak} {data.streak === 1 ? 'dia' : 'dias'}</text>
      <path d="M22 244h210" stroke="#d2ac71" strokeDasharray="3 3"/>

      <path d="M25 252h6v2h2v4h-2v2h-2v2h-2v-4h-2Zm-2 6h2v4h-2Z" fill="#6d9b45"/>
      <text x="38" y="263" fontWeight="bold">Cuida mais de</text>
      <text x="230" y="263" fontWeight="bold" textAnchor="end" {...fit(data.area ?? '–', 11, 90)}>{data.area ?? '–'}</text>
      <path d="M22 276h210" stroke="#d2ac71" strokeDasharray="3 3"/>

      <text x="22" y="301" fontWeight="bold">XP</text>
      <rect x="44" y="292" width="140" height="11" fill="#5b3826"/>
      <rect x="46" y="294" width="136" height="7" fill="#c9b17c"/>
      <rect x="46" y="294" width={Math.round(136 * xpInLevel / XP_PER_LEVEL)} height="7" fill="#6d9b45"/>
      <rect x="46" y="294" width={Math.round(136 * xpInLevel / XP_PER_LEVEL)} height="2" fill="#a3be63"/>
      <text x="230" y="301" fontSize="9" textAnchor="end" fill="#765337">{xpInLevel}/{XP_PER_LEVEL}</text>
    </g>

    {/* Rodapé: desde quando joga e a raridade */}
    <text x="20" y="335" fontSize="8" fill="#765337">{since ? `no sítio desde ${since}` : 'FarmingHabit'}</text>
    <text x="232" y="336" fontSize="11" fill="#b8862f" textAnchor="end">{rarity(level)}</text>
  </svg>;
}

/**
 * Carta colecionável do jogador, com brilho holográfico que acompanha o mouse (inclina a carta e
 * move o reflexo). Com movimento reduzido ou modo calmo a carta fica parada. Tocar na carta (ou em "Editar") abre a edição;
 * "Baixar carta" salva um PNG.
 */
export function CollectibleCard({ data, onEdit }: { data: CardData; onEdit: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (prefersCalm()) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const style = cardRef.current?.style;
      if (!style) return;
      style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      style.setProperty('--rx', `${((0.5 - y) * 16).toFixed(2)}deg`);
      style.setProperty('--ry', `${((x - 0.5) * 20).toFixed(2)}deg`);
      style.setProperty('--foil-x', `${(x * 100).toFixed(1)}%`);
      style.setProperty('--foil-y', `${(y * 100).toFixed(1)}%`);
    });
    if (!active) setActive(true);
  }

  function onPointerLeave() {
    cancelAnimationFrame(frame.current);
    const style = cardRef.current?.style;
    ['--mx', '--my', '--rx', '--ry', '--foil-x', '--foil-y'].forEach(name => style?.removeProperty(name));
    setActive(false);
  }

  async function download() {
    if (!svgRef.current || saving) return;
    setSaving(true);
    try {
      const slug = data.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'fazendeira';
      await downloadSvgAsPng(svgRef.current, `carta-${slug}.png`, 4);
      toast('Carta salva! Confira seus downloads.', 'success');
    } catch {
      toast('Não foi possível gerar a imagem da carta.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return <div className="holo-showcase">
    <button type="button" className={`holo-card ${active ? 'is-active' : ''}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onClick={onEdit} aria-label="Editar carta">
      <div ref={cardRef} className="holo-card-inner" style={{ '--card-ratio': `${W} / ${H}` } as CSSProperties}>
        <CardArt data={data} svgRef={svgRef}/>
        <span className="holo-foil" aria-hidden="true"/>
        <span className="holo-foil is-art" aria-hidden="true"/>
        <span className="holo-sparkle" aria-hidden="true"/>
        <span className="holo-glare" aria-hidden="true"/>
      </div>
    </button>
    <div className="holo-actions">
      <button type="button" className="pixel-button primary-button" onClick={onEdit}><PixelIcon name="leaf" className="size-3"/>Editar</button>
      <button type="button" className="pixel-button" onClick={download} disabled={saving} aria-busy={saving}>{saving ? 'Gerando...' : 'Baixar carta'}</button>
    </div>
  </div>;
}
