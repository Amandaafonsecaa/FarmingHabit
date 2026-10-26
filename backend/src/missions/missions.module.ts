import { Module } from '@nestjs/common';
import { MissionsService } from './services/missions.service';
import { MissionsController } from './controllers/missions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
