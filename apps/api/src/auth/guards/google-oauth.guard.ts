import { ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

/**
 * Refuse explicitement (503) tant que GOOGLE_CLIENT_ID/SECRET ne sont pas
 * configurés, plutôt que de laisser passport échouer contre l'API Google
 * avec des identifiants factices.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.get<string>('GOOGLE_CLIENT_ID')) {
      throw new ServiceUnavailableException(
        'La connexion Google n’est pas configurée sur cet environnement.',
      );
    }
    return super.canActivate(context);
  }
}
