import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HabitsModule } from './habits/habits.module';
import { MissionsModule } from './missions/missions.module';
import { RewardsModule } from './rewards/rewards.module';
import { ProgressModule } from './progress/progress.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    HabitsModule,
    MissionsModule,
    RewardsModule,
    ProgressModule,
  ],
  controllers: [],
  // Login obrigatório em todas as rotas: o AuthGuard confere o token do Supabase
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
