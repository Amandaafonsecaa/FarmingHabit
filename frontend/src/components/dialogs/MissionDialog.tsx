import { useState } from 'react';
import type { NewItem } from '../../types/world';
import { ChoiceCards, GameDialog } from './GameDialog';

type Size = 'small' | 'medium' | 'big' | 'custom';
// Missões pagam bem mais que metas (meta cumprida: +5 moedas e +5 XP)
const REWARDS: Record<Exclude<Size, 'custom'>, { xp: number; coins: number }> = { small: { xp: 20, coins: 15 }, medium: { xp: 50, coins: 30 }, big: { xp: 120, coins: 80 } };
const SIZES: { value: Size; label: string; hint: string }[] = [
  { value: 'small', label: 'Passinho', hint: '+20 XP · 15 moedas' },
  { value: 'medium', label: 'Desafio', hint: '+50 XP · 30 moedas' },
  { value: 'big', label: 'Conquista', hint: '+120 XP · 80 moedas' },
  { value: 'custom', label: 'Personalizada', hint: 'Você escolhe os valores.' },
];

/** Nova missão: nome, descrição e o tamanho da recompensa (XP + moedas) */
export function MissionDialog({ onSave, onClose }: { onSave: (item: Extract<NewItem, { kind: 'mission' }>) => Promise<boolean>; onClose: () => void }) {
  const [titleLength, setTitleLength] = useState(0);
  const [size, setSize] = useState<Size>('medium');
  const [error, setError] = useState('');
  const fail = (message: string) => { setError(message); return false; };

  async function submit(data: FormData) {
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    if (!title) return fail('Dê um nome para a missão.');
    if (title.length > 60) return fail('O título deve ter no máximo 60 caracteres.');
    if (description.length > 160) return fail('A descrição deve ter no máximo 160 caracteres.');
    const { xp, coins } = size === 'custom' ? { xp: Number(data.get('xp')), coins: Number(data.get('coins')) } : REWARDS[size];
    if (!Number.isInteger(xp) || xp < 1 || xp > 120) return fail('O XP deve ser um número inteiro de 1 a 120.');
    if (!Number.isInteger(coins) || coins < 0 || coins > 80) return fail('As moedas devem ser um número inteiro de 0 a 80.');
    setError('');
    return await onSave({ kind: 'mission', title, description, xp, coins }) || fail('Não foi possível salvar. Confira se o servidor está rodando e tente de novo.');
  }

  return <GameDialog title="Nova missão" icon="mission" intro="Viu algo curioso? Transforme em aventura." submitLabel="Adicionar missão" error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="mission-title">Nome da missão<input id="mission-title" name="title" maxLength={60} onChange={event=>setTitleLength(event.target.value.length)} aria-describedby="mission-title-limit" autoFocus placeholder="Ex.: Descobrir que construção é aquela perto do trabalho"/><small id="mission-title-limit" className="text-right text-xs font-normal text-muted">{titleLength}/60 caracteres</small></label>
    <label className="form-label" htmlFor="mission-description">Descrição curta <span className="optional-tag">(opcional)</span><textarea id="mission-description" name="description" rows={2} maxLength={160} placeholder="O que você quer descobrir ou explorar?"/></label>
    <fieldset className="dialog-fieldset"><legend>Recompensa</legend>
      <ChoiceCards name="size" value={size} options={SIZES} onChange={setSize} compact/>
      {size === 'custom' && <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="form-label text-sm" htmlFor="mission-xp">XP<input id="mission-xp" name="xp" type="number" min={1} max={120} defaultValue={50}/></label>
        <label className="form-label text-sm" htmlFor="mission-coins">Moedas<input id="mission-coins" name="coins" type="number" min={0} max={80} defaultValue={30}/></label>
      </div>}
    </fieldset>
  </GameDialog>;
}
