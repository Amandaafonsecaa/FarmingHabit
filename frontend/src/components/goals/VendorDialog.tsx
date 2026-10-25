import { useState } from 'react';
import { NpcDialog } from '../NpcDialog';
import { PixelAvatar } from '../PixelAvatar';
import { VENDOR_CHOICES, vendorGreeting, vendorRespond, type VendorChoice, type VendorContext } from '../../lib/standVendor';
import { VENDOR } from './GoalStand';

/** Retrato do Seu Zé: close no rosto do vendedor, que balança enquanto fala */
function VendorPortrait({ talking }: { talking: boolean }) {
  return <div className={`vendor-portrait ${talking ? 'is-talking' : ''}`} aria-hidden="true"><PixelAvatar avatar={VENDOR} className="vendor-portrait-avatar"/></div>;
}

/** Conversa com o Seu Zé, o vendedor da vendinha de metas (mesma caixa de diálogo do Bigode) */
export function VendorDialog({ context, onClose }: { context: VendorContext; onClose: () => void }) {
  const [greetingLines] = useState(() => vendorGreeting(context));
  return <NpcDialog<VendorChoice> name="Seu Zé" portrait={talking => <VendorPortrait talking={talking}/>} greeting={greetingLines}
    choices={VENDOR_CHOICES} respond={choice => vendorRespond(choice, context)} farewell="bye" onClose={onClose}/>;
}
