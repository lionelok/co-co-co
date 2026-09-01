import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        // En secondes (et non "15m") : les variables d'env sont toujours des
        // chaînes, `Number(...)` évite de dépendre du typage littéral `StringValue` de `ms`.
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_ACCESS_EXPIRES_IN_SECONDS', '900')),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GoogleOAuthGuard],
  // `PassportModule` doit être exporté : `JwtAuthGuard`/`GoogleOAuthGuard` (des
  // `AuthGuard(...)` de @nestjs/passport) sont instanciés dans d'autres modules
  // (ex. MembersModule) et ont besoin d'y résoudre `AuthModuleOptions`.
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
