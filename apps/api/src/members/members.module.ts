import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MembersController } from './members.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [MembersController],
})
export class MembersModule {}
