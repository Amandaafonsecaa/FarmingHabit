import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { AuthenticatedRequest } from './auth-user';
import { verifySupabaseToken } from './supabase-token';

/**
 * Guard global: toda rota exige `Authorization: Bearer <access_token>` do Supabase.
 * Confere o token, garante que o jogador existe no banco e deixa o usuário em `request.user`.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token)
      throw new UnauthorizedException('Entre na sua conta para continuar.');

    try {
      request.user = await verifySupabaseToken(token);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new UnauthorizedException(
        'Sessão inválida ou expirada. Entre de novo.',
      );
    }
    await this.usersService.ensureUser(request.user.id, request.user.email, request.user.name);
    return true;
  }
}
