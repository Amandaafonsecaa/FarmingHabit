import type { Loot } from '../../lib/treasure';

/** Ícone dos prêmios de baú que não são cartas: saco de moedas ou poção de XP */
export function LootIcon({ loot, className = 'size-10' }: { loot: Loot; className?: string }) {
  if (loot.kind === 'coins') return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">
    <path d="M2 9h8v2h1v3H1v-3h1Z" fill="#a86d1c"/><path d="M2 9h8v2H2Z" fill="#f2c453"/><path d="M5 4h9v2h1v3H4V6h1Z" fill="#a86d1c"/><path d="M5 4h9v2H5Z" fill="#f2c453"/><path d="M7 4h2v1H7Zm-3 5h2v1H4Z" fill="#fff6c2"/></svg>;
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">
    <path d="M6 1h4v2H9v2h2v1h1v7h-1v1H5v-1H4V6h1V5h2V3H6Z" fill="#d8f0f6"/><path d="M5 8h6v5H5Z" fill="#72ad32"/><path d="M6 9h2v2H6Z" fill="#c0e36b"/><path d="M6 1h4v1H6Z" fill="#8a5838"/></svg>;
}

export const lootLabel = (loot: Loot) => loot.kind === 'coins' ? `${loot.amount} moedas` : loot.kind === 'xp' ? `Poção de XP (+${loot.amount})` : loot.kind === 'booster' ? 'Pacote de cartas' : 'Achado antigo';
export const lootRarity = (loot: Loot) => loot.kind === 'xp' ? 'raro' : 'comum';
