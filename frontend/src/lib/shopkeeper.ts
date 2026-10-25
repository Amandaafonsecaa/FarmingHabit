import type { Reward } from '../types/world';

/** O que o Bigode sabe sobre o jogador na hora da conversa */
export interface ShopContext { name: string; coins: number; rewards: Reward[]; wish: Reward | null; lastPurchase: string | null; hour: number }
export type ChoiceId = 'recommend' | 'earn' | 'wish' | 'gossip' | 'bye';

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const GOSSIP = [
  'Dizem que o Yeti das montanhas é vegetariano. Eu já vi ele comprando cenoura!',
  'O dragão do castelo ronca em dó maior. Dá até pra cantar junto.',
  'A bruxa da floresta me deve 3 moedas desde o verão passado... mas ela é gentil, eu deixo.',
  'Eu era um gato de rua. Hoje sou um gato de negócios. Grande diferença: agora tenho avental.',
  'Uma vez tentei vender peixe. Comi o estoque inteiro antes do almoço.',
  'Cá entre nós: a galinha do galpão é quem manda no sítio.',
  'Ouvi dizer que tem baús escondidos pela jornada das missões... 👀',
];

/** Primeira fala: muda com a hora, o saldo e a última compra */
export function greeting(context: ShopContext): string[] {
  const hello = context.hour < 12 ? 'Bom dia' : context.hour < 18 ? 'Boa tarde' : 'Boa noite';
  const first = `${hello}, ${context.name}! Boas-vindas ao armazém. Eu sou o Bigode. 🐾`;
  const cheapest = Math.min(...context.rewards.map(reward => reward.price));
  if (context.lastPurchase && Math.random() < 0.5) return [first, `E aí, aproveitou o ${context.lastPurchase}? Espero que tenha sido um mimo daqueles!`];
  if (context.coins === 0) return [first, 'Bolsos vazios hoje? Sem problema, olhar é de graça!'];
  if (context.rewards.length && context.coins >= cheapest) return [first, `Tô vendo ${context.coins} moedinhas brilhando aí... Quer dar uma olhada na vitrine?`];
  return [first, 'Fica à vontade, tá tudo fresquinho!'];
}

/** Resposta do Bigode para cada opção escolhida */
export function respond(choice: ChoiceId, context: ShopContext): string[] {
  if (choice === 'recommend') {
    if (!context.rewards.length) return ['A vitrine tá vazia! Toca em "Nova recompensa" e eu coloco na prateleira rapidinho.'];
    const affordable = context.rewards.filter(reward => reward.price <= context.coins).sort((a, b) => b.price - a.price);
    if (affordable.length) return [`Com ${context.coins} moedas, eu levaria o "${affordable[0].name}". É um dos meus favoritos!`, 'Mas não conta pros outros produtos que eu falei isso. 🤫'];
    const closest = [...context.rewards].sort((a, b) => a.price - b.price)[0];
    return [`Hmm... o "${closest.name}" sai por ${closest.price} moedas.`, `Faltam só ${closest.price - context.coins}! Uma ou duas missões e ele é seu.`];
  }
  if (choice === 'earn') return [
    'Missões cumpridas pagam em moedas! Quanto maior a aventura, mais moedinhas.',
    'E dizem que pela jornada aparecem baús com moedas e coisas raras... 🎁',
    'Ah, e manter as metas em dia deixa a horta linda. Não paga moeda, mas paga em felicidade!',
  ];
  if (choice === 'wish' && context.wish) {
    const missing = context.wish.price - context.coins;
    return missing <= 0
      ? [`O "${context.wish.name}"? Você já tem moedas pra ele! O que tá esperando? 😸`]
      : [`O "${context.wish.name}"... ótima escolha.`, `Faltam ${missing} moedas. Eu guardo ele aqui atrás do balcão pra você, prometo!`];
  }
  if (choice === 'gossip') return [pick(GOSSIP)];
  return [pick(['Volte sempre! Miau. 🐾', 'Até mais! Cuide bem da sua horta.', 'Tchauzinho! A prateleira vai sentir sua falta.'])];
}

export function choicesFor(context: ShopContext): { id: ChoiceId; label: string }[] {
  return [
    { id: 'recommend', label: 'O que você recomenda?' },
    { id: 'earn', label: 'Como eu ganho moedas?' },
    ...(context.wish ? [{ id: 'wish' as const, label: `E o meu desejo? (${context.wish.name})` }] : []),
    { id: 'gossip', label: 'Me conta uma fofoca!' },
    { id: 'bye', label: 'Tchau, Bigode!' },
  ];
}
