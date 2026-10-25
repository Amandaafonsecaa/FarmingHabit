import { useLayoutEffect, useRef } from 'react';

/**
 * Anima a troca de posição dos itens de uma lista (técnica FLIP): quando uma meta é colhida e desce,
 * ela desliza até o novo lugar em vez de pular. Os filhos precisam de `data-flip-id`.
 */
export function useFlipList<T extends HTMLElement>(order: string) {
  const ref = useRef<T>(null);
  const positions = useRef(new Map<string, { left: number; top: number }>());
  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calm-mode');
    const next = new Map<string, { left: number; top: number }>();
    for (const child of Array.from(list.children) as HTMLElement[]) {
      const id = child.dataset.flipId;
      if (!id) continue;
      // offsetTop/Left são relativos à lista (position: relative), então a rolagem da página não interfere
      const position = { left: child.offsetLeft, top: child.offsetTop };
      next.set(id, position);
      const previous = positions.current.get(id);
      if (!previous || reduceMotion) continue;
      const dx = previous.left - position.left, dy = previous.top - position.top;
      if (dx || dy) child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.34, 1.3, .64, 1)' });
    }
    positions.current = next;
  }, [order]);
  return ref;
}
