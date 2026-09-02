import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// bcryptjs est un module CJS classique : `import * as bcrypt` échoue à
// résoudre `bcrypt.hash` sous Node ESM (module: nodenext) — l'import par
// défaut récupère correctement l'objet `module.exports` complet.
import bcrypt from 'bcryptjs';
import type { Member as MemberRecord } from '@prisma/client';
import { EmailService } from '../email/email.service.js';
import { toMemberProfile } from '../members/member-profile.mapper.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './jwt-payload.js';
import { generateOpaqueToken, hashOpaqueToken } from './opaque-token.util.js';

const BCRYPT_SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_DAYS = 30;
const EMAIL_VERIFICATION_TTL_HOURS = 48;
// Plus court que la vérification d'email : un lien de reset qui traîne est
// plus sensible (accès immédiat au compte).
const PASSWORD_RESET_TTL_HOURS = 2;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.member.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const member = await this.prisma.member.create({
      data: { email: dto.email, passwordHash, displayName: dto.displayName },
    });

    await this.sendVerificationEmail(member);

    return { member: toMemberProfile(member) };
  }

  async login(dto: LoginDto): Promise<AuthTokens & { member: ReturnType<typeof toMemberProfile> }> {
    const member = await this.prisma.member.findUnique({ where: { email: dto.email } });
    if (!member?.passwordHash) {
      // Message volontairement identique au cas "mauvais mot de passe" pour ne pas
      // révéler si l'email est déjà enregistré (et couvre les comptes Google-only).
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const valid = await bcrypt.compare(dto.password, member.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    const tokens = await this.issueTokens(member);
    return { ...tokens, member: toMemberProfile(member) };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = hashOpaqueToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { member: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide ou expiré.');
    }

    // Rotation : le jeton utilisé est révoqué, un nouveau est émis.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(stored.member);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashOpaqueToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const tokenHash = hashOpaqueToken(rawToken);
    const stored = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.consumedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Lien de vérification invalide ou expiré.');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: stored.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.member.update({
        where: { id: stored.memberId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  }

  /**
   * Demande de réinitialisation de mot de passe. Ne révèle jamais si l'email
   * existe (réponse toujours identique côté contrôleur) — silencieux si le
   * compte n'existe pas.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const member = await this.prisma.member.findUnique({ where: { email } });
    if (!member) {
      return;
    }

    const { token, tokenHash } = generateOpaqueToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TTL_HOURS);

    await this.prisma.passwordResetToken.create({
      data: { memberId: member.id, tokenHash, expiresAt },
    });

    const webOrigin = this.config.get<string>('APP_WEB_ORIGIN', 'http://localhost:3000');
    const resetUrl = `${webOrigin}/reinitialiser-mot-de-passe?token=${token}`;

    try {
      await this.email.sendPasswordResetEmail(member.email, resetUrl);
    } catch (error) {
      this.logger.error(`Échec de l'envoi de l'email de réinitialisation à ${member.email}`, error);
    }
  }

  /**
   * Applique un nouveau mot de passe à partir d'un jeton valide et révoque
   * toutes les sessions actives du membre (refresh tokens) — un mot de passe
   * qui vient de fuiter ne doit pas laisser une session ouverte ailleurs.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = hashOpaqueToken(rawToken);
    const stored = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.consumedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Lien de réinitialisation invalide ou expiré.');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.member.update({
        where: { id: stored.memberId },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { memberId: stored.memberId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  /** Connexion ou création de compte à partir d'un profil Google authentifié (OAuth2, §5.3 CDC). */
  async loginWithGoogle(profile: {
    googleId: string;
    email: string;
    displayName: string;
  }): Promise<AuthTokens & { member: ReturnType<typeof toMemberProfile> }> {
    let member = await this.prisma.member.findUnique({ where: { googleId: profile.googleId } });

    if (!member) {
      // Un compte local avec le même email existe peut-être déjà : on le rattache
      // plutôt que de créer un doublon.
      member = await this.prisma.member.upsert({
        where: { email: profile.email },
        create: {
          email: profile.email,
          displayName: profile.displayName,
          googleId: profile.googleId,
          emailVerifiedAt: new Date(), // Google a déjà vérifié l'adresse.
        },
        update: { googleId: profile.googleId, emailVerifiedAt: new Date() },
      });
    }

    const tokens = await this.issueTokens(member);
    return { ...tokens, member: toMemberProfile(member) };
  }

  private async issueTokens(member: MemberRecord): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: member.id, email: member.email };
    const accessToken = await this.jwt.signAsync(payload);

    const { token: refreshToken, tokenHash } = generateOpaqueToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.prisma.refreshToken.create({
      data: { memberId: member.id, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private async sendVerificationEmail(member: MemberRecord): Promise<void> {
    const { token, tokenHash } = generateOpaqueToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_TTL_HOURS);

    await this.prisma.emailVerificationToken.create({
      data: { memberId: member.id, tokenHash, expiresAt },
    });

    const webOrigin = this.config.get<string>('APP_WEB_ORIGIN', 'http://localhost:3000');
    const verificationUrl = `${webOrigin}/verifier-email?token=${token}`;

    try {
      await this.email.sendVerificationEmail(member.email, verificationUrl);
    } catch (error) {
      // L'inscription ne doit pas échouer si l'envoi d'email échoue ; le membre
      // pourra redemander un email de vérification (à implémenter — non couvert
      // par ce sprint).
      this.logger.error(`Échec de l'envoi de l'email de vérification à ${member.email}`, error);
    }
  }
}
