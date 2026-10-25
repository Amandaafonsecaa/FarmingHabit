import { useState } from 'react';
import type { NewItem } from '../../types/world';
import { ChoiceCards, GameDialog } from './GameDialog';

type Tier = 'treat' | 'gift' | 'present' | 'custom';
const PRICES: Record<Exclude<Tier, 'custom'>, number> = { treat: 30, gift: 80, present: 150 };
const TIERS: { value: Tier; label: string; hint: string }[] = [
  { value: 'treat', label: 'Mimo', hint: '30 moedas' },
  { value: 'gift', label: 'Agrado', hint: '80 moedas' },
  { value: 'present', label: 'Presente', hint: '150 moedas' },
  { value: 'custom', label: 'Personalizado', hint: 'Você define o preço.' },
];

/** Nova compra da loja: nome da recompensa e quanto custa em moedas */
export function RewardDialog({ onSave, onClose }: { onSave: (item: Extract<NewItem, { kind: 'reward' }>) => Promise<boolean>; onClose: () => void }) {
  const [tier, setTier] = useState<Tier>('gift');
  const [error, setError] = useState('');
  const fail = (message: string) => { setError(message); return false; };

  async function submit(data: FormData) {
    const title = String(data.get('title') ?? '').trim();
    if (!title) return fail('Dê um nome para a recompensa.');
    const price = tier === 'custom' ? Number(data.get('price')) : PRICES[tier];
    if (!Number.isInteger(price) || price < 1 || price > 10000) return fail('O preço deve ser um número inteiro de 1 a 10000 moedas.');
    setError('');
    return await onSave({ kind: 'reward', title, price }) || fail('Não foi possível salvar. Confira se o servidor está rodando e tente de novo.');
  }

  return <GameDialog title="Nova compra" icon="coin" intro="Um carinho para trocar pelas moedas que você colheu." submitLabel="Adicionar compra" error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="reward-title">Nome da recompensa<input id="reward-title" name="title" maxLength={60} autoFocus placeholder="Ex.: Café especial"/></label>
    <fieldset className="dialog-fieldset"><legend>Preço</legend>
      <ChoiceCards name="tier" value={tier} options={TIERS} onChange={setTier} compact/>
      {tier === 'custom' && <label className="form-label mt-3 text-sm" htmlFor="reward-price">Preço em moedas<input id="reward-price" name="price" type="number" min={1} max={10000} defaultValue={50}/></label>}
    </fieldset>
  </GameDialog>;
}
