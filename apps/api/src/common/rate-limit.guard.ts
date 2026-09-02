import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Rate limiting minimal, en mémoire (fenêtre fixe, par IP + route).
 *
 * Volontairement simple : suffisant pour une seule instance API tant que le
 * trafic reste modeste. Ne fonctionne PAS correctement dès qu'on scale à
 * plusieurs instances (chacune a son propre compteur) — la vraie solution
 * (Redis, partagée) est prévue au §3 du plan de développement pour le sprint
 * S1.4, pour le vote. En attendant, ça protège au moins /auth/* du
 * brute-force et du spam d'inscription/reset.
 */

export interface RateLimitOptions {
  /** Nombre de requêtes autorisées par fenêtre. */
  limit: number;
  /** Durée de la fenêtre, en secondes. */
  windowSeconds: number;
}

export const RATE_LIMIT_KEY = 'rateLimit';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);

interface Bucket {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  // Un seul process Node par instance API : une Map module-scope suffit ici,
  // pas besoin d'un service séparé.
  private readonly buckets = new Map<string, Bucket>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions | undefined>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      ip?: string;
      route?: { path?: string };
      socket?: { remoteAddress?: string };
    }>();
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';
    const key = `${request.route?.path ?? context.getHandler().name}:${ip}`;

    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
      return true;
    }

    if (bucket.count >= options.limit) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Trop de tentatives. Veuillez réessayer plus tard.',
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    return true;
  }
}
