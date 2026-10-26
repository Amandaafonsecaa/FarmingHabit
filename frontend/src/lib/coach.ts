import type { GoalLog, TrackedGoal } from '../types/goals';
import { WEEK_ORDER, addDays, amountOn, dailyTarget, frequencyLabel, isDoneOn, isScheduled, longestStreak, startOfWeek, streakFor, toKey, weekChecks, weekTarget } from './goalLogic';

/** Como uma meta está na semana atual (seg → hoje) */
export interface GoalWeek {
  goal: TrackedGoal;
  /** Dias cumpridos na semana */
  done: number;
  /** Quanto a semana pede no total */
  target: number;
  /** Quanto já deveria ter sido feito nos dias que já terminaram, mais hoje se já foi feito (semanais: proporcional) */
  expected: number;
  /** Dias agendados que já passaram sem ser cumpridos (não vale para semanais) */
  missed: number;
  streak: number;
  best: number;
  doneToday: boolean;
  dueToday: boolean;
}

export function goalWeek(goal: TrackedGoal, log: GoalLog, today: Date): GoalWeek {
  const monday = startOfWeek(today);
  const todayKey = toKey(today);
  const days = WEEK_ORDER.map((_, index) => addDays(monday, index)).filter(day => toKey(day) <= todayKey && toKey(day) >= goal.createdOn);
  const done = weekChecks(goal, log, today);
  const target = weekTarget(goal);
  const weekly = goal.frequency.kind === 'weekly';
  const scheduled = weekly ? [] : days.filter(day => isScheduled(goal, day));
  // O dia de hoje ainda não acabou: só conta como "devido" se já foi feito
  const past = days.filter(day => toKey(day) !== todayKey);
  const pastExpected = weekly ? Math.floor(target * past.length / 7) : scheduled.filter(day => toKey(day) !== todayKey).length;
  return {
    goal, done, target,
    expected: Math.max(done, pastExpected),
    missed: scheduled.filter(day => toKey(day) !== todayKey && !isDoneOn(goal, log, day)).length,
    streak: streakFor(goal, log, today),
    best: longestStreak(goal, log, today),
    doneToday: isDoneOn(goal, log, today),
    dueToday: weekly ? done < target : isScheduled(goal, today),
  };
}

/** O que o Coach Rocha sabe na hora da conversa */
export interface CoachContext { name: string; weeks: GoalWeek[]; log: GoalLog; today: Date }
export type CoachChoice = 'analysis' | 'critique' | 'pick' | 'motivate' | 'back' | 'bye' | `goal:${string}`;

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const ratio = (week: GoalWeek) => week.expected ? week.done / week.expected : 1;
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function coachGreeting({ name, weeks }: CoachContext): string[] {
  const hello = `Fala, ${name}! Coach Rocha na área. 💪`;
  if (!weeks.length) return [hello, 'Cadê as metas? Sem meta não tem treino. Vai lá nas Metas e cadastra pelo menos uma. AGORA!'];
  const due = weeks.filter(week => week.dueToday);
  const left = due.filter(week => !week.doneToday).length;
  if (!due.length) return [hello, 'Hoje não tem meta no plano. Descanso também é treino, mas amanhã eu te quero com tudo!'];
  if (!left) return [hello, 'Todas as metas de hoje no papo. Isso é disciplina! Quer que eu analise a semana?'];
  return [hello, `Ainda faltam ${plural(left, 'meta', 'metas')} hoje. Nada de desculpa: levanta e resolve!`];
}

export function coachRespond(choice: CoachChoice, context: CoachContext): string[] {
  const { weeks } = context;
  if (!weeks.length && choice !== 'bye') return ['Não tem o que analisar ainda, campeão. Cria uma meta e volta aqui que eu te cobro!'];

  if (choice === 'analysis') {
    const done = weeks.reduce((sum, week) => sum + week.done, 0);
    const expected = weeks.reduce((sum, week) => sum + week.expected, 0);
    if (!expected) {
      const today = weeks.filter(week => week.dueToday && !week.doneToday).length;
      return ['A semana tá começando agora, ainda não tem o que cobrar.', today ? `Hoje tem ${plural(today, 'meta', 'metas')} esperando. Começa forte que o resto vem!` : 'Hoje tá tudo em dia. Mantém essa pegada a semana inteira!'];
    }
    const percent = Math.round(Math.min(1, done / expected) * 100);
    const sorted = [...weeks].sort((a, b) => ratio(b) - ratio(a));
    const best = sorted[0], worst = sorted[sorted.length - 1];
    const lines = [`Semana até agora: ${done} de ${expected} check-ins que já dava para ter feito. Isso é ${percent}%.`];
    if (sorted.length > 1 && ratio(best) > ratio(worst)) {
      lines.push(`Destaque: "${best.goal.title}", ${best.done}/${best.target} na semana. Tá voando nessa!`);
      lines.push(`Ponto fraco: "${worst.goal.title}", ${worst.done}/${worst.target}. É aí que a gente vai trabalhar.`);
    }
    lines.push(percent >= 80 ? 'Nível atleta. Mantém o ritmo e não relaxa!'
      : percent >= 50 ? 'Tá no caminho, mas eu sei que dá para apertar mais. Sobe a intensidade!'
      : 'Semana fraca. Não quero desculpa: amanhã você recupera. Uma meta de cada vez!');
    return lines;
  }

  if (choice === 'critique') {
    const lines: string[] = [];
    const missed = [...weeks].filter(week => week.missed > 0).sort((a, b) => b.missed - a.missed);
    if (missed[0]) lines.push(`"${missed[0].goal.title}" ficou para trás ${plural(missed[0].missed, 'vez', 'vezes')} essa semana. Marca um horário fixo e cumpre. Sem negociar com a preguiça.`);
    const fallen = weeks.find(week => week.streak === 0 && week.best >= 3);
    if (fallen) lines.push(`Em "${fallen.goal.title}" você já fez ${fallen.best} seguidos. Você SABE fazer. Então volta a fazer!`);
    const behindWeekly = weeks.find(week => week.goal.frequency.kind === 'weekly' && week.done < week.expected);
    if (behindWeekly) lines.push(`"${behindWeekly.goal.title}" é ${frequencyLabel(behindWeekly.goal)} e você tá em ${behindWeekly.done}. Não deixa tudo para o fim de semana!`);
    const total = weeks.reduce((sum, week) => sum + week.done, 0) / Math.max(1, weeks.reduce((sum, week) => sum + week.expected, 0));
    if (weeks.length > 5 && total < .5) lines.push(`${weeks.length} metas e menos da metade feita. Muita meta, pouca execução. Foca em 3 e domina elas primeiro.`);
    if (!lines.length) return ['Crítica? Tá difícil achar. Você tá cumprindo tudo.', 'Então o recado é: aumenta o desafio. Conforto não constrói ninguém!'];
    return [...lines, 'Isso não é bronca, é treino. Corrige e segue!'];
  }

  if (choice === 'pick') return ['Fala qual meta. Eu analiso sem dó!'];
  if (choice === 'back') return ['Beleza. O que mais?'];

  if (choice.startsWith('goal:')) {
    const week = weeks.find(item => `goal:${item.goal.id}` === choice);
    if (!week) return ['Essa meta não existe mais. Próxima!'];
    const { goal } = week;
    const lines = [`"${goal.title}" (${frequencyLabel(goal).toLowerCase()}): ${week.done} de ${week.target} na semana.`];
    lines.push(goal.frequency.kind === 'weekly'
      ? `Sequência: ${plural(week.streak, 'semana batida', 'semanas batidas')} seguidas. Recorde: ${week.best}.`
      : `Sequência atual: ${plural(week.streak, 'dia', 'dias')}. Seu recorde é ${week.best}.`);
    if (goal.measure.kind === 'quantity') {
      const amount = amountOn(goal, context.log, toKey(context.today));
      lines.push(`Hoje: ${amount}/${dailyTarget(goal)} ${goal.measure.unit}. ${amount >= dailyTarget(goal) ? 'Feito!' : 'Completa essa conta!'}`);
    }
    lines.push(week.done >= week.target ? 'Meta da semana BATIDA. Agora sobe a régua: mais desafio!'
      : week.missed > 0 ? `Você furou ${plural(week.missed, 'dia', 'dias')}. Prepara tudo na véspera e não deixa para depois. Executa!`
      : week.streak > 0 && week.streak >= week.best ? 'Você tá no seu recorde. Não quebra essa corrente de jeito nenhum!'
      : week.dueToday && !week.doneToday ? 'Hoje ainda dá tempo. Vai lá e marca essa!'
      : 'No ritmo certo. Mantém a constância que o resultado vem!');
    return lines;
  }

  if (choice === 'motivate') return [pick([
    'Motivação é para quem espera. Você é de AÇÃO. Levanta e faz!',
    'Disciplina vence talento quando o talento não treina. Bora!',
    'Uma rep de cada vez. Uma meta de cada vez. Sem parar!',
    'Não precisa ser perfeito. Precisa ser FEITO!',
    'Cansou? Ótimo. É exatamente aí que o resultado começa.',
    'Ninguém vai fazer por você. Assume o controle e executa!',
  ])];

  return [pick(['Vai lá e esmaga! 💪', 'Sem desculpa, hein? Te vejo amanhã!', 'Foco, força e constância. Até mais, campeão!'])];
}

export function coachChoices(mode: 'main' | 'goals', weeks: GoalWeek[]): { id: CoachChoice; label: string }[] {
  if (mode === 'goals') return [
    ...weeks.map(week => ({ id: `goal:${week.goal.id}` as CoachChoice, label: week.goal.title })),
    { id: 'back', label: 'Voltar' },
  ];
  return [
    { id: 'analysis', label: 'Analisa minha semana' },
    { id: 'critique', label: 'Me dá uma crítica sincera' },
    { id: 'pick', label: 'Analisa uma meta específica' },
    { id: 'motivate', label: 'Me motiva!' },
    { id: 'bye', label: 'Valeu, coach!' },
  ];
}
