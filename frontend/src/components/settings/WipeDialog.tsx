import { useState } from 'react';
import { GameDialog } from '../dialogs/GameDialog';
import { PixelIcon } from '../PixelIcon';
import { resetPlayerData, type ResetScope } from '../../services/api';

/** "examples" só existe no navegador; as outras partes também são apagadas no servidor */
export type WipePart = ResetScope | 'examples';

const GOALS_KEY = 'farminghabit.goals.v1';
const CONFIRM_WORD = 'APAGAR';
/** Aviso que sobrevive ao recarregar a página (o toast aparece depois do reload) */
export const WIPE_FLASH_KEY = 'farminghabit.wipe-flash';

/** O que cada parte leva junto neste navegador (a sincronização apaga o mesmo na conta) */
const LOCAL_KEYS_BY_PART: Record<WipePart, string[]> = {
  goals: ['farminghabit.harvest-rewards.v1', 'farminghabit.perfect-day', 'farminghabit.quantity-last.v1'],
  examples: [],
  diary: ['farminghabit.diary.v1', 'farminghabit.adventures.v1'],
  missions: ['farminghabit.missions.accepted.v1'],
  shop: ['farminghabit.wish.v1', 'farminghabit.purchases.v1'],
  treasure: ['farminghabit.treasure.v1'],
  motivation: ['farminghabit.motivation-photo.v1'],
  progress: [],
};

const readGoals = () => { try { return JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null'); } catch { return null; } };
const isExample = (id: string) => id.startsWith('exemplo-');

function removeExampleGoals() {
  const state = readGoals();
  if (!state) return;
  const log = Object.fromEntries(Object.entries(state.log as Record<string, Record<string, number>>)
    .map(([day, entries]) => [day, Object.fromEntries(Object.entries(entries).filter(([id]) => !isExample(id)))]));
  localStorage.setItem(GOALS_KEY, JSON.stringify({ goals: state.goals.filter((goal: { id: string }) => !isExample(goal.id)), log }));
}

interface Props { playerId: string | null; examples: number; onBackup: () => void; onClose: () => void }

/**
 * Zona do espantalho: a pessoa marca só o que quer apagar (nada vem marcado) e confirma digitando APAGAR.
 * Primeiro apaga no servidor; só se der certo limpa o navegador e recarrega.
 */
export function WipeDialog({ playerId, examples, onBackup, onClose }: Props) {
  const [chosen, setChosen] = useState<Set<WipePart>>(new Set());
  const [error, setError] = useState('');

  const parts: { value: WipePart; label: string; hint: string }[] = [
    { value: 'goals', label: 'Metas', hint: 'Todas as metas, o histórico e as colheitas' },
    ...(examples > 0 ? [{ value: 'examples' as const, label: 'Metas de exemplo', hint: `Só as ${examples} de exemplo e o histórico inventado` }] : []),
    { value: 'diary', label: 'Diário e aventuras', hint: 'Páginas do diário e o quadro de aventuras' },
    { value: 'missions', label: 'Missões', hint: 'Missões criadas e cumpridas' },
    { value: 'shop', label: 'Loja', hint: 'Compras, itens próprios e o cofrinho' },
    { value: 'treasure', label: 'Baús e coleção', hint: 'Baús abertos e itens colecionados' },
    { value: 'motivation', label: 'Motivação', hint: 'Frase do quadro e foto do porta-retrato' },
    { value: 'progress', label: 'Nível, XP e moedas', hint: 'Volta para o nível 1 com 0 moedas' },
  ];

  function toggle(part: WipePart) {
    setError('');
    setChosen(current => {
      const next = new Set(current);
      if (next.has(part)) next.delete(part); else next.add(part);
      return next;
    });
  }

  async function wipe(data: FormData) {
    if (!chosen.size) { setError('Marque pelo menos uma coisa para apagar.'); return false; }
    if (String(data.get('confirm') ?? '').trim().toUpperCase() !== CONFIRM_WORD) { setError(`Digite ${CONFIRM_WORD} para confirmar.`); return false; }
    // "Metas" já inclui as de exemplo
    const serverScopes = [...chosen].filter((part): part is ResetScope => part !== 'examples');
    if (serverScopes.length) {
      if (!playerId) { setError('O servidor está fora do ar. Tente de novo quando ele voltar.'); return false; }
      try { await resetPlayerData(playerId, serverScopes); }
      catch (reason) { setError(`Não foi possível apagar: ${reason instanceof Error ? reason.message : 'erro desconhecido'}`); return false; }
    }
    if (chosen.has('goals')) localStorage.setItem(GOALS_KEY, JSON.stringify({ goals: [], log: {} })); // vazio de propósito: senão os exemplos voltam
    else if (chosen.has('examples')) removeExampleGoals();
    chosen.forEach(part => LOCAL_KEYS_BY_PART[part].forEach(key => localStorage.removeItem(key)));
    const labels = parts.filter(part => chosen.has(part.value)).map(part => part.label);
    try { sessionStorage.setItem(WIPE_FLASH_KEY, `Apagado: ${labels.join(', ')}.`); } catch { /* sem aviso, sem problema */ }
    window.location.reload();
    return true;
  }

  return <GameDialog title="Zona do espantalho" icon="close" intro="Marque o que vai embora. Sua conta, seu personagem e suas preferências ficam."
    submitLabel={chosen.size ? `Apagar (${chosen.size})` : 'Apagar'} busyLabel="Apagando..." destructive error={error} onClose={onClose} onSubmit={wipe}>
    <ul className="wipe-options" aria-label="O que apagar">{parts.map(part => {
      // Com "Metas" marcado, as de exemplo já vão junto
      const covered = part.value === 'examples' && chosen.has('goals');
      return <li key={part.value}>
        <label className="wipe-option">
          <input type="checkbox" checked={covered || chosen.has(part.value)} disabled={covered} onChange={()=>toggle(part.value)}/>
          <span className="wipe-check" aria-hidden="true"><PixelIcon name="close" className="size-3"/></span>
          <span className="wipe-text"><strong>{part.label}</strong><small>{part.hint}</small></span>
        </label>
      </li>;
    })}</ul>
    <div className="wipe-confirm">
      <label htmlFor="wipe-confirm">Digite <strong>{CONFIRM_WORD}</strong> para confirmar</label>
      <input id="wipe-confirm" name="confirm" className="settings-input" autoComplete="off" spellCheck={false} onChange={()=>setError('')}/>
    </div>
    <button type="button" className="pixel-button wipe-backup" onClick={onBackup}><PixelIcon name="check" className="size-3"/>Baixar backup antes</button>
  </GameDialog>;
}
