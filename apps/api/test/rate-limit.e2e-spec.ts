import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

/**
 * Instance d'app dédiée : le rate limiter est en mémoire (par instance),
 * partager l'app d'auth.e2e-spec.ts consommerait aussi son quota et
 * rendrait ce test dépendant de l'ordre d'exécution.
 */
describe('Rate limiting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('bloque /auth/register avec 429 au-delà de la limite (5/min)', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `rate-limit-${Date.now()}-${i}@example.com`,
          password: 'un-mot-de-passe-solide',
          displayName: 'Rate limit',
        });
      expect(res.status).toBe(201);
    }

    const blocked = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `rate-limit-${Date.now()}-over@example.com`,
        password: 'un-mot-de-passe-solide',
        displayName: 'Rate limit',
      })
      .expect(429);
    expect(blocked.body.retryAfterSeconds).toBeGreaterThan(0);

    // /auth/login a son propre compteur, indépendant de /auth/register.
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'peu-importe@example.com', password: 'peu-importe' })
      .expect(401);
  });
});
