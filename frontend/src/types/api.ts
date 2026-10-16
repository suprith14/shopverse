// Shapes of the data returned by the backend API.
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  image: string | null;
  ratingAvg: number;
  ratingCount: number;
  inStock: boolean;
  category: { name: string; slug: string };
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  options: Record<string, string>;
  price: number;
  stock: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  basePrice: number;
  images: string[];
  attributes: Record<string, unknown>;
  ratingAvg: number;
  ratingCount: number;
  category: { name: string; slug: string };
  variants: ProductVariant[];
}

export interface CartItem {
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  productSlug: string;
  brand: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  issue: 'OUT_OF_STOCK' | 'NOT_ENOUGH_STOCK' | null;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hasIssues: boolean;
}

export interface CouponPreview {
  code: string;
  description: string; // "10% off", "$20.00 off"
  subtotal: number;
  discount: number;
  total: number;
}

export interface WishlistEntry {
  addedAt: string;
  product: ProductSummary;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  error: { message: string; details?: { field: string; message: string }[] };
}
