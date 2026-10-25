/** Avisos rápidos (toasts): qualquer parte do app chama toast('mensagem') e o Toaster mostra a plaquinha */
export type ToastTone = 'success' | 'error' | 'info';
export interface ToastItem { id: number; message: string; tone: ToastTone }
export const TOAST_EVENT = 'farminghabit:toast';

let nextId = 1;
const ERROR_WORDS = /não foi possível|fora do ar|erro|indisponível|falh/i;

/** Sem tom explícito, mensagens de falha viram aviso de erro e o resto vira sucesso */
export function toast(message: string, tone?: ToastTone) {
  const item: ToastItem = { id: nextId++, message, tone: tone ?? (ERROR_WORDS.test(message) ? 'error' : 'success') };
  window.dispatchEvent(new CustomEvent<ToastItem>(TOAST_EVENT, { detail: item }));
}
