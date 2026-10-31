import type { CSSProperties } from 'react';
import { CHAPTERS } from '../../lib/journey';
import { CARDS_PER_SET, RARITY_LABEL, cardById, type CardInfo } from '../../lib/cards';
import { spritePaths } from './pixelWorlds';
import { SCENES, SCENE_W, sceneHeight } from './cardScenes';

const RARITY_MARK = { comum: '●', raro: '◆', 'lendário': '★' } as const;
const SILHOUETTE = '#8a6136';

/** Ilustração de uma carta; em silhueta (carta ainda não descoberta) vira uma sombra só, sem os detalhes */
export function CardArt({ id, silhouette = false, className }: { id: string; silhouette?: boolean; className?: string }) {
  const scene = SCENES[id];
  if (!scene) return null;
  const height = sceneHeight(scene);
  return <svg className={className} viewBox={`0 0 ${SCENE_W} ${height}`} preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
    {scene.bands.map(([y, color], index) => <rect key={index} x="0" y={y} width={SCENE_W} height={(scene.bands[index + 1]?.[0] ?? height) - y} fill={silhouette ? '#e8d2a8' : color}/>)}
    {scene.items.map(([sprite, x, y, scale = 1, className], index) => {
      const flip = scale < 0, size = Math.abs(scale);
      return <g key={index} transform={`translate(${flip ? x + sprite.rows[0].length * size : x} ${y}) scale(${scale} ${size})`} opacity={silhouette ? .45 : undefined}>
        <g className={silhouette ? undefined : className}>{spritePaths(sprite).map(({ fill, d }) => <path key={fill} d={d} fill={silhouette ? SILHOUETTE : fill}/>)}</g>
      </g>;
    })}
    {!silhouette && scene.dots?.map(([x, y, w, h, color, className], index) => <rect key={index} className={className} x={x} y={y} width={w} height={h} fill={color}
      style={className ? { '--dot': index } as CSSProperties : undefined}/>)}
  </svg>;
}

/**
 * Carta colecionável: moldura na cor do mundo, nome, ilustração, frase e rodapé com número e raridade.
 * Raras ganham brilho holográfico; lendárias são arte cheia; brilhantes ganham moldura dourada e estrelinhas.
 * "live" liga as animações (carta em destaque); no álbum elas ficam paradas.
 */
export function TradingCard({ card, shiny = false, live = false, mini = false, className = '' }: { card: CardInfo; shiny?: boolean; live?: boolean; mini?: boolean; className?: string }) {
  const full = card.rarity === 'lendário';
  return <div className={`tcg-card tcg-set-${card.set} is-${card.rarity} ${full ? 'is-full-art' : ''} ${shiny ? 'is-shiny' : ''} ${live ? 'is-live' : ''} ${mini ? 'is-mini' : ''} ${className}`}>
    <div className="tcg-art"><CardArt id={card.id}/>{card.rarity !== 'comum' && <span className="tcg-holo" aria-hidden="true"/>}</div>
    <header className="tcg-head"><strong className="tcg-name">{card.name}</strong><span className="tcg-mark" aria-hidden="true">{RARITY_MARK[card.rarity]}</span></header>
    {!mini && <p className="tcg-flavor">{card.flavor}</p>}
    <footer className="tcg-foot"><span>{String(card.number).padStart(2, '0')}/{String(CARDS_PER_SET).padStart(2, '0')}</span><span>{shiny ? '★ Brilhante' : RARITY_LABEL[card.rarity]}</span></footer>
    {shiny && <span className="tcg-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, star) => <span key={star} style={{ '--s': star } as CSSProperties}/>)}</span>}
  </div>;
}

/** Verso das cartas (todas iguais, como nos pacotes de verdade) */
export function CardBack({ className = '' }: { className?: string }) {
  return <div className={`tcg-card tcg-back ${className}`} aria-hidden="true"><span className="tcg-back-emblem">★</span><span className="tcg-back-title">FarmingHabit</span></div>;
}

/** Espaço vazio do álbum: a silhueta da carta, com "???" e o número dela */
export function CardSlotEmpty({ id }: { id: string }) {
  const card = cardById(id);
  if (!card) return null;
  return <div className={`tcg-card tcg-empty tcg-set-${card.set} ${card.rarity === 'lendário' ? 'is-full-art' : ''}`}>
    <div className="tcg-art"><CardArt id={id} silhouette/></div>
    <span className="tcg-empty-label">???</span>
    <span className="tcg-empty-number">{String(card.number).padStart(2, '0')}</span>
  </div>;
}

export const setName = (set: number) => CHAPTERS[set]?.name ?? '';
