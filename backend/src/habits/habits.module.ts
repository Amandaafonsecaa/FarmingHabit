import { Module } from '@nestjs/common';
import { HabitsService } from './services/habits.service';
import { HabitsController } from './controllers/habits.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
