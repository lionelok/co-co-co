import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { EmailService } from '../src/email/email.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * Nécessite une base PostgreSQL locale à jour (migrations appliquées) —
 * voir infra/docker-compose.yml et `pnpm prisma:migrate`.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emailService: EmailService;
  // Email unique par run pour ne pas entrer en conflit avec une exécution précédente.
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'un-mot-de-passe-solide';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    emailService = app.get(EmailService);
  });

  afterAll(async () => {
    await prisma.member.deleteMany({ where: { email } });
    await app.close();
  });

  it('inscrit, connecte, rafraîchit et expose le profil du membre', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, displayName: 'E2E' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, displayName: 'E2E' })
      .expect(409);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    expect(login.body.accessToken).toBeTypeOf('string');
    expect(login.body.refreshToken).toBeTypeOf('string');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'mauvais-mot-de-passe' })
      .expect(401);

    const me = await request(app.getHttpServer())
      .get('/members/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);
    expect(me.body.email).toBe(email);

    await request(app.getHttpServer()).get('/members/me').expect(401);

    const refreshed = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(200);
    expect(refreshed.body.accessToken).toBeTypeOf('string');

    // Rotation : l'ancien refresh token est révoqué.
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });

  it('réinitialise le mot de passe et révoque les sessions actives', async () => {
    // Nouveau compte dédié : le reset révoque toutes les sessions, ça
    // interférerait avec les autres tests s'il partageait le compte `email`.
    const resetEmail = `e2e-reset-${Date.now()}@example.com`;
    const oldPassword = 'ancien-mot-de-passe-solide';
    const newPassword = 'nouveau-mot-de-passe-solide';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: resetEmail, password: oldPassword, displayName: 'Reset E2E' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: resetEmail, password: oldPassword })
      .expect(200);

    const sendResetEmail = vi
      .spyOn(emailService, 'sendPasswordResetEmail')
      .mockResolvedValue(undefined);

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: resetEmail })
      .expect(200);

    // Ne révèle jamais si l'email existe : même réponse pour un email inconnu.
    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'ne-devrait-pas-exister@example.com' })
      .expect(200);

    expect(sendResetEmail).toHaveBeenCalledOnce();
    const resetUrl = sendResetEmail.mock.calls[0][1];
    const token = new URL(resetUrl).searchParams.get('token');
    expect(token).toBeTypeOf('string');

    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, password: newPassword })
      .expect(200);

    // Jeton à usage unique.
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, password: 'encore-un-autre-mot-de-passe' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: resetEmail, password: oldPassword })
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: resetEmail, password: newPassword })
      .expect(200);

    // La session ouverte avant le reset a été révoquée.
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);

    await prisma.member.delete({ where: { email: resetEmail } });
  });
});
