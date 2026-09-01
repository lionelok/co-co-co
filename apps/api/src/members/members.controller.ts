import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../auth/current-member.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { toMemberProfile } from './member-profile.mapper.js';

@Controller('members')
export class MembersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentMember() currentMember: JwtPayload) {
    const member = await this.prisma.member.findUnique({ where: { id: currentMember.sub } });
    if (!member) {
      throw new NotFoundException('Membre introuvable.');
    }
    return toMemberProfile(member);
  }
}
