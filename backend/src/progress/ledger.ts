import { Prisma, User } from '@prisma/client';
import { adjustWallet } from './wallet';

export interface Claim {
  key: string;
  kind: 'harvest' | 'week';
  day: string;
  coins: number;
  xp: number;
}

export const sumClaims = (claims: Claim[], field: 'coins' | 'xp') =>
  claims.reduce((total, claim) => total + claim[field], 0);

/**
 * Registra as recompensas que ainda não existem (livro-caixa reward_claims) e credita só essas.
 * Roda dentro da transação de quem chama.
 */
export async function payOnce(
  tx: Prisma.TransactionClient,
  userId: string,
  claims: Claim[],
): Promise<{ paid: Claim[]; user: User }> {
  const paid: Claim[] = [];
  for (const claim of claims) {
    const { count } = await tx.rewardClaim.createMany({
      data: [
        {
          userId,
          key: claim.key,
          kind: claim.kind,
          day: claim.day,
          coins: claim.coins,
          xp: claim.xp,
        },
      ],
      skipDuplicates: true,
    });
    if (count === 1) paid.push(claim);
  }
  const user = paid.length
    ? (
        await adjustWallet(
          tx,
          userId,
          sumClaims(paid, 'coins'),
          sumClaims(paid, 'xp'),
        )
      )[0]
    : await tx.user.findUniqueOrThrow({ where: { id: userId } });
  return { paid, user };
}
