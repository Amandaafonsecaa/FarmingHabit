/** Usuário autenticado: o `sub` do token do Supabase Auth e o e-mail da conta */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthenticatedRequest {
  headers: { authorization?: string };
  user?: AuthUser;
}
