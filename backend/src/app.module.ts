import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HabitsModule } from './habits/habits.module';
import { MissionsModule } from './missions/missions.module';
import { RewardsModule } from './rewards/rewards.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    HabitsModule,
    MissionsModule,
    RewardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
