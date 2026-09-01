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
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshDto } from './dto/refresh.dto.js';
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js';
import type { GoogleProfile } from './strategies/google.strategy.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
    // Les jetons transitent par le fragment d'URL (#) : contrairement à la query
    // string, il n'est pas envoyé au serveur ni loggé côté web. `apps/web` devra
    // les récupérer côté client sur cette page (non encore implémenté).
    const url = `${webOrigin}/connexion/google?access_token=${accessToken}&refresh_token=${refreshToken}`;
    return { url, statusCode: HttpStatus.FOUND };
  }
}
