import type { Metadata } from 'next';
import { GoogleCallback } from '@/components/auth/google-callback';

export const metadata: Metadata = { title: 'Connexion avec Google' };

export default function ConnexionGooglePage() {
  return <GoogleCallback />;
}
