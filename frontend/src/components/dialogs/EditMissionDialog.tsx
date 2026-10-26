import { useState } from 'react';
import type { Mission } from '../../types/world';
import type { NewMission } from '../../services/api';
import { GameDialog } from './GameDialog';

export function EditMissionDialog({ mission, active, onSave, onUncomplete, onClose }: {
  mission: Mission; active: boolean; onSave: (changes: NewMission) => Promise<void>; onUncomplete: () => Promise<void>; onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [undoing, setUndoing] = useState(false);
  // Descumprir: a missão volta para o quadro e as recompensas são devolvidas
  async function uncomplete() {
    if (!window.confirm(`Desfazer "${mission.title}"? Ela volta para o quadro e você devolve +${mission.xp} XP e +${mission.coins} moedas.`)) return;
    setError(''); setUndoing(true);
    try { await onUncomplete(); onClose(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível desfazer a missão.'); setUndoing(false); }
  }
  const [title, setTitle] = useState(mission.title);
  const [description, setDescription] = useState(mission.description ?? '');
  async function submit(data: FormData) {
    setError('');
    try {
      const name = title.trim();
      const details = description.trim();
      const xpValue = String(data.get('xp') ?? '').trim();
      const coinsValue = String(data.get('coins') ?? '').trim();
      const xp = mission.completed ? mission.xp : Number(xpValue);
      const coins = mission.completed ? mission.coins : Number(coinsValue);
      if (!name || name.length > 60) throw new Error('Informe um título de até 60 caracteres.');
      if (details.length > 160) throw new Error('A descrição deve ter até 160 caracteres.');
      if (!mission.completed && (!xpValue || !Number.isInteger(xp) || xp < 1 || xp > 1000)) throw new Error('Informe um XP inteiro entre 1 e 1000.');
      if (!mission.completed && (!coinsValue || !Number.isInteger(coins) || coins < 0 || coins > 10000)) throw new Error('Informe moedas inteiras entre 0 e 10000.');
      await onSave({ title: name, description: details, xp, coins });
      onClose();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível atualizar a missão. Tente novamente.');
      return false;
    }
  }
  return <GameDialog title="Detalhes da missão" icon="mission" intro="Desenrole seu pergaminho e ajuste os próximos passos da aventura."
    submitLabel="Salvar alterações" error={error} onSubmit={submit} onClose={onClose}>
    <p className="mission-detail-status"><span aria-hidden="true">✦</span> {mission.completed ? 'Missão cumprida' : active ? 'Em jornada' : 'Pronta para uma aventura'}</p>
    <label className="form-label" htmlFor="mission-edit-title">Título<input id="mission-edit-title" name="title" value={title} onChange={event=>setTitle(event.target.value)} maxLength={60} autoFocus aria-describedby="mission-edit-title-count"/><small id="mission-edit-title-count" className="text-right text-xs font-normal text-muted">{title.length}/60 caracteres</small></label>
    <label className="form-label" htmlFor="mission-edit-description">Descrição <span className="optional-tag">(opcional)</span><textarea id="mission-edit-description" name="description" rows={4} value={description} onChange={event=>setDescription(event.target.value)} maxLength={160} placeholder="Conte os detalhes da sua aventura…"/><small className="text-right text-xs font-normal text-muted">{description.length}/160 caracteres</small></label>
    <fieldset className="dialog-fieldset" disabled={mission.completed}><legend>Recompensa</legend><div className="grid grid-cols-2 gap-3">
      <label className="form-label" htmlFor="mission-edit-xp">XP<input id="mission-edit-xp" name="xp" type="number" min={1} max={1000} step={1} defaultValue={mission.xp}/></label>
      <label className="form-label" htmlFor="mission-edit-coins">Moedas<input id="mission-edit-coins" name="coins" type="number" min={0} max={10000} step={1} defaultValue={mission.coins}/></label>
    </div></fieldset>
    {mission.completed && <div className="mission-undo">
      <p className="text-xs text-muted">Marcou sem querer, ou ainda não terminou de verdade? Desfaça e ela volta para o quadro.</p>
      <button type="button" className="pixel-button danger-button" disabled={undoing} onClick={()=>{ void uncomplete(); }}>{undoing ? 'Desfazendo...' : 'Desfazer missão cumprida'}</button>
    </div>}
  </GameDialog>;
}
