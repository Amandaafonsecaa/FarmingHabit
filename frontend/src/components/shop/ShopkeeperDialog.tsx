import { useState } from 'react';
import { NpcDialog } from '../NpcDialog';
import { choicesFor, greeting, respond, type ChoiceId, type ShopContext } from '../../lib/shopkeeper';


/** Retrato do Bigode: pisca e mexe a boca enquanto fala */
function BigodePortrait({ talking }: { talking: boolean }) {
  return <svg className={`bigode-portrait ${talking ? 'is-talking' : ''}`} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="32" height="32" fill="#cfe7c0"/><rect y="24" width="32" height="8" fill="#a8d08a"/>
    <path d="M6 6h5v5H6Zm15 0h5v5h-5Z" fill="#9aa3b2"/><path d="M7 7h3v3H7Zm15 0h3v3h-3Z" fill="#f2a6a6"/>
    <path d="M5 10h22v14H5Z" fill="#9aa3b2"/><path d="M8 11h3v1H8Zm7-1h2v2h-2Zm6 1h3v1h-3Z" fill="#7d8696"/>
    <g className="portrait-eyes"><path d="M9 14h3v3H9Zm11 0h3v3h-3Z" fill="#3b2418"/><path d="M9 14h1v1H9Zm11 0h1v1h-1Z" fill="#fff"/></g>
    <path d="M15 18h2v1h-2Z" fill="#e8576f"/><path d="M2 19h7v1H2Zm21 0h7v1h-7ZM3 21h6v1H3Zm20 0h6v1h-6Z" fill="#fff"/>
    <path className="portrait-mouth" d="M14 20h4v2h-4Z" fill="#7a2e17"/>
    <path d="M7 24h18v8H7Z" fill="#fff1d6"/><path d="M7 24h18v2H7Z" fill="#bf5837"/><path d="M14 27h4v3h-4Z" fill="#f2c453"/>
  </svg>;
}

/** Conversa com o Bigode: falas da loja (lib/shopkeeper) na caixa de diálogo compartilhada */
export function ShopkeeperDialog({ context, onClose }: { context: ShopContext; onClose: () => void }) {
  const [greetingLines] = useState(() => greeting(context));
  return <NpcDialog<ChoiceId> name="Bigode" portrait={talking => <BigodePortrait talking={talking}/>} greeting={greetingLines}
    choices={choicesFor(context)} respond={choice => respond(choice, context)} farewell="bye" onClose={onClose}/>;
}
