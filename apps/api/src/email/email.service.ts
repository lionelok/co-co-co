import { Injectable, Logger } from '@nestjs/common';

/**
 * Envoi d'emails transactionnels. Le fournisseur (Postmark, Amazon SES…,
 * cf. plan de développement §3) reste à choisir en Phase 0 — cette
 * implémentation se contente de logger en attendant, pour ne pas bloquer
 * le développement du flux d'inscription/vérification.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
    this.logger.warn(
      `[dev] Fournisseur d'email non configuré — lien de vérification pour ${to} : ${verificationUrl}`,
    );
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    this.logger.warn(
      `[dev] Fournisseur d'email non configuré — lien de réinitialisation pour ${to} : ${resetUrl}`,
    );
  }
}
