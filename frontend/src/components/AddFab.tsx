import { PixelIcon } from './PixelIcon';

/** Botão flutuante "+" no canto direito (mesmo lugar e moldura da semente da Casa) para criar algo na tela atual */
export function AddFab({ label, onClick }: { label: string; onClick: () => void }) {
  return <div className="seed-fab">
    <button type="button" className="seed-button add-fab" aria-label={label} title={label} onClick={onClick}><PixelIcon name="plus" className="size-7"/></button>
  </div>;
}
