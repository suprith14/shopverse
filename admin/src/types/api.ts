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

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

interface OrderBase {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  invoiceNumber: number | null;
  cardBrand: string | null;
  cardLast4: string | null;
  receiptUrl: string | null;
  // Copied from the customer's address book at checkout. null for orders placed before addresses existed.
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListItem extends OrderBase {
  user: { name: string; email: string };
  _count: { items: number };
}

export interface AdminOrderDetail extends OrderBase {
  invoiceLabel: string | null; // "INV-2026-00042" once paid
  user: { id: string; name: string; email: string };
  coupon: { code: string } | null;
  items: {
    id: string;
    variantId: string;
    productName: string; // snapshot
    variantName: string;
    unitPrice: number; // snapshot, cents
    quantity: number;
    variant: { sku: string; product: { id: string; slug: string; images: string[] } };
  }[];
  reservations: { status: 'ACTIVE' | 'CONSUMED' | 'RELEASED'; expiresAt: string }[];
}

// Error body the backend sends: { error: { message, details? } }
export interface ApiErrorBody {
  error: { message: string; details?: { field: string; message: string }[] };
}
