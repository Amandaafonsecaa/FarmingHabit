import { useState } from 'react';
import type { Reward } from '../../types/world';
import { GameDialog } from './GameDialog';
import { ItemIcon } from '../shop/ItemIcon';
import { itemKindFor } from '../../lib/shop';

export interface RewardChanges { title: string; description: string; price: number }

export function EditRewardDialog({ reward, onSave, onDelete, onClose }: {
  reward: Reward; onSave: (changes: RewardChanges) => Promise<void>; onDelete: () => Promise<void>; onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(reward.name);
  const [description, setDescription] = useState(reward.description ?? '');
  const [price, setPrice] = useState(String(reward.price));
  async function submit(data: FormData) {
    setError('');
    try {
      if (confirmDelete) await onDelete();
      else {
        const title = String(data.get('title') ?? '').trim();
        const description = String(data.get('description') ?? '').trim();
        const rawPrice = String(data.get('price') ?? '').trim();
        const price = Number(rawPrice);
        if (!title || title.length > 60) throw new Error('Informe um nome de até 60 caracteres.');
        if (description.length > 160) throw new Error('A descrição deve ter até 160 caracteres.');
        if (!rawPrice || !Number.isInteger(price) || price < 0 || price > 10000) throw new Error('Use um preço inteiro entre 0 e 10000 moedas.');
        await onSave({ title, description, price });
      }
      onClose();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar. Tente novamente.');
      return false;
    }
  }
  return <GameDialog title={confirmDelete ? 'Apagar recompensa?' : 'Editar recompensa'} icon="coin"
    intro={confirmDelete ? 'Ela sairá da sua vitrine. As compras anteriores continuam guardadas.' : 'Ajuste esse mimo para ficar do seu jeitinho.'}
    submitLabel={confirmDelete ? 'Sim, apagar recompensa' : 'Salvar alterações'} destructive={confirmDelete}
    error={error} onSubmit={submit} onClose={onClose}>
    <div className="reward-editor-preview"><span className="reward-editor-icon"><ItemIcon kind={itemKindFor(name)} className="size-full"/></span><div><strong>{name || 'Seu próximo mimo'}</strong><p>{reward.fixed ? 'Personalizado só para você' : 'Uma recompensa do seu armazém'}</p></div></div>
    {!confirmDelete ? <>
      <label className="form-label" htmlFor="edit-reward-title">Nome da recompensa<input id="edit-reward-title" name="title" value={name} onChange={event=>setName(event.target.value)} maxLength={60} autoFocus required/></label>
      <label className="form-label" htmlFor="edit-reward-description">Descrição <span className="optional-tag">(opcional)</span><textarea id="edit-reward-description" name="description" value={description} onChange={event=>setDescription(event.target.value)} maxLength={160} rows={3} placeholder="Um pequeno motivo para se presentear…"/></label>
      <label className="form-label" htmlFor="edit-reward-price">Preço em moedas<input id="edit-reward-price" name="price" type="number" value={price} onChange={event=>setPrice(event.target.value)} min={0} max={10000} step={1} required/></label>
      <div className="reward-editor-delete"><p>Já não combina com você? Retire da vitrine sem perder suas compras.</p><button type="button" className="pixel-button danger-button" onClick={()=>{ setError(''); setConfirmDelete(true); }}>Apagar recompensa</button></div>
    </> : <div className="reward-editor-confirm"><p>Suas moedas e os itens já comprados permanecem como estão.</p><button type="button" className="pixel-button" autoFocus onClick={()=>{ setError(''); setConfirmDelete(false); }}>Voltar à edição</button></div>}
  </GameDialog>;
}
