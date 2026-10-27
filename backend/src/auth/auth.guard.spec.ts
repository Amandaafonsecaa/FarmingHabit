import { ExecutionContext, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { SignJWT } from 'jose';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../users/services/users.service';

const SUPABASE_URL = 'https://example.supabase.co';
const SECRET = 'segredo-de-teste-com-tamanho-suficiente';
const USER_ID = '7d0c4f5e-1b2a-4c3d-8e9f-0a1b2c3d4e5f';

async function signToken(
  overrides: {
    secret?: string;
    audience?: string;
    expiresIn?: string;
    sub?: string;
    name?: unknown;
  } = {},
) {
  return new SignJWT({ email: 'jogador@example.com', role: 'authenticated', user_metadata: { name: overrides.name } })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(overrides.sub ?? USER_ID)
    .setIssuer(`${SUPABASE_URL}/auth/v1`)
    .setAudience(overrides.audience ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime(overrides.expiresIn ?? '1h')
    .sign(new TextEncoder().encode(overrides.secret ?? SECRET));
}

function contextWith(authorization?: string) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: authorization ? { authorization } : {},
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  let ensureUser: jest.Mock;
  let guard: AuthGuard;
  beforeEach(() => {
    process.env.SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_JWT_SECRET = SECRET;
    ensureUser = jest.fn().mockResolvedValue({ id: USER_ID });
    guard = new AuthGuard({ ensureUser } as unknown as UsersService);
  });

  it('reports missing server configuration rather than claiming the session expired', async () => {
    const { context } = contextWith(`Bearer ${await signToken()}`);
    delete process.env.SUPABASE_URL;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(ensureUser).not.toHaveBeenCalled();
  });

  it('distinguishes a missing legacy signing secret from an invalid token', async () => {
    const { context } = contextWith(`Bearer ${await signToken()}`);
    delete process.env.SUPABASE_JWT_SECRET;
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(ensureUser).not.toHaveBeenCalled();
  });

  it('lets a valid token through and exposes the token owner as request.user', async () => {
    const { context, request } = contextWith(`Bearer ${await signToken()}`);
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: USER_ID, email: 'jogador@example.com' });
    expect(ensureUser).toHaveBeenCalledWith(USER_ID, 'jogador@example.com', undefined);
  });

  it('passes the signup name to the player profile after token verification', async () => {
    const { context, request } = contextWith(`Bearer ${await signToken({ name: '  Ana Maria  ' })}`);
    await guard.canActivate(context);
    expect(request.user).toEqual({ id: USER_ID, email: 'jogador@example.com', name: 'Ana Maria' });
    expect(ensureUser).toHaveBeenCalledWith(USER_ID, 'jogador@example.com', 'Ana Maria');
  });

  it('rejects requests without a bearer token', async () => {
    const { context } = contextWith();
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(ensureUser).not.toHaveBeenCalled();
  });

  it('rejects a token signed with another secret', async () => {
    const { context } = contextWith(
      `Bearer ${await signToken({ secret: 'outro-segredo-qualquer-aqui-tambem' })}`,
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(ensureUser).not.toHaveBeenCalled();
  });

  it('rejects an expired token', async () => {
    const { context } = contextWith(
      `Bearer ${await signToken({ expiresIn: '-1h' })}`,
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token issued for another audience', async () => {
    const { context } = contextWith(
      `Bearer ${await signToken({ audience: 'outra-api' })}`,
    );
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
