// ============================================================================
// INVITATION LINK TYPES
// ============================================================================

import { SupporterRole } from './supporter.types';

/**
 * Source of a supporter invitation for attribution tracking.
 */
export enum InvitationSource {
  EMAIL_INVITE = 'email_invite',
  SMS_INVITE = 'sms_invite',
  SHAREABLE_LINK = 'shareable_link',
  QR_CODE = 'qr_code',
  DIRECT = 'direct',
  ADS = 'ads',
  REFERRAL = 'referral',
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to generate a shareable invitation link.
 */
export interface GenerateInvitationLinkRequest {
  role: SupporterRole;
  maxUses?: number | null;
}

/**
 * Request to claim an invitation link.
 */
export interface ClaimInvitationLinkRequest {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Generated invitation link response.
 */
export interface InvitationLink {
  id: string;
  code: string;
  url: string;
  role: SupporterRole;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Invitation link context for the join screen (public data).
 */
export interface InvitationLinkContext {
  commitmentName: string;
  templateType: string;
  inviterName: string;
  inviterAvatarUrl?: string;
  role: SupporterRole;
  supporterMessage?: string;
  stakeAmountCents: number;
  stakeCurrency: string;
  charityPercent: number;
  supportersPercent: number;
  startDate: string;
  endDate: string;
  expiresAt: string;
  remainingUses: number | null;
}

/**
 * Response after claiming an invitation link.
 */
export interface ClaimInvitationLinkResponse {
  supporterId: string;
  commitmentId: string;
  role: SupporterRole;
  message: string;
}

/**
 * Invitation link statistics.
 */
export interface InvitationLinkStats {
  linkId: string;
  totalClaims: number;
  maxUses: number | null;
  remaining: number | null;
  isActive: boolean;
  expiresAt: string;
}
