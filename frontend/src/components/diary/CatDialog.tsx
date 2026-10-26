import { useState } from 'react';
import { NpcDialog } from '../NpcDialog';
import { CAT_CHOICES, catGreeting, catRespond, type CatChoice, type CatContext } from '../../lib/diaryCat';

/** Retrato da Pipoca: gatinha laranja que mexe a boca enquanto fala (mesmo quadro do Bigode) */
function PipocaPortrait({ talking }: { talking: boolean }) {
  return <svg className={`bigode-portrait ${talking ? 'is-talking' : ''}`} viewBox="0 0 32 32" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="32" height="32" fill="#f6dfa6"/><rect y="24" width="32" height="8" fill="#d9734f"/>
    <path d="M6 6h5v5H6Zm15 0h5v5h-5Z" fill="#e8954a"/><path d="M7 7h3v3H7Zm15 0h3v3h-3Z" fill="#f2a6a6"/>
    <path d="M5 10h22v14H5Z" fill="#e8954a"/><path d="M8 11h3v1H8Zm7-1h2v2h-2Zm6 1h3v1h-3Z" fill="#c8743a"/>
    <g className="portrait-eyes"><path d="M9 14h3v3H9Zm11 0h3v3h-3Z" fill="#3b2418"/><path d="M9 14h1v1H9Zm11 0h1v1h-1Z" fill="#fff"/></g>
    <path d="M15 18h2v1h-2Z" fill="#e8576f"/><path d="M2 19h7v1H2Zm21 0h7v1h-7ZM3 21h6v1H3Zm20 0h6v1h-6Z" fill="#fff6dd"/>
    <path className="portrait-mouth" d="M14 20h4v2h-4Z" fill="#7a2e17"/>
    <path d="M7 24h18v8H7Z" fill="#e8954a"/><path d="M11 26h10v6H11Z" fill="#fff6dd"/>
  </svg>;
}

/** Conversa com a Pipoca, liberada depois de acordá-la 3 vezes em 1 minuto */
export function CatDialog({ context, onClose }: { context: CatContext; onClose: () => void }) {
  const [greetingLines] = useState(() => catGreeting(context));
  return <NpcDialog<CatChoice> name="Pipoca" portrait={talking => <PipocaPortrait talking={talking}/>} greeting={greetingLines}
    choices={CAT_CHOICES} respond={choice => catRespond(choice, context)} farewell="nap" onClose={onClose}/>;
}
