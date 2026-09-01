import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';

function buildDeps() {
  const prisma = {
    member: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const jwt = { signAsync: vi.fn().mockResolvedValue('signed.jwt.token') };
  const config = { get: vi.fn().mockReturnValue('http://localhost:3000') };
  const email = { sendVerificationEmail: vi.fn().mockResolvedValue(undefined) };

  // Le constructeur d'AuthService attend PrismaService/JwtService/ConfigService/EmailService ;
  // ces doubles n'implémentent que les méthodes réellement utilisées.
  const service = new AuthService(prisma as never, jwt as never, config as never, email as never);

  return { service, prisma, jwt, email };
}

describe('AuthService', () => {
  let deps: ReturnType<typeof buildDeps>;

  beforeEach(() => {
    deps = buildDeps();
  });

  describe('register', () => {
    it('refuse un email déjà utilisé', async () => {
      deps.prisma.member.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        deps.service.register({
          email: 'deja@example.com',
          password: 'un-mot-de-passe-solide',
          displayName: 'Test',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('crée le membre avec un mot de passe haché et envoie l’email de vérification', async () => {
      deps.prisma.member.findUnique.mockResolvedValue(null);
      const created = {
        id: 'member-1',
        email: 'nouveau@example.com',
        displayName: 'Nouveau',
        passwordHash: 'hashed',
        emailVerifiedAt: null,
        internalRole: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      deps.prisma.member.create.mockResolvedValue(created);

      const result = await deps.service.register({
        email: 'nouveau@example.com',
        password: 'un-mot-de-passe-solide',
        displayName: 'Nouveau',
      });

      expect(deps.prisma.member.create).toHaveBeenCalledOnce();
      const passedPasswordHash = deps.prisma.member.create.mock.calls[0][0].data.passwordHash;
      expect(await bcrypt.compare('un-mot-de-passe-solide', passedPasswordHash)).toBe(true);
      expect(deps.prisma.emailVerificationToken.create).toHaveBeenCalledOnce();
      expect(deps.email.sendVerificationEmail).toHaveBeenCalledOnce();
      expect(result.member.id).toBe('member-1');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('refuse un compte inexistant sans révéler la raison exacte', async () => {
      deps.prisma.member.findUnique.mockResolvedValue(null);

      await expect(
        deps.service.login({ email: 'inconnu@example.com', password: 'peu-importe' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('refuse un compte Google-only (sans mot de passe local)', async () => {
      deps.prisma.member.findUnique.mockResolvedValue({ id: 'g1', passwordHash: null });

      await expect(
        deps.service.login({ email: 'google@example.com', password: 'peu-importe' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('refuse un mauvais mot de passe', async () => {
      const passwordHash = await bcrypt.hash('bon-mot-de-passe', 4);
      deps.prisma.member.findUnique.mockResolvedValue({ id: 'm1', passwordHash });

      await expect(
        deps.service.login({ email: 'membre@example.com', password: 'mauvais-mot-de-passe' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('émet un access token et un refresh token pour des identifiants valides', async () => {
      const passwordHash = await bcrypt.hash('bon-mot-de-passe', 4);
      const member = {
        id: 'm1',
        email: 'membre@example.com',
        passwordHash,
        displayName: 'Membre',
        emailVerifiedAt: null,
        internalRole: null,
        createdAt: new Date(),
      };
      deps.prisma.member.findUnique.mockResolvedValue(member);

      const result = await deps.service.login({
        email: 'membre@example.com',
        password: 'bon-mot-de-passe',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(typeof result.refreshToken).toBe('string');
      expect(deps.prisma.refreshToken.create).toHaveBeenCalledOnce();
    });
  });
});
