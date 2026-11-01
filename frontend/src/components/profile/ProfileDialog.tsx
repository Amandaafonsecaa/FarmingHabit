import { useState } from 'react';
import type { AvatarConfig } from '../../lib/avatar';
import { GameDialog } from '../dialogs/GameDialog';
import { CharacterCreator } from './CharacterCreator';

export interface ProfileChanges { name: string; farm: string; avatar: AvatarConfig }

/**
 * Edição da carta: personagem, seu nome e o nome do sítio, salvos juntos ao confirmar (o único jeito de salvar o perfil).
 * Sem servidor o nome fica travado, porque ele mora na conta.
 */
export function ProfileDialog({ initial, nameLocked, onSave, onClose }: {
  initial: ProfileChanges; nameLocked: boolean; onSave: (changes: ProfileChanges) => Promise<void>; onClose: () => void;
}) {
  const [avatar, setAvatar] = useState(initial.avatar);
  const [error, setError] = useState('');

  async function submit(data: FormData) {
    const name = String(data.get('name') ?? initial.name).trim();
    const farm = String(data.get('farm') ?? '').trim();
    if (!nameLocked && !name) { setError('Seu nome não pode ficar em branco.'); return false; }
    if (!farm) { setError('Dê um nome para o seu sítio.'); return false; }
    try { await onSave({ name, farm, avatar }); onClose(); return true; }
    catch (reason) { setError(`Não foi possível salvar: ${reason instanceof Error ? reason.message : 'erro desconhecido'}`); return false; }
  }

  return <GameDialog title="Editar carta" icon="leaf" submitLabel="Salvar" error={error} onClose={onClose} onSubmit={submit}>
    <CharacterCreator value={avatar} onChange={setAvatar}/>
    <label className="form-label">Seu nome
      <input name="name" defaultValue={initial.name} maxLength={40} disabled={nameLocked} placeholder="Como o sítio te chama?" required/>
    </label>
    <label className="form-label">Nome do sítio
      <input name="farm" defaultValue={initial.farm} maxLength={30} placeholder="Ex.: Sítio Girassol" required/>
    </label>
  </GameDialog>;
}
