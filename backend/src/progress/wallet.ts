import { Prisma, User } from '@prisma/client';
import { XP_PER_LEVEL } from './economy';

type Db = Pick<Prisma.TransactionClient, '$queryRaw'>;

/**
 * Soma (ou tira, com valores negativos) moedas e XP numa única instrução e recalcula o nível.
 * Nunca deixa saldo negativo. Sendo um UPDATE só, dois pedidos ao mesmo tempo não se atropelam.
 */
export function adjustWallet(
  db: Db,
  userId: string,
  coins: number,
  xp: number,
) {
  return db.$queryRaw<User[]>`
    UPDATE "users"
    SET "coins" = GREATEST("coins" + ${coins}::int, 0),
        "xp" = GREATEST("xp" + ${xp}::int, 0),
        "level" = GREATEST("xp" + ${xp}::int, 0) / ${XP_PER_LEVEL}::int + 1
    WHERE "id" = ${userId}
    RETURNING *`;
}
