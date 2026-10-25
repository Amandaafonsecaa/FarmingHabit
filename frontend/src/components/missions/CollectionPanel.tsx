import { CHAPTERS } from '../../lib/journey';
import { COLLECTIBLES } from '../../lib/treasure';
import { PixelIcon } from '../PixelIcon';
import { CollectibleIcon } from './TreasureIcons';

/** Álbum de colecionáveis (como o museu do Stardew): achados coloridos, os que faltam em silhueta "???" */
export function CollectionPanel({ collection }: { collection: Record<string, number> }) {
  const found = COLLECTIBLES.filter(item => collection[item.id]).length;
  return <section className="world-panel pixel-frame collection-panel" aria-labelledby="collection-heading">
    <header className="panel-heading"><h2 id="collection-heading"><PixelIcon name="sun" className="size-5"/>Coleção de achados</h2><span className="panel-tag">{found}/{COLLECTIBLES.length}</span></header>
    <div className="collection-body">
      {CHAPTERS.map((chapter, index) => <div key={chapter.name} className="collection-shelf">
        <p className="collection-chapter">{chapter.name}</p>
        <ul className="collection-row">{COLLECTIBLES.filter(item => item.chapter === index).map(item => {
          const count = collection[item.id] ?? 0;
          return <li key={item.id} className={`collection-slot is-${item.rarity} ${count ? 'is-found' : ''}`} title={count ? `${item.name} (${item.rarity})` : 'Ainda não encontrado'}>
            <CollectibleIcon id={item.id} silhouette={!count} className="size-9"/>
            <span className="collection-name">{count ? item.name : '???'}</span>
            {count > 1 && <span className="collection-count">x{count}</span>}
          </li>;
        })}</ul>
      </div>)}
    </div>
  </section>;
}
