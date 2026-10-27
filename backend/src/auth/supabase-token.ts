import { ServiceUnavailableException } from '@nestjs/common';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import type { AuthUser } from './auth-user';

/**
 * Confere a assinatura do JWT emitido pelo Supabase Auth e devolve quem é o dono do token.
 * Projetos com chaves assimétricas (padrão atual) são verificados pela JWKS do próprio projeto;
 * projetos antigos, que assinam com HS256, precisam de SUPABASE_JWT_SECRET.
 */
let jwks: JWTVerifyGetKey | undefined;

export async function verifySupabaseToken(token: string): Promise<AuthUser> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  if (!supabaseUrl) throw new ServiceUnavailableException('O servidor de autenticação não está configurado. Configure SUPABASE_URL no backend.');
  const issuer = `${supabaseUrl}/auth/v1`;

  // Os algoritmos aceitos são fixos por caminho: o cabeçalho do token não escolhe como ele é conferido
  const { alg } = decodeProtectedHeader(token);
  const options = { issuer, audience: 'authenticated' };
  let payload: JWTPayload;
  if (alg === 'HS256') {
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret)
      throw new ServiceUnavailableException('O servidor não está configurado para verificar esta sessão. Configure SUPABASE_JWT_SECRET no backend.');
    ({ payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      ...options,
      algorithms: ['HS256'],
    }));
  } else {
    jwks ??= createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    ({ payload } = await jwtVerify(token, jwks, {
      ...options,
      algorithms: ['RS256', 'ES256'],
    }));
  }
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string')
    throw new Error('Token sem usuário ou e-mail.');
  const metadata = payload.user_metadata;
  const rawName = metadata && typeof metadata === 'object' && 'name' in metadata ? metadata.name : undefined;
  const name = typeof rawName === 'string' ? rawName.trim().slice(0, 40) : '';
  return { id: payload.sub, email: payload.email, ...(name && { name }) };
}
