/**
 * Vitrine fixa do armazém: itens globais (sem dono) disponíveis para todos os jogadores.
 * É sincronizada com o banco ao subir o servidor (upsert pela `key`), então mudar preço aqui atualiza a loja.
 * Preços pensados para ~30 moedas por dia: mimos pequenos em 2–4 dias, grandes em 2–3 semanas.
 */
export interface CatalogItem {
  key: string;
  title: string;
  price: number;
  description: string;
}

export const SHOP_CATALOG: CatalogItem[] = [
  {
    key: 'fixo-episodio',
    title: 'Mais um episódio da série',
    price: 60,
    description: 'Só mais um... e dessa vez está liberado!',
  },
  {
    key: 'fixo-doce',
    title: 'Comer um doce sem culpa',
    price: 80,
    description:
      'Aquele brigadeiro, sorvete ou pedaço de bolo que você está namorando.',
  },
  {
    key: 'fixo-cochilo',
    title: 'Cochilo da tarde',
    price: 90,
    description:
      'Vinte minutinhos de descanso merecido, sem despertador de culpa.',
  },
  {
    key: 'fixo-musica',
    title: 'Banho demorado com playlist',
    price: 100,
    description: 'A playlist favorita no volume certo e água quentinha.',
  },
  {
    key: 'fixo-jogo',
    title: 'Uma hora de jogo',
    price: 120,
    description:
      'Videogame, tabuleiro ou celular: do jeitinho que você quiser.',
  },
  {
    key: 'fixo-cafe',
    title: 'Café especial na padaria',
    price: 150,
    description: 'Um cappuccino caprichado, tomado sem pressa nenhuma.',
  },
  {
    key: 'fixo-planta',
    title: 'Plantinha nova',
    price: 300,
    description: 'Mais uma verdinha para cuidar e dar nome.',
  },
  {
    key: 'fixo-comida',
    title: 'Pedir a comida favorita',
    price: 400,
    description: 'Pizza, sushi, hambúrguer... hoje é dia de pedir.',
  },
  {
    key: 'fixo-livro',
    title: 'Livro novo',
    price: 500,
    description:
      'Finalmente comprar aquele livro que mora no carrinho há meses.',
  },
  {
    key: 'fixo-passeio',
    title: 'Passeio no fim de semana',
    price: 700,
    description: 'Cinema, parque ou aquele lugar novo que você quer conhecer.',
  },
];
