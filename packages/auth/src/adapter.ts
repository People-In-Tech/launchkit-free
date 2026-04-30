export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: string;
  createdAt: Date;
}

export interface AuthSession {
  userId: string;
  orgId: string | null;
  role: string | null;
}

export interface AuthAdapter {
  getCurrentUser(): Promise<AuthUser | null>;
  getSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}
