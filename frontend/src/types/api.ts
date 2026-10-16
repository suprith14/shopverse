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

export type ProductSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating';

// Counts shown next to each filter option, e.g. "Nike (3)".
export interface ProductFacets {
  categories: { slug: string; name: string; count: number }[];
  brands: { value: string; count: number }[];
  ratings: { min: number; count: number }[];
}

export interface ProductList extends Paginated<ProductSummary> {
  sort: ProductSort; // the sort actually used ('relevance' by default when searching)
  matchMode: 'all' | 'any' | null; // 'any' = no product had every word, showing partial matches
  facets: ProductFacets;
}

export interface SearchSuggestions {
  products: { id: string; name: string; slug: string; brand: string | null; basePrice: number; image: string | null }[];
  brands: string[];
  categories: { name: string; slug: string }[];
}

export interface Review {
  id: string;
  productId: string;
  rating: number; // 1..5
  title: string;
  body: string;
  createdAt: string;
}

export interface PublicReview extends Review {
  author: string; // "Demo C."
  verifiedPurchase: boolean;
}

export interface ReviewList {
  ratingAvg: number;
  ratingCount: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
  items: PublicReview[];
  page: number;
  totalPages: number;
}

export interface MyReviewStatus {
  canReview: boolean;
  reason: string | null;
  review: Review | null;
}

export interface Address {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string; // ISO code, e.g. "IN"
  isDefault: boolean;
}

export interface Profile extends User {
  phone: string | null;
  dateOfBirth: string | null; // "1998-04-21"
  avatarUrl: string | null;
  defaultAddressId: string | null;
  createdAt: string;
  addresses: Address[]; // default first
}

// The copy of the address stored on an order at checkout.
export type ShippingAddress = Omit<Address, 'id' | 'label' | 'isDefault'>;

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string; // snapshot at the time of the order
  variantName: string;
  unitPrice: number; // snapshot at the time of the order
  quantity: number;
  lineTotal: number;
  productSlug: string;
  image: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  paymentDeadline: string | null; // only while PENDING
  createdAt: string;
  shippingAddress: ShippingAddress | null; // null for orders placed before addresses existed
  invoiceLabel: string | null; // "INV-2026-00042" once paid
  cardBrand: string | null; // "visa"
  cardLast4: string | null;
  receiptUrl: string | null; // Stripe's hosted receipt
  items: OrderItem[];
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
