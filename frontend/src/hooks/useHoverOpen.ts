import { useEffect, useRef, type PointerEvent } from 'react';

/**
 * Abre ao passar o mouse e fecha ao sair (com pequenos atrasos para não abrir "de raspão" nem fechar no caminho
 * entre o botão e o conteúdo). Se foi aberto por clique, só fecha por clique, Esc ou clique fora.
 */
export function useHoverOpen(open: boolean, setOpen: (value: boolean) => void, { openDelay = 120, closeDelay = 300 } = {}) {
  const openedByHover = useRef(false);
  const timer = useRef<number>(0);
  const clear = () => window.clearTimeout(timer.current);
  useEffect(() => { if (!open) openedByHover.current = false; }, [open]);
  useEffect(() => clear, []);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clear();
    if (!open) timer.current = window.setTimeout(() => { openedByHover.current = true; setOpen(true); }, openDelay);
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clear();
    if (openedByHover.current) timer.current = window.setTimeout(() => setOpen(false), closeDelay);
  };
  /** Clique: alterna e "fixa" o estado. Se já estava aberto pelo hover, o clique só fixa (não fecha). */
  const toggleByClick = () => {
    clear();
    if (open && openedByHover.current) { openedByHover.current = false; return; }
    openedByHover.current = false;
    setOpen(!open);
  };

  return { onPointerEnter, onPointerLeave, toggleByClick };
}
