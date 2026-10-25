import { COLLECTIBLES, type Loot } from '../../lib/treasure';

const draw = (art: [string, string][], silhouette = false) => art.map(([d, fill], index) => <path key={index} d={d} fill={silhouette ? '#8a6136' : fill}/>);

export function CollectibleIcon({ id, silhouette = false, className = 'size-10' }: { id: string; silhouette?: boolean; className?: string }) {
  const item = COLLECTIBLES.find(entry => entry.id === id);
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true" opacity={silhouette ? 0.35 : 1}>{item && draw(item.art, silhouette)}</svg>;
}

/** Ícone de qualquer prêmio de baú: moedas, poção de XP ou colecionável */
export function LootIcon({ loot, className = 'size-10' }: { loot: Loot; className?: string }) {
  if (loot.kind === 'collectible') return <CollectibleIcon id={loot.id} className={className}/>;
  if (loot.kind === 'coins') return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">
    <path d="M2 9h8v2h1v3H1v-3h1Z" fill="#a86d1c"/><path d="M2 9h8v2H2Z" fill="#f2c453"/><path d="M5 4h9v2h1v3H4V6h1Z" fill="#a86d1c"/><path d="M5 4h9v2H5Z" fill="#f2c453"/><path d="M7 4h2v1H7Zm-3 5h2v1H4Z" fill="#fff6c2"/></svg>;
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">
    <path d="M6 1h4v2H9v2h2v1h1v7h-1v1H5v-1H4V6h1V5h2V3H6Z" fill="#d8f0f6"/><path d="M5 8h6v5H5Z" fill="#72ad32"/><path d="M6 9h2v2H6Z" fill="#c0e36b"/><path d="M6 1h4v1H6Z" fill="#8a5838"/></svg>;
}

export const lootLabel = (loot: Loot) => loot.kind === 'coins' ? `${loot.amount} moedas` : loot.kind === 'xp' ? `Poção de XP (+${loot.amount})` : COLLECTIBLES.find(item => item.id === loot.id)?.name ?? '???';
export const lootRarity = (loot: Loot) => loot.kind === 'collectible' ? COLLECTIBLES.find(item => item.id === loot.id)?.rarity ?? 'comum' : loot.kind === 'xp' ? 'raro' : 'comum';
