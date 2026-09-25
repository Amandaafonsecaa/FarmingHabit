import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Missing configuration must not prevent the existing mock-data page from loading.
// No database schema is supplied until the product's tables have been defined.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

export type SupabaseHealthResult =
  | { ok: true; status: number }
  | { ok: false; status: number | null; message: string };

/** Manual service-reachability check; does not test tables, RLS, or user login. */
export async function checkSupabaseConnection(): Promise<SupabaseHealthResult> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      status: null,
      message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/auth/v1/health`, {
      headers: { apikey: supabaseAnonKey },
      signal: controller.signal,
      cache: 'no-store',
    });

    return response.ok
      ? { ok: true, status: response.status }
      : { ok: false, status: response.status, message: 'O serviço Supabase não respondeu com sucesso.' };
  } catch {
    return {
      ok: false,
      status: null,
      message: controller.signal.aborted
        ? 'A conexão com o Supabase excedeu o limite de 10 segundos.'
        : 'Não foi possível conectar ao Supabase. Verifique a rede e a URL do projeto.',
    };
  } finally {
    clearTimeout(timeout);
  }
}
