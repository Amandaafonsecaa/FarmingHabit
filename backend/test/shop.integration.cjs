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

// Desde o login, todo jogador é um usuário do Supabase Auth (users.id → auth.users.id).
// As contas de teste são criadas pela API de admin (service_role) e apagadas no fim; o jogador sai junto (ON DELETE CASCADE).
const AUTH_URL = `${(process.env.SUPABASE_URL ?? '').replace(/\/+$/, '')}/auth/v1/admin/users`;
const adminHeaders = () => ({
  apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
});

async function createAuthUser(email) {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ email, password: randomUUID(), email_confirm: true }),
  });
  if (!response.ok) throw new Error(`Não foi possível criar a conta de teste: ${response.status}`);
  return (await response.json()).id;
}

async function deleteAuthUser(id) {
  await fetch(`${AUTH_URL}/${id}`, { method: 'DELETE', headers: adminHeaders() });
}

async function main() {
  const prisma = new PrismaClient();
  const users = new UsersService(prisma);
  const rewards = new RewardsService(prisma, users);
  const purchases = new PurchasesService(prisma, users);
  const ids = [];
  try {
    await prisma.$connect();
    for (let index = 0; index < 2; index++) {
      const email = `shop-test-${randomUUID()}@example.invalid`;
      const id = await createAuthUser(email);
      ids.push(id);
      await prisma.user.create({
        data: { id, name: 'Shop integration fixture', email, coins: 100 },
      });
    }
    const [owner, other] = ids;
    const reward = await rewards.create({ title: 'Fixture reward', price: 60 }, owner);
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
    await rewards.update(reward.id, { title: 'Renamed fixture', price: 75 }, owner);
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
    await rewards.update(reward.id, { available: false }, owner);
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
      title: 'Meu episódio',
      price: 10,
      description: 'Minha pausa',
    }, owner);
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
    for (const id of ids) await deleteAuthUser(id);
    await prisma.$disconnect();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
