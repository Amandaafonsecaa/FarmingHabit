import { useState } from 'react';
import { PixelIcon, type PixelIconName } from '../PixelIcon';

export type QuickAction = 'goals' | 'new-goal' | 'missions' | 'shop';
const ACTIONS: { id: QuickAction; label: string; icon: PixelIconName }[] = [
  { id: 'goals', label: 'Metas', icon: 'target' },
  { id: 'new-goal', label: 'Plantar', icon: 'plus' },
  { id: 'missions', label: 'Missões', icon: 'mission' },
  { id: 'shop', label: 'Loja', icon: 'coin' },
];

/** Placas de madeira fincadas no chão: balançam no hover e dão um pulinho ao clicar */
export function QuickActions({ onAction }: { onAction: (action: QuickAction) => void }) {
  const [hopping, setHopping] = useState<QuickAction | null>(null);
  function press(action: QuickAction) {
    setHopping(action);
    window.setTimeout(() => setHopping(current => current === action ? null : current), 420);
    onAction(action);
  }
  return <nav className="quick-actions" aria-label="Atalhos do sítio">
    {ACTIONS.map((action, index) => <button key={action.id} type="button" className={`quick-sign ${hopping === action.id ? 'is-hopping' : ''}`} style={{ animationDelay: `${index * 90}ms` }} onClick={()=>press(action.id)}>
      <span className="quick-sign-board"><PixelIcon name={action.icon} className="quick-sign-icon"/>{action.label}</span>
    </button>)}
  </nav>;
}
