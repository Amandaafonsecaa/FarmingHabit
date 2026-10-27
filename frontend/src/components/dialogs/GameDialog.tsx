import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { PixelIcon, type PixelIconName } from '../PixelIcon';

interface GameDialogProps {
  title: string; icon: PixelIconName; intro: string; submitLabel: string;
  destructive?: boolean;
  /** Texto do botão enquanto trabalha (padrão: "Salvando...") */
  busyLabel?: string;
  error: string; children: ReactNode; onClose: () => void;
  /** Valida e salva. Retorna true quando deu certo (a janela vai fechar) ou false para continuar editando */
  onSubmit: (data: FormData) => boolean | Promise<boolean>;
}

/**
 * Moldura padrão de todos os modais de "Adicionar": abre desdobrando como pergaminho, prende o foco,
 * trava o botão enquanto salva (evita criar em dobro com clique duplo) e devolve o foco ao fechar.
 */
export function GameDialog({ title, icon, intro, submitLabel, error, children, onClose, onSubmit, destructive = false, busyLabel = 'Salvando...' }: GameDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Ref trava na hora (antes do re-render); o state desabilita o botão visualmente
  const lockedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lockedRef.current) return;
    lockedRef.current = true;
    setSaving(true);
    let saved = false;
    try { saved = await onSubmit(new FormData(event.currentTarget)); }
    finally {
      // Salvou: continua travado até a janela fechar. Erro de validação ou servidor: libera para tentar de novo
      if (!saved) { lockedRef.current = false; setSaving(false); }
    }
  }

  return <dialog ref={dialogRef} className="pixel-dialog pixel-frame game-dialog" aria-labelledby={titleId} onCancel={event=>{ event.preventDefault(); if (!lockedRef.current) onClose(); }}>
    <header className="panel-heading"><h2 id={titleId}><PixelIcon name={icon}/>{title}</h2><button className="pixel-button" type="button" aria-label="Fechar formulário" disabled={saving} onClick={onClose}><PixelIcon name="close" className="size-3"/></button></header>
    <form className="space-y-4 p-5" onSubmit={submit} noValidate>
      <p className="text-sm">{intro}</p>
      <fieldset disabled={saving} className="min-w-0 space-y-4">{children}</fieldset>
      {error && <p role="alert" className="text-sm font-bold text-[#8c3027]">{error}</p>}
      <div className="flex justify-end gap-3 border-t border-line pt-3">
        <button type="button" className="pixel-button" disabled={saving} onClick={onClose}>Cancelar</button>
        <button type="submit" className={`pixel-button ${destructive ? 'danger-button' : 'primary-button'}`} disabled={saving} aria-busy={saving}>{saving ? busyLabel : submitLabel}</button>
      </div>
    </form>
  </dialog>;
}

/** Cartões de escolha (radio) no mesmo estilo do "Ritmo" da meta */
export function ChoiceCards<T extends string>({ name, value, options, onChange, compact = false }: {
  name: string; value: T; options: { value: T; label: string; hint: string }[]; onChange: (value: T) => void; compact?: boolean;
}) {
  return <div className={`choice-options ${compact ? 'is-compact' : ''}`}>{options.map(option => <label key={option.value} className="choice-option">
    <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={()=>onChange(option.value)}/>
    <span><strong>{option.label}</strong><small>{option.hint}</small></span>
  </label>)}</div>;
}
