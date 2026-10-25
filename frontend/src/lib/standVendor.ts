import { HARVEST_REWARD, WEEK_BONUS } from './harvestRewards';

/** O que o Seu Zé (vendedor da vendinha das Metas) sabe na hora da conversa */
export interface VendorContext { name: string; hour: number; done: string[]; pending: string[]; bestStreak: { title: string; days: number } | null }
export type VendorChoice = 'today' | 'streak' | 'tips' | 'story' | 'bye';

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const list = (items: string[]) => items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;

const STORIES = [
  'Uma vez cultivei uma abóbora tão grande que precisei de um carrinho de mão só pra ela.',
  'Meu boné é da sorte: desde que comecei a usar, nunca choveu na feira de domingo.',
  'O segredo da couve bonita? Conversar com ela. Eu juro.',
  'Tem um coelho que passa aqui todo fim de tarde. Acho que ele é meu cliente mais fiel.',
  'Antes de ter a vendinha, eu vendia limonada. Fali porque bebia tudo.',
];

export function vendorGreeting(context: VendorContext): string[] {
  const hello = context.hour < 12 ? 'Bom dia' : context.hour < 18 ? 'Boa tarde' : 'Boa noite';
  const first = `${hello}, ${context.name}! Eu sou o Seu Zé, cuido da vendinha de metas. 🌽`;
  const total = context.done.length + context.pending.length;
  if (total === 0) return [first, 'O balcão tá vazio hoje... Bora plantar uma meta pra eu ter o que vender?'];
  if (context.pending.length === 0) return [first, 'Olha só, todos os caixotes cheios! Banca linda hoje, viu?'];
  if (context.done.length === 0) return [first, `Tem ${total} caixote${total > 1 ? 's' : ''} esperando colheita. Quando estiver pronta, é só tocar neles!`];
  return [first, `Já foram ${context.done.length} de ${total} hoje. Tá indo bem!`];
}

export function vendorRespond(choice: VendorChoice, context: VendorContext): string[] {
  if (choice === 'today') {
    if (context.done.length + context.pending.length === 0) return ['Nenhuma meta pra hoje. Dia de descanso também é importante!'];
    if (!context.pending.length) return [`Você colheu tudo: ${list(context.done)}. Dá até vontade de fazer festa!`];
    return [
      context.done.length ? `Já colheu: ${list(context.done)}.` : 'Ainda não colheu nada hoje, mas o dia tá só começando.',
      `Falta: ${list(context.pending)}. Cada caixote cheio rende ${HARVEST_REWARD.coins} moedinhas!`,
    ];
  }
  if (choice === 'streak') {
    if (!context.bestStreak || context.bestStreak.days === 0) return ['Ainda não tem sequência... mas toda sequência começa no dia um!'];
    return [`Sua melhor sequência agora é de ${context.bestStreak.days} dias em "${context.bestStreak.title}".`, 'Não deixa a peteca cair, hein!'];
  }
  if (choice === 'tips') return [
    `Metas semanais zeram toda segunda. Bater a semana dá bônus de ${WEEK_BONUS.coins} moedas!`,
    'Metas de quantidade, tipo copos de água, enchem um pouquinho a cada toque.',
    'E se quiser ver o mês inteiro, dá uma olhada no calendário pendurado ali do lado.',
  ];
  if (choice === 'story') return [pick(STORIES)];
  return [pick(['Até mais! Volta pra colher amanhã. 🌻', 'Tchau! Cuida bem dessas metas.', 'Falou! A vendinha fica aqui te esperando.'])];
}

export const VENDOR_CHOICES: { id: VendorChoice; label: string }[] = [
  { id: 'today', label: 'Como estão minhas metas hoje?' },
  { id: 'streak', label: 'E a minha sequência?' },
  { id: 'tips', label: 'Tem alguma dica?' },
  { id: 'story', label: 'Me conta um causo!' },
  { id: 'bye', label: 'Tchau, Seu Zé!' },
];
