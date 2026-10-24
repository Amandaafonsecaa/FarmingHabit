import { useState } from 'react';
import type { NewItem } from '../../types/world';
import { ChoiceCards, GameDialog } from './GameDialog';

type Size = 'small' | 'medium' | 'big' | 'custom';
const REWARDS: Record<Exclude<Size, 'custom'>, { xp: number; coins: number }> = { small: { xp: 10, coins: 5 }, medium: { xp: 30, coins: 15 }, big: { xp: 100, coins: 50 } };
const SIZES: { value: Size; label: string; hint: string }[] = [
  { value: 'small', label: 'Passinho', hint: '+10 XP · 5 moedas' },
  { value: 'medium', label: 'Desafio', hint: '+30 XP · 15 moedas' },
  { value: 'big', label: 'Conquista', hint: '+100 XP · 50 moedas' },
  { value: 'custom', label: 'Personalizada', hint: 'Você escolhe os valores.' },
];

/** Nova missão: nome, descrição e o tamanho da recompensa (XP + moedas) */
export function MissionDialog({ onSave, onClose }: { onSave: (item: Extract<NewItem, { kind: 'mission' }>) => Promise<boolean>; onClose: () => void }) {
  const [size, setSize] = useState<Size>('medium');
  const [error, setError] = useState('');
  const fail = (message: string) => { setError(message); return false; };

  async function submit(data: FormData) {
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    if (!title) return fail('Dê um nome para a missão.');
    if (!description) return fail('Conte em poucas palavras o que é a missão.');
    const { xp, coins } = size === 'custom' ? { xp: Number(data.get('xp')), coins: Number(data.get('coins')) } : REWARDS[size];
    if (!Number.isInteger(xp) || xp < 1 || xp > 1000) return fail('O XP deve ser um número inteiro de 1 a 1000.');
    if (!Number.isInteger(coins) || coins < 0 || coins > 10000) return fail('As moedas devem ser um número inteiro de 0 a 10000.');
    setError('');
    return await onSave({ kind: 'mission', title, description, xp, coins }) || fail('Não foi possível salvar. Confira se o servidor está rodando e tente de novo.');
  }

  return <GameDialog title="Nova missão" icon="mission" intro="Um desafio para a sua jornada no sítio." note="Salvo no servidor." submitLabel="Adicionar missão" error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="mission-title">Nome da missão<input id="mission-title" name="title" maxLength={60} autoFocus placeholder="Ex.: Concluir meu primeiro projeto"/></label>
    <label className="form-label" htmlFor="mission-description">Descrição curta<textarea id="mission-description" name="description" rows={2} maxLength={160} placeholder="O que precisa acontecer para cumprir?"/></label>
    <fieldset className="dialog-fieldset"><legend>Recompensa</legend>
      <ChoiceCards name="size" value={size} options={SIZES} onChange={setSize} compact/>
      {size === 'custom' && <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="form-label text-sm" htmlFor="mission-xp">XP<input id="mission-xp" name="xp" type="number" min={1} max={1000} defaultValue={30}/></label>
        <label className="form-label text-sm" htmlFor="mission-coins">Moedas<input id="mission-coins" name="coins" type="number" min={0} max={10000} defaultValue={15}/></label>
      </div>}
    </fieldset>
  </GameDialog>;
}
