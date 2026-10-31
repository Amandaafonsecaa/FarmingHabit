/** Anotações do caderno das Missões: dúvidas comuns, respondidas na voz do Capitão Bússola */
export interface AdventureNote { id: string; question: string; answer: string[] }

export const ADVENTURE_NOTES: AdventureNote[] = [
  {
    id: 'meta-ou-missao',
    question: 'Qual a diferença entre meta e missão?',
    answer: [
      'Meta é o que você cultiva sempre: ler, treinar, alongar. Ela volta todo dia (ou algumas vezes por semana), e cada dia cumprido rende moedas e XP.',
      'Missão é uma aventura de uma vez só: lavar o carro, achar uma concha na praia. Cumpriu, ganhou o carimbo, e o pergaminho vai para as cumpridas.',
      'Regra de bordo, marujo: se repete, é meta. Se tem fim, é missão.',
    ],
  },
  {
    id: 'decidir-missao',
    question: 'Como decido se algo vira missão?',
    answer: [
      'Pergunte a si mesmo: dá para riscar da lista e dizer "pronto, feito"? Então é missão.',
      'Boas missões são concretas e cabem num dia ou numa tarde. "Organizar a vida" é grande demais; "arrumar a gaveta da escrivaninha" é missão de verdade.',
      'Ideia grande? Corte em várias missões menores. Cada pergaminho cumprido é uma pequena vitória no mar.',
    ],
  },
  {
    id: 'tamanho-missao',
    question: 'Que tamanho dou para a missão?',
    answer: [
      'Passinho (+20 XP · 15 moedas): coisa rápida, de poucos minutos, que você vive adiando.',
      'Desafio (+50 XP · 30 moedas): pede uma boa hora de esforço ou um pouco de coragem.',
      'Conquista (+120 XP · 80 moedas): a grande aventura, que exige planejamento ou um dia inteiro.',
      'Seja honesto com o tamanho: o tesouro vale mais quando foi merecido.',
    ],
  },
];
