import { useState } from 'react';
import { NpcDialog } from '../NpcDialog';
import { PixelAvatar } from '../PixelAvatar';
import { GUIDE, GUIDE_CHOICES, guideGreeting, guideRespond, type GuideChoice, type GuideContext } from '../../lib/guildGuide';

/** Retrato do Capitão Bússola (mesmo enquadramento do Seu Zé) */
function GuidePortrait({ talking }: { talking: boolean }) {
  return <div className={`vendor-portrait guide-portrait ${talking ? 'is-talking' : ''}`} aria-hidden="true"><PixelAvatar avatar={GUIDE} className="vendor-portrait-avatar"/></div>;
}

/** Conversa com o Capitão Bússola, que explica missões, mapa e baús */
export function GuideDialog({ context, onClose }: { context: GuideContext; onClose: () => void }) {
  const [greetingLines] = useState(() => guideGreeting(context));
  return <NpcDialog<GuideChoice> name="Capitão Bússola" portrait={talking => <GuidePortrait talking={talking}/>} greeting={greetingLines}
    choices={GUIDE_CHOICES} respond={choice => guideRespond(choice, context)} farewell="bye" onClose={onClose}/>;
}
