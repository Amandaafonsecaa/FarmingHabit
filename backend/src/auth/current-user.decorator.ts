import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, AuthUser } from './auth-user';

/** Usuário do token, já validado pelo AuthGuard: use no lugar de qualquer userId vindo da URL ou do corpo */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>()
      .user as AuthUser;
  },
);
