// Explicit opt-in database check. Creates isolated fixtures and removes only those fixtures.
require('dotenv/config');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const {
  RewardsService,
} = require('../dist/src/rewards/services/rewards.service');
const {
  PurchasesService,
} = require('../dist/src/rewards/services/purchases.service');
const { UsersService } = require('../dist/src/users/services/users.service');

async function main() {
  const prisma = new PrismaClient();
  const users = new UsersService(prisma);
  const rewards = new RewardsService(prisma, users);
  const purchases = new PurchasesService(prisma, users);
  const ids = [];
  try {
    await prisma.$connect();
    for (let index = 0; index < 2; index++) {
      const user = await prisma.user.create({
        data: {
          name: 'Shop integration fixture',
          email: `shop-test-${randomUUID()}@example.invalid`,
          coins: 100,
        },
      });
      ids.push(user.id);
    }
    const [owner, other] = ids;
    const reward = await rewards.create({
      title: 'Fixture reward',
      price: 60,
      userId: owner,
    });
    assert(
      !(await rewards.findAll(other)).some((item) => item.id === reward.id),
    );
    await assert.rejects(
      () => rewards.claimReward(reward.id, other),
      (error) => error.status === 404,
    );
    const results = await Promise.allSettled([
      rewards.claimReward(reward.id, owner),
      rewards.claimReward(reward.id, owner),
    ]);
    assert.equal(
      results.filter((item) => item.status === 'fulfilled').length,
      1,
      'Only one concurrent purchase may spend a 100-coin balance on a 60-coin item',
    );
    assert.equal(
      (await prisma.user.findUniqueOrThrow({ where: { id: owner } })).coins,
      40,
    );
    const history = await purchases.findAll(owner);
    assert.equal(history.length, 1);
    const purchase = history[0];
    await rewards.update(reward.id, {
      title: 'Renamed fixture',
      price: 75,
      userId: owner,
    });
    assert.equal((await purchases.findAll(owner))[0].title, 'Fixture reward');
    assert.equal((await purchases.findAll(owner))[0].price, 60);
    await assert.rejects(
      () => purchases.setUsed(purchase.id, true, other),
      (error) => error.status === 404,
    );
    const used = await purchases.setUsed(purchase.id, true, owner);
    assert(used.usedAt instanceof Date);
    assert.equal(
      (await purchases.setUsed(purchase.id, true, owner)).usedAt.getTime(),
      used.usedAt.getTime(),
    );
    const undone = await purchases.setUsed(purchase.id, false, owner);
    assert.equal(undone.used, false);
    assert.equal(undone.usedAt, null);
    await rewards.update(reward.id, { available: false, userId: owner });
    await assert.rejects(
      () => rewards.claimReward(reward.id, owner),
      (error) => error.status === 400,
    );
    assert.equal((await purchases.findAll(owner)).length, 1);
    assert.equal(
      (await prisma.user.findUniqueOrThrow({ where: { id: owner } })).coins,
      40,
    );
    // Exercise catalog lookup by stable key as well as by its persisted UUID.
    await rewards.syncCatalog();
    const catalog = await rewards.findAll(owner);
    assert.equal(catalog.filter((item) => item.key).length, 10);
    const fixed = await rewards.claimReward('fixo-episodio', other);
    assert.equal(fixed.purchase.price, 60);
    assert.equal((await purchases.findAll(other)).length, 1);
    const fixedId = fixed.reward.id;
    await rewards.update(fixedId, {
      userId: owner,
      title: 'Meu episódio',
      price: 10,
      description: 'Minha pausa',
    });
    assert.equal(
      (await rewards.findAll(owner)).find((item) => item.id === fixedId).price,
      10,
    );
    assert.equal(
      (await rewards.findAll(other)).find((item) => item.id === fixedId).price,
      60,
    );
    const personalized = await rewards.claimReward(fixedId, owner);
    assert.equal(personalized.purchase.title, 'Meu episódio');
    assert.equal(personalized.purchase.price, 10);
    await rewards.remove(fixedId, owner);
    assert.equal(
      (await rewards.findAll(owner)).find((item) => item.id === fixedId)
        .available,
      false,
    );
    assert.equal(
      (await rewards.findAll(other)).find((item) => item.id === fixedId)
        .available,
      true,
    );
    await rewards.syncCatalog();
    await assert.rejects(
      () => rewards.claimReward(fixedId, owner),
      (error) => error.status === 400,
    );
    assert(
      (await purchases.findAll(owner)).some(
        (item) => item.id === personalized.purchase.id,
      ),
    );
    await rewards.remove(reward.id, owner);
    assert(
      (await purchases.findAll(owner)).some((item) => item.id === purchase.id),
    );
    console.log(
      'Supabase integration passed: catalog, concurrent balance protection, history snapshots, ownership, use/undo and unavailable rewards.',
    );
  } finally {
    if (ids.length)
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
