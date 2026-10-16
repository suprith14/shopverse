// Shapes of the data returned by the backend API (same backend as the store).
// Money is always in cents (integers), formatted only for display.

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface AdminVariant {
  id: string;
  sku: string;
  name: string;
  options: Record<string, string>;
  price: number; // cents
  stock: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  categoryId: string;
  category: Category;
  basePrice: number; // cheapest variant, cents
  images: string[];
  attributes: Record<string, unknown>;
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: AdminVariant[];
}

// The list adds two computed fields.
export interface AdminProductListItem extends AdminProduct {
  totalStock: number;
  lowStock: boolean;
}

// Error body the backend sends: { error: { message, details? } }
export interface ApiErrorBody {
  error: { message: string; details?: { field: string; message: string }[] };
}
