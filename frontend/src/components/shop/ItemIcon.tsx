import type { ItemKind } from '../../lib/shop';

// Ícones 16×16 dos produtos: [caminho, cor]
const ART: Record<ItemKind, [string, string][]> = {
  gift: [['M2 6h12v9H2Z', '#bf5837'], ['M7 6h2v9H7ZM2 9h12v2H2Z', '#f2c453'], ['M1 4h14v3H1Z', '#d9734f'], ['M4 1h3v3H4Zm5 0h3v3H9Z', '#f2c453'], ['M3 12h3v1H3Z', '#e8735f']],
  coffee: [['M2 5h10v8H2Z', '#fff1d6'], ['M12 7h3v4h-3V9h1V8h-1Z', '#fff1d6'], ['M3 6h8v2H3Z', '#7a4a26'], ['M1 13h12v2H1Z', '#c9a46a'], ['M4 1h1v3H4Zm3 0h1v3H7Z', '#e8e0d6']],
  book: [['M2 2h11v12H2Z', '#3f6b35'], ['M3 3h9v10H3Z', '#53922d'], ['M13 3h1v12H3v-1h10Z', '#fff1d6'], ['M5 5h5v1H5Zm0 2h4v1H5Z', '#c0e36b']],
  cake: [['M2 8h12v6H2Z', '#f6d3b3'], ['M2 7h12v2H2Z', '#ee6996'], ['M2 11h12v1H2Z', '#bf5837'], ['M7 3h2v4H7Z', '#fff1d6'], ['M7 1h2v2H7Z', '#f2a33a'], ['M4 7h1v2H4Zm6 0h1v2h-1Z', '#fff6c2']],
  ticket: [['M1 4h14v3h-1v2h1v3H1V9h1V7H1Z', '#f2c453'], ['M5 4h1v8H5Z', '#a86d1c'], ['M8 6h5v1H8Zm0 2h4v1H8Z', '#bf5837']],
  game: [['M2 5h12v7H2Z', '#5f86b8'], ['M1 7h1v4H1Zm13 0h1v4h-1Z', '#5f86b8'], ['M4 7h1v3H4ZM3 8h3v1H3Z', '#fff1d6'], ['M10 7h2v2h-2Zm1 2h2v1h-2Z', '#e8576f']],
  plant: [['M4 10h8v5H4Z', '#b96845'], ['M3 9h10v2H3Z', '#d98a5c'], ['M7 4h2v6H7Z', '#3f6b35'], ['M3 3h4v3H3Zm6-2h4v4H9Z', '#72ad32'], ['M10 2h2v1h-2Z', '#c0e36b']],
  spa: [['M2 9h12v5H2Z', '#d8f0f6'], ['M1 8h14v2H1Z', '#fff'], ['M4 3h2v4H4Zm3-1h2v5H7Zm3 1h2v4h-2Z', '#e3dbd0'], ['M5 11h6v1H5Z', '#9fd8f0']],
  food: [['M2 7h12v2H2Z', '#e8954a'], ['M1 9h14v2H1Z', '#53922d'], ['M2 11h12v2H2Z', '#7a3a1f'], ['M2 13h12v1H2Z', '#e8954a'], ['M3 4h10v3H3Z', '#f2c453'], ['M5 5h1v1H5Zm4 0h1v1H9Z', '#fff6c2']],
  music: [['M5 2h8v2H5Z', '#3b2418'], ['M5 2h2v10H5Zm6 0h2v8h-2Z', '#3b2418'], ['M2 11h5v3H2Zm6-2h5v3H8Z', '#9b7fd4']],
};

export function ItemIcon({ kind, className = 'size-10' }: { kind: ItemKind; className?: string }) {
  return <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden="true">{ART[kind].map(([d, fill], index) => <path key={index} d={d} fill={fill}/>)}</svg>;
}
