import { useState } from 'react';
import type { GoalArea, GoalFrequency, GoalIcon, GoalMeasure, GoalMode, NewTrackedGoal, TrackedGoal, Weekday } from '../../types/goals';
import { WEEKDAY_NAMES, WEEK_ORDER, fromKey } from '../../lib/goalLogic';
import { GOAL_AREAS, areaOf } from '../../lib/goalAreas';
import { PixelIcon } from '../PixelIcon';
import { ChoiceCards, GameDialog } from '../dialogs/GameDialog';

const ICONS: GoalIcon[] = ['leaf', 'book', 'water', 'flame', 'target', 'sun', 'coffee'];
const RHYTHMS: { value: GoalFrequency['kind']; label: string; hint: string }[] = [
  { value: 'daily', label: 'Todo dia', hint: 'Um cuidado diário que mantém a sequência.' },
  { value: 'weekly', label: 'X vezes na semana', hint: 'Cada check avança a barra. Reinicia na segunda.' },
  { value: 'weekdays', label: 'Dias escolhidos', hint: 'Só cobra nos dias que você marcar.' },
];
const MODES: { value: GoalMode; label: string; hint: string }[] = [
  { value: 'build', label: 'Criar um hábito', hint: 'Algo que você quer começar a fazer.' },
  { value: 'quit', label: 'Largar um hábito', hint: 'Algo que você quer parar de fazer, como comer açúcar.' },
];
const MEASURES: { value: GoalMeasure['kind']; label: string; hint: string }[] = [
  { value: 'check', label: 'Só marcar como feito', hint: 'Ex.: meditar, ler um capítulo.' },
  { value: 'quantity', label: 'Contar uma quantidade', hint: 'Ex.: beber 2000 ml de água.' },
];

/** Unidades comuns: meta sugerida e quanto cada "+" do card soma (automático, a pessoa não precisa escolher) */
const UNITS: { unit: string; target: number; step: number }[] = [
  { unit: 'ml', target: 2000, step: 250 },
  { unit: 'copos', target: 8, step: 1 },
  { unit: 'minutos', target: 30, step: 10 },
  { unit: 'páginas', target: 20, step: 5 },
  { unit: 'passos', target: 8000, step: 1000 },
  { unit: 'km', target: 5, step: 1 },
  { unit: 'vezes', target: 3, step: 1 },
];
const OTHER = 'outra';


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
  const [area, setArea] = useState<GoalArea>(areaOf(goal?.area));
  const [mode, setMode] = useState<GoalMode>(goal?.mode ?? 'build');
  // Campos de quantidade controlados para a frase de exemplo acompanhar o que é digitado
  const [target, setTarget] = useState(String(quantity?.target ?? 2000));
  // Unidade da lista ou "outra" (aí a pessoa escreve)
  const [unitChoice, setUnitChoice] = useState(quantity ? (UNITS.some(item => item.unit === quantity.unit) ? quantity.unit : OTHER) : 'ml');
  const [customUnit, setCustomUnit] = useState(quantity && !UNITS.some(item => item.unit === quantity.unit) ? quantity.unit : '');
  const unit = unitChoice === OTHER ? customUnit.trim() : unitChoice;
  // Quanto cada "+" soma: o da unidade (ou o que a meta já tinha, se a unidade não mudou); em unidade própria, 1/5 da meta
  const preset = UNITS.find(item => item.unit === unitChoice);
  const step = quantity && quantity.unit === unit ? Math.min(quantity.step, Math.max(1, Number(target) || 1))
    : preset ? Math.min(preset.step, Math.max(1, Number(target) || 1)) : Math.max(1, Math.round((Number(target) || 1) / 5));
  // Trocar a unidade já traz uma meta comum para ela
  function chooseUnit(choice: string) {
    setUnitChoice(choice);
    const next = UNITS.find(item => item.unit === choice);
    if (next) setTarget(String(next.target));
  }
  const quitting = mode === 'quit';
  const [error, setError] = useState('');

  const toggleDay = (day: Weekday) => setDays(current => current.includes(day) ? current.filter(item => item !== day) : [...current, day]);
  const fail = (message: string) => { setError(message); return false; };

  function submit(data: FormData) {
    const title = String(data.get('title') ?? '').trim();
    if (!title) return fail(quitting ? 'Diga o que você quer largar.' : 'Dê um nome para a sua plantação.');

    // Largar um hábito: todo dia, com um check "evitei hoje"
    if (quitting) {
      onSave({ title, icon: (data.get('icon') as GoalIcon) ?? 'leaf', frequency: { kind: 'daily' }, measure: { kind: 'check' }, area, mode });
      return true;
    }

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
      if (!Number.isInteger(target) || target < 1 || target > 100000) return fail('A meta do dia deve ser um número inteiro de 1 a 100000.');
      if (!unit) return fail('Diga a unidade (copos, minutos, páginas...).');
      measure = { kind: 'quantity', target, step, unit };
    }

    onSave({ title, icon: (data.get('icon') as GoalIcon) ?? 'leaf', frequency, measure, area, mode });
    return true;
  }

  return <GameDialog title={editing ? 'Editar meta' : 'Plantar nova meta'} icon="leaf"
    intro={goal ? `Plantada em ${plantedOn.format(fromKey(goal.createdOn))}. O histórico de colheitas continua igual.` : 'Uma nova semente para o seu canteiro.'}
    submitLabel={editing ? 'Salvar alterações' : 'Plantar'} error={error} onSubmit={submit} onClose={onClose}>
    <fieldset className="dialog-fieldset"><legend>Tipo de meta</legend>
      <ChoiceCards name="mode" value={mode} options={MODES} onChange={setMode} compact/>
    </fieldset>

    <label className="form-label" htmlFor="goal-title">{quitting ? 'O que você quer largar?' : 'Nome da meta'}<input id="goal-title" name="title" maxLength={60} autoFocus defaultValue={goal?.title} placeholder={quitting ? 'Ex.: Comer açúcar' : 'Ex.: Ler 20 páginas'}/></label>
    {quitting && <p className="text-xs text-muted">Todo dia você marca "Evitei hoje" e o contador de dias sem vai subindo. Se escorregar, é só registrar a recaída e recomeçar.</p>}

    <fieldset className="dialog-fieldset"><legend>Semente</legend>
      <div className="icon-picker">{ICONS.map((icon, index) => <label key={icon} className="icon-option"><input type="radio" name="icon" value={icon} defaultChecked={goal ? goal.icon === icon : index === 0}/><span><PixelIcon name={icon} className="size-5"/></span><span className="sr-only">{icon}</span></label>)}</div>
    </fieldset>

    {!quitting && <fieldset className="dialog-fieldset"><legend>Ritmo</legend>
      <ChoiceCards name="rhythm" value={rhythm} options={RHYTHMS} onChange={setRhythm}/>
      {rhythm === 'weekly' && <label className="form-label mt-3" htmlFor="goal-times">Quantas vezes por semana?<input id="goal-times" name="times" type="number" min={1} max={7} step={1} defaultValue={goal?.frequency.kind === 'weekly' ? goal.frequency.timesPerWeek : 3}/></label>}
      {rhythm === 'weekdays' && <div className="day-picker" role="group" aria-label="Dias da semana">{WEEK_ORDER.map(day => <button key={day} type="button" className="day-toggle" aria-pressed={days.includes(day)} onClick={()=>toggleDay(day)}>{WEEKDAY_NAMES[day]}</button>)}</div>}
    </fieldset>}

    {!quitting && rhythm !== 'weekly' && <fieldset className="dialog-fieldset"><legend>Como você vai marcar?</legend>
      <ChoiceCards name="measure" value={measureKind} options={MEASURES} onChange={setMeasureKind} compact/>
      {/* Uma linha só: quanto por dia e a unidade */}
      {measureKind === 'quantity' && <div className="quantity-setup">
        <div className="form-label text-sm">Quanto por dia?
          <div className="quantity-goal">
            <input id="goal-target" name="target" type="number" min={1} max={100000} value={target} onChange={event=>setTarget(event.target.value)} aria-label="Quantidade por dia"/>
            <select value={unitChoice} onChange={event=>chooseUnit(event.target.value)} aria-label="Unidade">
              {UNITS.map(item => <option key={item.unit} value={item.unit}>{item.unit}</option>)}
              <option value={OTHER}>outra…</option>
            </select>
            {unitChoice === OTHER && <input value={customUnit} maxLength={16} onChange={event=>setCustomUnit(event.target.value)} placeholder="ex.: xícaras" aria-label="Qual unidade?"/>}
          </div>
        </div>
      </div>}
    </fieldset>}

    <fieldset className="dialog-fieldset"><legend>Área da meta <span className="optional-tag">(opcional)</span></legend>
      <div className="area-picker" role="radiogroup" aria-label="Área da meta">{GOAL_AREAS.map(item => <button key={item.value} type="button" role="radio" aria-checked={area === item.value} className="day-toggle area-chip" onClick={()=>setArea(item.value)}>{item.label}</button>)}</div>
    </fieldset>
  </GameDialog>;
}
