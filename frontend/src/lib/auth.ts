import { supabase } from './supabase';

/**
 * Sessão do Supabase Auth. O token de acesso vai em todo pedido à API (Authorization: Bearer),
 * e o backend descobre o jogador por ele. Este módulo guarda uma cópia do token para o envio
 * de última hora ao fechar a aba, quando não dá para esperar uma chamada assíncrona.
 */
let accessToken: string | null = null;

/** Token da sessão atual (o cliente do Supabase renova sozinho quando está perto de expirar) */
export async function currentAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  accessToken = data.session?.access_token ?? null;
  return accessToken;
}

/** Cabeçalho de autorização usando o último token conhecido, sem esperar nada (usado no pagehide) */
export function cachedAuthHeader(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

supabase?.auth.onAuthStateChange((_event, session) => { accessToken = session?.access_token ?? null; });

export async function signIn(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
}

/** Devolve true quando a conta já entra na hora; false quando o Supabase pede a confirmação do e-mail antes */
export async function signUp(email: string, password: string, name: string): Promise<boolean> {
  if (!supabase) throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.');
  const displayName = name.trim();
  if (!displayName || displayName.length > 40) throw new Error('Informe seu nome com até 40 caracteres.');
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name: displayName } } });
  if (error) throw new Error(translateAuthError(error.message));
  return data.session !== null;
}

export async function signOut(): Promise<void> {
  if (!supabase) throw new Error('O serviço de autenticação não está configurado.');
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw new Error('Não foi possível sair da conta. Verifique sua conexão e tente novamente.');
}

/** Mensagens do Supabase em português, para o jogador entender o que aconteceu */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha não conferem.';
  if (/already registered|already been registered/i.test(message)) return 'Já existe uma conta com este e-mail. Tente entrar.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail antes de entrar. Enviamos um link para a sua caixa de entrada.';
  if (/password should be at least|at least 6/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit|too many/i.test(message)) return 'Muitas tentativas seguidas. Espere um pouco e tente de novo.';
  if (/fetch|network/i.test(message)) return 'Não foi possível conectar ao servidor de login. Verifique a rede.';
  return 'Não foi possível concluir o acesso. Tente de novo.';
}
