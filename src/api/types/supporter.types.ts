// ============================================================================
// SUPPORTER TYPES
// ============================================================================

import type { CommitmentState, TemplateType } from './commitment.types';
import { EvidenceType } from './checkin.types';

export enum SupporterRole {
  OBSERVER = 'OBSERVER',
  ENCOURAGER = 'ENCOURAGER',
  VERIFIER = 'VERIFIER',
}

export enum SupporterRelationshipState {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  DECLINED = 'DECLINED',
  REMOVED = 'REMOVED',
}

export interface Supporter {
  id: string;
  commitmentId: string;
  supporterUserId: string;
  displayName?: string | null;
  email?: string;
  phone?: string | null;
  role: SupporterRole;
  state: SupporterRelationshipState;
  invitedAt: string;
  acceptedAt: string | null;
}

export interface InviteSupporterRequest {
  email?: string;
  userId?: string;
  phone?: string;
  role: SupporterRole;
}

// ============================================================================
// SUPPORTED COMMITMENTS (Supporter's View)
// ============================================================================

/**
 * Supporter relationship details embedded in the commitment response.
 */
export interface SupporterRelationship {
  id: string;
  role: SupporterRole;
  state: SupporterRelationshipState;
  invitedAt: string;
  acceptedAt: string | null;
}

/**
 * A commitment that the authenticated user is supporting.
 */
export interface SupportedCommitment {
  id: string;
  ownerId: string;
  ownerDisplayName: string;
  ownerAvatarUrl?: string;
  templateType: TemplateType;
  state: CommitmentState;
  startDate: string;
  endDate: string;
  progress: number;
  currentStreak: number;
  totalCheckIns: number;
  completedCheckIns: number;
  supporterRelationship: SupporterRelationship;
}

/**
 * Response for listing supported commitments.
 */
export interface SupportedCommitmentsResponse {
  commitments: SupportedCommitment[];
  totalCount: number;
}

/**
 * Check-in for a supported commitment (read-only view for supporters).
 */
export interface SupportedCheckIn {
  id: string;
  commitmentId: string;
  cycleId: string;
  userId: string;
  checkInDate: string;
  status: 'COMPLETED' | 'SKIPPED' | 'MISSED';
  evidenceType: string;
  notes: string | null;
  createdAt: string;
}

/**
 * Detailed view of a supported commitment, including check-ins.
 */
export interface SupportedCommitmentDetail extends SupportedCommitment {
  checkIns: SupportedCheckIn[];
}

/**
 * Filter options for listing supported commitments.
 */
export type SupportedCommitmentFilter = 'all' | 'active' | 'completed';

// ============================================================================
// SUPPORTER ACTIVITY (Owner's View)
// ============================================================================

/**
 * Activity type for supporter engagement.
 */
export enum SupporterActivityType {
  REACTION = 'REACTION',
  COMMENT = 'COMMENT',
  VERIFICATION = 'VERIFICATION',
}

/**
 * Single activity item from a supporter.
 */
export interface SupporterActivity {
  id: string;
  type: SupporterActivityType;
  supporterId: string;
  supporterName: string;
  supporterAvatarUrl?: string | null;
  checkInId?: string;
  checkInDate?: string;
  emoji?: string;
  content?: string;
  verificationType?: 'VERIFY' | 'DISPUTE' | 'SKIP';
  verificationReason?: string;
  createdAt: string;
}

/**
 * Response for supporter activity feed.
 */
export interface SupporterActivityResponse {
  items: SupporterActivity[];
  nextCursor?: string;
  totalCount: number;
}

/**
 * Query options for fetching supporter activity.
 */
export interface SupporterActivityQueryOptions {
  limit?: number;
  cursor?: string;
  type?: SupporterActivityType;
}

// ============================================================================
// CHECK-IN VERIFICATION (Supporter's View)
// ============================================================================

// EvidenceType is imported from checkin.types.ts to avoid duplicate export
export { EvidenceType };

/**
 * Type of verification action a supporter can take.
 */
export enum VerificationType {
  VERIFY = 'VERIFY',
  DISPUTE = 'DISPUTE',
  SKIP = 'SKIP',
}

/**
 * A pending verification that the supporter needs to act on.
 */
export interface PendingVerification {
  checkInId: string;
  commitmentId: string;
  ownerId: string;
  ownerDisplayName: string;
  ownerAvatarUrl?: string;
  checkInDate: string;
  evidenceType: EvidenceType;
  notes?: string;
  deadline: string;
  createdAt: string;
}

/**
 * Response for listing pending verifications.
 */
export interface PendingVerificationsResponse {
  verifications: PendingVerification[];
  totalCount: number;
}

/**
 * Request to verify a check-in.
 */
export interface VerifyCheckInRequest {
  checkInId: string;
  verificationType: VerificationType;
  reason?: string;
}

/**
 * Response after verifying a check-in.
 */
export interface VerificationResponse {
  id: string;
  checkInId: string;
  commitmentId: string;
  supporterUserId: string;
  verificationType: VerificationType;
  reason?: string;
  verifiedAt: string;
}
