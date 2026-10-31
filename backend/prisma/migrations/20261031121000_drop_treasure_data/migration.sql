-- Baús e cartas saíram do jogo: apaga os dados que só eles usavam (o que já foi pago fica no livro-caixa)
DELETE FROM "user_data" WHERE "key" IN ('farminghabit.treasure.v1', 'farminghabit.cards.v1', 'farminghabit.harvest-rewards.v1');
