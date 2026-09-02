/** Contenu du JWT d'accès. `sub` = id du membre (convention standard JWT). */
export interface JwtPayload {
  sub: string;
  email: string;
}
