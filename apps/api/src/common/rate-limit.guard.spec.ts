import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitGuard, type RateLimitOptions } from './rate-limit.guard.js';

function buildContext(ip: string, route = '/auth/login'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip, route: { path: route } }),
    }),
    getHandler: () => function handler() {},
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  let reflector: { get: ReturnType<typeof vi.fn> };
  let guard: RateLimitGuard;

  beforeEach(() => {
    reflector = { get: vi.fn() };
    guard = new RateLimitGuard(reflector as unknown as Reflector);
  });

  it('laisse passer une route sans métadonnée @RateLimit', () => {
    reflector.get.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext('1.2.3.4'))).toBe(true);
  });

  it('laisse passer jusqu’à la limite, puis bloque avec 429', () => {
    const options: RateLimitOptions = { limit: 3, windowSeconds: 60 };
    reflector.get.mockReturnValue(options);

    const ctx = buildContext('1.2.3.4');
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(() => guard.canActivate(ctx)).toThrow(/Trop de tentatives/);
  });

  it('isole les compteurs par IP', () => {
    reflector.get.mockReturnValue({ limit: 1, windowSeconds: 60 });

    expect(guard.canActivate(buildContext('1.1.1.1'))).toBe(true);
    // Une autre IP n'est pas affectée par la première.
    expect(guard.canActivate(buildContext('2.2.2.2'))).toBe(true);
    expect(() => guard.canActivate(buildContext('1.1.1.1'))).toThrow();
  });

  it('isole les compteurs par route', () => {
    reflector.get.mockReturnValue({ limit: 1, windowSeconds: 60 });

    expect(guard.canActivate(buildContext('1.1.1.1', '/auth/login'))).toBe(true);
    expect(guard.canActivate(buildContext('1.1.1.1', '/auth/register'))).toBe(true);
  });
});
