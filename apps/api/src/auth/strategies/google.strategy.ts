import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';

export interface GoogleProfile {
  googleId: string;
  email: string;
  displayName: string;
}

/**
 * Enregistrée même quand les identifiants Google ne sont pas configurés
 * (valeurs de repli), pour ne pas empêcher l'API de démarrer en dev/CI sans
 * ces secrets. `GoogleOAuthGuard` bloque l'accès aux routes tant que ce n'est
 * pas configuré (cf. google-oauth.guard.ts).
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    // `ConfigService#get(key, default)` ne retombe sur `default` que si la clé est
    // absente — une variable définie mais vide (`GOOGLE_CLIENT_ID=` dans .env)
    // renvoie `''`, d'où le `|| '...'` en plus pour ce cas.
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Le profil Google ne fournit pas d’adresse email.'));
      return;
    }

    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email,
      displayName: profile.displayName || email,
    };
    done(null, googleProfile);
  }
}
