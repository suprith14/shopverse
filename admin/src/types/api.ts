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

// Error body the backend sends: { error: { message, details? } }
export interface ApiErrorBody {
  error: { message: string; details?: { field: string; message: string }[] };
}
