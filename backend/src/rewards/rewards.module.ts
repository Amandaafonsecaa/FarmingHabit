import { Module } from '@nestjs/common';
import { RewardsService } from './services/rewards.service';
import { RewardsController } from './controllers/rewards.controller';
import { PurchasesService } from './services/purchases.service';
import { PurchasesController } from './controllers/purchases.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [RewardsController, PurchasesController],
  providers: [RewardsService, PurchasesService],
  exports: [RewardsService],
})
export class RewardsModule {}
