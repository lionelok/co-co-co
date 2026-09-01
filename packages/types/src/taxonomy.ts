/** Grand secteur d'évaluation (ex. Politique, Économie, Justice…). */
export interface Sector {
  id: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
}

/** Catégorie rattachée à un secteur. */
export interface Category {
  id: string;
  sectorId: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
  order: number;
}

/** Sous-catégorie rattachée à une catégorie (optionnelle). */
export interface Subcategory {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  active: boolean;
  order: number;
}
