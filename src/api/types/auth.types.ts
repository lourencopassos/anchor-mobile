// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export type Role = 'USER' | 'SUPPORTER' | 'ADMIN';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  phone?: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: Role[];
  firstName: string;
  lastName: string;
}

// ============================================================================
// INVITATION / CLAIM ACCOUNT TYPES
// ============================================================================

export interface InvitationValidation {
  valid: boolean;
  email: string;
  phone?: string;
  commitmentName: string;
  inviterName: string;
  supporterRole: string;
  supporterId: string;
  expiresAt: string;
}

export interface ClaimAccountRequest {
  token: string;
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
  phone?: string;
}
