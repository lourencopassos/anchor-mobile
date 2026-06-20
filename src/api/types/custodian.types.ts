// ============================================================================
// CUSTODIAN TYPES
// Types for custodian mode in closed alpha
// ============================================================================

import { TemplateType } from './commitment.types';

// ============================================================================
// DEPOSIT TYPES
// ============================================================================

export type DepositStatus =
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_MARKED_BY_CREATOR'
  | 'RECEIVED_CONFIRMED_BY_CUSTODIAN'
  | 'REJECTED_BY_CUSTODIAN'
  | 'CANCELLED';

/**
 * Pending deposit item for custodian inbox list.
 */
export interface PendingDeposit {
  id: string;
  commitmentId: string;
  status: DepositStatus;
  amountCents: number;
  currency: string;
  creatorUserId: string;
  creatorDisplayName?: string;
  createdAt: string;
  markedPaidAt?: string;
  creatorReference?: string;
  creatorNotes?: string;
  commitmentTemplateType: TemplateType;
  commitmentStartDate: string;
  commitmentEndDate: string;
}

/**
 * Supporter summary in deposit detail.
 */
export interface DepositSupporter {
  displayName: string;
  amountCents: number;
}

/**
 * Deposit detail for custodian view.
 */
export interface DepositDetail extends PendingDeposit {
  custodianUserId: string;
  confirmedAt?: string;
  rejectedAt?: string;
  custodianReference?: string;
  custodianNotes?: string;
  rejectionReason?: string;
  commitmentWhyNote?: string;
  stakeAmountCents: number;
  charityPercent: number;
  supportersPercent: number;
  supporterCount: number;
  supporters: DepositSupporter[];
}

/**
 * Request to confirm deposit receipt.
 */
export interface ConfirmDepositRequest {
  reference?: string;
  notes?: string;
}

/**
 * Request to reject a deposit.
 */
export interface RejectDepositRequest {
  reason: string;
}

// ============================================================================
// SETTLEMENT TYPES
// ============================================================================

export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type SettlementRecipientType = 'SUPPORTER' | 'CHARITY' | 'APP_POOL';

/**
 * Pending settlement task for custodian inbox list.
 */
export interface PendingSettlement {
  id: string;
  commitmentId: string;
  stakeId: string;
  status: SettlementStatus;
  recipientType: SettlementRecipientType;
  recipientId: string;
  recipientDisplayName?: string;
  amountCents: number;
  currency: string;
  payoutDetails?: Record<string, unknown>;
  createdAt: string;
  commitmentFailureReason?: string;
  commitmentFailedAt?: string;
}

/**
 * Settlement task detail for custodian view.
 */
export interface SettlementDetail extends PendingSettlement {
  custodianUserId: string;
  completedAt?: string;
  failedAt?: string;
  externalReference?: string;
  completionNotes?: string;
  failureReason?: string;
  attemptCount: number;
  commitmentTemplateType: TemplateType;
  commitmentCreatorUserId: string;
  commitmentCreatorDisplayName?: string;
}

/**
 * Request to mark settlement as completed.
 */
export interface CompleteSettlementRequest {
  externalReference?: string;
  notes?: string;
}

/**
 * Request to mark settlement as failed.
 */
export interface FailSettlementRequest {
  reason: string;
}

// ============================================================================
// CUSTODIAN SUMMARY
// ============================================================================

/**
 * Summary of pending custodian tasks (for badge counts).
 */
export interface CustodianSummary {
  pendingDeposits: number;
  pendingSettlements: number;
  totalPending: number;
}

// ============================================================================
// DEPOSIT MARKING (CREATOR SIDE)
// ============================================================================

/**
 * Request to mark deposit as paid (creator action).
 */
export interface MarkDepositPaidRequest {
  reference?: string;
  notes?: string;
}

/**
 * Deposit status response for creator.
 */
export interface DepositStatusResponse {
  id: string;
  commitmentId: string;
  status: DepositStatus;
  amountCents: number;
  currency: string;
  custodianUserId: string;
  custodianDisplayName?: string;
  custodianPixKey?: string;
  createdAt: string;
  markedPaidAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
