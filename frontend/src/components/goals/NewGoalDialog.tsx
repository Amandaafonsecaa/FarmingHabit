import { useState } from 'react';
import type { GoalArea, GoalFrequency, GoalIcon, GoalMeasure, NewTrackedGoal, TrackedGoal, Weekday } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, fromKey } from '../../lib/goalLogic';
import { PixelIcon } from '../PixelIcon';
import { ChoiceCards, GameDialog } from '../dialogs/GameDialog';

const ICONS: GoalIcon[] = ['leaf', 'book', 'water', 'flame', 'target', 'sun', 'coffee'];
const RHYTHMS: { value: GoalFrequency['kind']; label: string; hint: string }[] = [
  { value: 'daily', label: 'Todo dia', hint: 'Um cuidado diário que mantém a sequência.' },
  { value: 'weekly', label: 'X vezes na semana', hint: 'Cada check avança a barra. Reinicia na segunda.' },
  { value: 'weekdays', label: 'Dias escolhidos', hint: 'Só cobra nos dias que você marcar.' },
];
const MEASURES: { value: GoalMeasure['kind']; label: string; hint: string }[] = [
  { value: 'check', label: 'Check único', hint: 'Um toque conclui o dia.' },
  { value: 'quantity', label: 'Quantidade', hint: 'Ex.: 8 copos, 120 minutos.' },
];

const AREAS: { value: GoalArea; label: string }[] = [
  { value: 'saude', label: 'Saúde' }, { value: 'estudos', label: 'Estudos' }, { value: 'corpo', label: 'Corpo' },
  { value: 'pessoal', label: 'Vida pessoal' }, { value: 'lazer', label: 'Lazer' },
  { value: 'nenhuma', label: 'Sem categoria' },
];

const plantedOn = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

/**
 * Formulário de meta com ritmo (frequência), medida (check único ou quantidade) e área opcional.
 * Sem `goal`, planta uma meta nova; com `goal`, abre já preenchido para editar todas as informações dela.
 */
export function NewGoalDialog({ goal, onSave, onClose }: { goal?: TrackedGoal; onSave: (goal: NewTrackedGoal) => void; onClose: () => void }) {
  const editing = Boolean(goal);
  const quantity = goal?.measure.kind === 'quantity' ? goal.measure : null;
  const [rhythm, setRhythm] = useState<GoalFrequency['kind']>(goal?.frequency.kind ?? 'daily');
  const [measureKind, setMeasureKind] = useState<GoalMeasure['kind']>(goal?.measure.kind ?? 'check');
  const [days, setDays] = useState<Weekday[]>(goal?.frequency.kind === 'weekdays' ? goal.frequency.days : [1, 3, 5]);
  // Área que não existe mais na lista (ex.: a antiga "Outra") abre como "Sem categoria"
  const [area, setArea] = useState<GoalArea>(AREAS.some(item => item.value === goal?.area) ? goal!.area! : 'nenhuma');
  const [error, setError] = useState('');

  const toggleDay = (day: Weekday) => setDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day]);
  const fail = (message: string) => { setError(message); return false; };

  function submit(data: FormData) {
    const title = String(data.get('title') ?? '').trim();
    if (!title) return fail('Dê um nome para a sua plantação.');

    let frequency: GoalFrequency = { kind: 'daily' };
    if (rhythm === 'weekly') {
      const times = Number(data.get('times'));
      if (!Number.isInteger(times) || times < 1 || times > 7) return fail('Escolha de 1 a 7 vezes por semana.');
      frequency = { kind: 'weekly', timesPerWeek: times };
    } else if (rhythm === 'weekdays') {
      if (days.length === 0) return fail('Marque pelo menos um dia da semana.');
      frequency = { kind: 'weekdays', days: [...days].sort((a, b) => a - b) };
    }

    // Semanais contam checks por dia; quantidade vale para diárias e dias escolhidos
    let measure: GoalMeasure = { kind: 'check' };
    if (rhythm !== 'weekly' && measureKind === 'quantity') {
      const target = Number(data.get('target'));
      const step = Number(data.get('step'));
      const unit = String(data.get('unit') ?? '').trim();
      if (!Number.isInteger(target) || target < 1 || target > 10000) return fail('A quantidade diária deve ser um número inteiro de 1 a 10000.');
      if (!Number.isInteger(step) || step < 1 || step > target) return fail('Cada toque deve somar entre 1 e a meta do dia.');
      if (!unit) return fail('Diga a unidade (copos, minutos, páginas...).');
      measure = { kind: 'quantity', target, step, unit };
    }

    onSave({ title, icon: (data.get('icon') as GoalIcon) ?? 'leaf', frequency, measure, area });
    return true;
  }

  return <GameDialog title={editing ? 'Editar meta' : 'Plantar nova meta'} icon="leaf"
    intro={goal ? `Plantada em ${plantedOn.format(fromKey(goal.createdOn))}. O histórico de colheitas continua igual.` : 'Uma nova semente para o seu canteiro.'}
    submitLabel={editing ? 'Salvar alterações' : 'Plantar'} error={error} onSubmit={submit} onClose={onClose}>
    <label className="form-label" htmlFor="goal-title">Nome da meta<input id="goal-title" name="title" maxLength={60} autoFocus defaultValue={goal?.title} placeholder="Ex.: Ler 20 páginas"/></label>

    <fieldset className="dialog-fieldset"><legend>Semente</legend>
      <div className="icon-picker">{ICONS.map((icon, index) => <label key={icon} className="icon-option"><input type="radio" name="icon" value={icon} defaultChecked={goal ? goal.icon === icon : index === 0}/><span><PixelIcon name={icon} className="size-5"/></span><span className="sr-only">{icon}</span></label>)}</div>
    </fieldset>

    <fieldset className="dialog-fieldset"><legend>Ritmo</legend>
      <ChoiceCards name="rhythm" value={rhythm} options={RHYTHMS} onChange={setRhythm}/>
      {rhythm === 'weekly' && <label className="form-label mt-3" htmlFor="goal-times">Quantas vezes por semana?<input id="goal-times" name="times" type="number" min={1} max={7} step={1} defaultValue={goal?.frequency.kind === 'weekly' ? goal.frequency.timesPerWeek : 3}/></label>}
      {rhythm === 'weekdays' && <div className="day-picker" role="group" aria-label="Dias da semana">{WEEK_ORDER.map(day => <button key={day} type="button" className="day-toggle" aria-pressed={days.includes(day)} onClick={()=>toggleDay(day)}>{WEEKDAY_NAMES[day]}</button>)}</div>}
    </fieldset>

    {rhythm !== 'weekly' && <fieldset className="dialog-fieldset"><legend>Como colher</legend>
      <ChoiceCards name="measure" value={measureKind} options={MEASURES} onChange={setMeasureKind} compact/>
      {measureKind === 'quantity' && <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="form-label text-sm" htmlFor="goal-target">Meta/dia<input id="goal-target" name="target" type="number" min={1} max={10000} defaultValue={quantity?.target ?? 8}/></label>
        <label className="form-label text-sm" htmlFor="goal-unit">Unidade<input id="goal-unit" name="unit" maxLength={16} defaultValue={quantity?.unit ?? 'copos'}/></label>
        <label className="form-label text-sm" htmlFor="goal-step">Por toque<input id="goal-step" name="step" type="number" min={1} defaultValue={quantity?.step ?? 1}/></label>
      </div>}
    </fieldset>}

    <fieldset className="dialog-fieldset"><legend>Área da meta <span className="optional-tag">(opcional)</span></legend>
      <div className="area-picker" role="radiogroup" aria-label="Área da meta">{AREAS.map(item => <button key={item.value} type="button" role="radio" aria-checked={area === item.value} className="day-toggle area-chip" onClick={()=>setArea(item.value)}>{item.label}</button>)}</div>
    </fieldset>
  </GameDialog>;
}
