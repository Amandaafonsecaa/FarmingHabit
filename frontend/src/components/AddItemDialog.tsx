import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { NewItem, ItemKind } from '../types/world';
import { PixelIcon } from './PixelIcon';
const titles: Record<ItemKind, string> = { goal: 'Adicionar meta', mission: 'Adicionar missão', reward: 'Adicionar compra' };
export function AddItemDialog({ kind, onSave, onClose }: { kind: ItemKind; onSave: (item: NewItem) => void; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus(); };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    if (!title || (kind !== 'reward' && !description)) { setError('Preencha os campos com mais do que espaços.'); return; }
    if (kind === 'goal') onSave({ kind, title, description });
    else {
      const amount = Number(data.get('amount'));
      const max = kind === 'mission' ? 1000 : 10000;
      if (!Number.isInteger(amount) || amount < 1 || amount > max) { setError(`Informe um valor inteiro entre 1 e ${max}.`); return; }
      if (kind === 'mission') {
        const coins = Number(data.get('coins'));
        if (!Number.isInteger(coins) || coins < 0 || coins > 10000) { setError('Informe entre 0 e 10000 moedas.'); return; }
        onSave({ kind, title, description, xp: amount, coins });
      }
      else onSave({ kind, title, price: amount });
    }
  }

  return <dialog ref={dialogRef} className="pixel-dialog pixel-frame" aria-labelledby="add-dialog-title" onCancel={event=>{ event.preventDefault(); onClose(); }}>
    <header className="panel-heading"><h2 id="add-dialog-title"><PixelIcon name="plus"/>{titles[kind]}</h2><button className="pixel-button" type="button" aria-label="Fechar formulário" onClick={onClose}><PixelIcon name="close" className="size-3"/></button></header>
    <form className="space-y-4 p-5" onSubmit={submit}><p className="text-sm">Uma nova ideia para o seu pequeno jardim.</p>
      <label className="form-label" htmlFor="item-title">{kind === 'reward' ? 'Nome da recompensa' : 'Título'}<input id="item-title" name="title" required maxLength={60} autoFocus placeholder={kind === 'goal' ? 'O que você quer cultivar?' : kind === 'mission' ? 'Qual será o próximo passo?' : 'Um carinho para você'}/></label>
      {kind !== 'reward' && <label className="form-label" htmlFor="item-description">Descrição curta<textarea id="item-description" name="description" rows={2} required maxLength={160}/></label>}
      {kind === 'mission' && <label className="form-label" htmlFor="item-coins">Recompensa em moedas<input id="item-coins" name="coins" type="number" min={0} max={10000} step={1} required defaultValue={50}/></label>}
      {kind !== 'goal' && <label className="form-label" htmlFor="item-amount">{kind === 'mission' ? 'Recompensa em XP' : 'Preço em moedas'}<input id="item-amount" name="amount" type="number" min={1} max={kind === 'mission' ? 1000 : 10000} step={1} required defaultValue={kind === 'mission' ? 30 : 50}/></label>}
      {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
      <p className="text-sm text-muted">Salvo apenas nesta sessão. Recarregar restaura os dados iniciais.</p>
      <div className="flex justify-end gap-3 border-t border-line pt-3"><button type="button" className="pixel-button" onClick={onClose}>Cancelar</button><button type="submit" className="pixel-button primary-button">Adicionar</button></div>
    </form>
  </dialog>;
}
