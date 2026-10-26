import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseStorageService],
  exports: [UsersService],
})
export class UsersModule {}
