import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

/**
 * Nécessite une base PostgreSQL locale à jour (migrations appliquées) —
 * voir infra/docker-compose.yml et `pnpm prisma:migrate`.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
});
