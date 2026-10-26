import { useState } from 'react';
import { toast } from '../lib/toast';
import { MainLayout } from '../layouts/MainLayout';
import { ShopHero } from '../components/shop/ShopHero';
import { ProductCard } from '../components/shop/ProductCard';
import { PiggyPanel } from '../components/shop/PiggyPanel';
import { ChestPanel } from '../components/shop/ChestPanel';
import { EditRewardDialog } from '../components/dialogs/EditRewardDialog';
import { RewardDialog } from '../components/dialogs/RewardDialog';
import { ShopkeeperDialog } from '../components/shop/ShopkeeperDialog';
import { PixelIcon } from '../components/PixelIcon';
import { useShop } from '../hooks/useShop';
import type { NewItem, Reward } from '../types/world';
import type { AppPage } from '../types/navigation';

type Filter = 'all' | 'ready' | 'saving';
const FILTERS: { id: Filter; label: string }[] = [{ id: 'all', label: 'Tudo' }, { id: 'ready', label: 'Dá para levar' }, { id: 'saving', label: 'Juntando moedas' }];
const BUY_ANIMATION_MS = 1600;
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível falar com o servidor.';

export function ShopPage({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const shop = useShop();
  const [filter, setFilter] = useState<Filter>('all');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Avisos de ação aparecem como toast
  const setAnnouncement = toast;
  const [talking, setTalking] = useState(false);

  const coins = shop.player?.coins ?? 0;
  const catalog = shop.rewards;
  const shown = catalog.filter(reward => filter === 'all' || (filter === 'ready' ? coins >= reward.price : coins < reward.price));
  const wishes = shop.wishIds.flatMap(id => catalog.find(reward => reward.id === id) ?? []);

  function celebrate(reward: Reward) {
    setBuyingId(reward.id);
    setShakeKey(key => key + 1);
    window.setTimeout(() => setBuyingId(current => current === reward.id ? null : current), BUY_ANIMATION_MS);
  }

  async function buy(reward: Reward) {
    if (pendingId || coins < reward.price) return;
    setPendingId(reward.id);
    try {
      const purchase = await shop.buy(reward);
      celebrate(reward);
      setFreshId(purchase.id);
      setAnnouncement(`${reward.name} foi para suas compras! Aproveite esse mimo.`);
    } catch (error) {
      setAnnouncement(`${reward.name}: ${errorMessage(error)}`);
    } finally { setPendingId(null); }
  }

  async function create(item: Extract<NewItem, { kind: 'reward' }>) {
    try {
      await shop.create(item.title, item.price);
      setDialogOpen(false);
      setAnnouncement(`${item.title} chegou na vitrine!`);
      return true;
    } catch (error) {
      setAnnouncement(`${item.title}: ${errorMessage(error)}`);
      return false;
    }
  }

  return <MainLayout page="shop" onNavigate={onNavigate} world={<ShopHero coins={shop.player ? coins : null} onCreate={()=>setDialogOpen(true)} onTalk={()=>setTalking(true)}/>}>
    <div className="shop-layout">
      <section className="world-panel pixel-frame showcase-panel" aria-labelledby="showcase-heading">
        <header className="panel-heading">
          <h2 id="showcase-heading"><PixelIcon name="coin" className="size-5"/>Vitrine</h2>
          <div className="view-tabs" role="group" aria-label="Filtrar produtos">{FILTERS.map(item => <button key={item.id} type="button" className="view-tab" aria-pressed={filter === item.id} onClick={()=>setFilter(item.id)}>{item.label}</button>)}</div>
        </header>
        <div className="showcase" role="region" aria-label="Produtos da vitrine" tabIndex={0}>
          {shop.loading && <p className="quest-board-note">Arrumando as prateleiras…</p>}
          {shop.error && <p role="alert" className="quest-board-note is-error">Não foi possível carregar a vitrine: {shop.error}</p>}
          {!shop.loading && shown.length === 0 && <div className="quest-board-note">
            <p>{filter === 'ready' ? 'Nada cabe no bolso ainda. Que tal uma missão?' : filter === 'saving' ? 'Você já pode levar tudo da vitrine! 🎉' : 'A vitrine está vazia.'}</p>
            {filter === 'all' && <button type="button" className="pixel-button primary-button mt-3" onClick={()=>setDialogOpen(true)}><PixelIcon name="plus" className="size-2.5"/>Criar recompensa</button>}
          </div>}
          <ul className="product-grid">{shown.map((reward, index) => <ProductCard key={reward.id} reward={reward} coins={coins} index={index}
            wished={shop.wishIds.includes(reward.id)} buying={buyingId === reward.id} pending={pendingId === reward.id}
            onBuy={()=>buy(reward)} onWish={()=>shop.toggleWish(reward.id)} onEdit={()=>setEditing(reward)}/>)}</ul>
        </div>
      </section>
      <div className="shop-side">
        <PiggyPanel coins={coins} wishes={wishes} shakeKey={shakeKey}/>
        <ChestPanel purchases={shop.purchases} freshId={freshId} pendingIds={shop.updatingIds} onToggle={id => { void shop.toggleUsed(id).catch(error => setAnnouncement(errorMessage(error))); }}/>
      </div>
    </div>
    <p role="status" className="world-status">{'Cuidar de si também é uma recompensa.'}</p>
    {editing && <EditRewardDialog key={editing.id} reward={editing} onClose={()=>setEditing(null)}
      onSave={async changes => { await shop.edit(editing.id, changes); setAnnouncement(`${changes.title}: recompensa atualizada!`); }}
      onDelete={async () => { await shop.remove(editing.id); setAnnouncement(`${editing.name} saiu da sua vitrine.`); }}/>}
    {dialogOpen && <RewardDialog onSave={create} onClose={()=>setDialogOpen(false)}/>}
    {talking && <ShopkeeperDialog onClose={()=>setTalking(false)} context={{ name: shop.player?.name ?? 'fazendeira', coins, rewards: catalog, wish: wishes[0] ?? null, lastPurchase: shop.purchases[0]?.title ?? null, hour: new Date().getHours() }}/>}
  </MainLayout>;
}
