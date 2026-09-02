import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimit, RateLimitGuard } from '../common/rate-limit.guard.js';
import { AuthService } from './auth.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import type { GoogleProfile } from './strategies/google.strategy.js';

@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @RateLimit({ limit: 5, windowSeconds: 60 })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 10, windowSeconds: 60 })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string): Promise<{ verified: true }> {
    await this.auth.verifyEmail(token);
    return { verified: true };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ ok: true }> {
    await this.auth.requestPasswordReset(dto.email);
    // Réponse identique que le compte existe ou non : ne pas permettre
    // l'énumération d'emails via cet endpoint.
    return { ok: true };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ ok: true }> {
    await this.auth.resetPassword(dto.token, dto.password);
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleLogin(): void {
    // Redirection vers Google gérée par le guard/la stratégie passport.
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @Redirect()
  async googleCallback(@Req() req: { user: GoogleProfile }) {
    const { accessToken, refreshToken } = await this.auth.loginWithGoogle(req.user);
    const webOrigin = this.config.get<string>('APP_WEB_ORIGIN', 'http://localhost:3000');
    // Les jetons transitent par le fragment d'URL (#) : contrairement à une
    // query string, il n'est jamais envoyé au serveur (ni logs d'accès, ni
    // Referer) — seul le JS côté client sur cette page peut le lire.
    const url = `${webOrigin}/connexion/google#access_token=${accessToken}&refresh_token=${refreshToken}`;
    return { url, statusCode: HttpStatus.FOUND };
  }
}
