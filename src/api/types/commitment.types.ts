// ============================================================================
// COMMITMENT TYPES
// Aligned with OpenAPI generated types from generated.ts
// ============================================================================

import i18n from '@i18n/index';

// CommitmentResponseDto state values (from CreateCommitmentResponseDto)
export type CommitmentState =
  | 'DRAFT'
  | 'PENDING_DEPOSIT'  // Custodian mode: awaiting deposit confirmation
  | 'ACTIVE'
  | 'COMPLETED'
  | 'BROKEN'
  | 'CANCELLED';

// Custody mode for stake management
export type CustodyMode = 'AUTO' | 'MANUAL';

// Query filter state values (includes additional states for filtering)
export type CommitmentFilterState =
  | 'DRAFT'
  | 'PENDING_STAKE'
  | 'ACTIVE'
  | 'PAUSED'
  | 'FAILED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TemplateType =
  | 'QUIT_SMOKING'
  | 'EXERCISE'
  | 'MEDITATION'
  | 'DIET'
  | 'SLEEP'
  | 'CUSTOM';

export type CycleStatus =
  | 'ACTIVE'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'ABANDONED';

export type RecoveryMode =
  | 'FULL_RESET'
  | 'RETRY_WITH_SAME_RULES'
  | 'ADJUSTED_RETRY';

export type CycleEndReason =
  | 'SUPPORTER_VOTE'
  | 'TIME_EXPIRED'
  | 'USER_ABANDONED'
  | 'COMPLETED_SUCCESSFULLY'
  | 'SELF_REPORTED_FAILURE';

// Verification authority types for failure determination
export type VerificationAuthorityType =
  | 'SELF_ONLY'          // Only creator can fail (default)
  | 'SINGLE_SUPPORTER'   // One supporter can fail
  | 'UNANIMOUS'          // All supporters must vote
  | 'MAJORITY'           // Majority of supporters
  | 'SUPERMAJORITY';     // Configurable supermajority

// ============================================================================
// FREQUENCY & SCHEDULE TYPES (Commitment Templates feature)
// ============================================================================

/**
 * Check-in frequency types.
 */
export type FrequencyType =
  | 'DAILY'              // Every day
  | 'TIMES_PER_WEEK'     // X times per week (any days)
  | 'TIMES_PER_MONTH'    // X times per month (any days)
  | 'SPECIFIC_DAYS';     // Specific days of the week

/**
 * Days of the week (ISO 8601: 1=Monday, 7=Sunday).
 */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Frequency configuration for check-ins.
 * Make-up check-ins are allowed on any day within the commitment period.
 */
export interface FrequencyConfig {
  /** Type of frequency */
  type: FrequencyType;
  /** Target count per period (1-7 for weekly, 1-30 for monthly) */
  targetCount?: number;
  /** Specific days of week (for SPECIFIC_DAYS, array: 1=Mon to 7=Sun) */
  specificDays?: DayOfWeek[];
}

/**
 * Schedule configuration for check-in reminders.
 * Enforcement is SOFT - reminders only, no hard deadlines.
 */
export interface ScheduleConfig {
  /** Preferred check-in time (HH:mm in user's timezone) */
  preferredTime?: string;
  /** Minutes before preferred time to send reminder (5-120) */
  reminderMinutesBefore?: number;
  /** Send reminder at exact preferred time */
  reminderAtTime?: boolean;
}

/**
 * Default frequency configuration (DAILY).
 */
export const DEFAULT_FREQUENCY_CONFIG: FrequencyConfig = {
  type: 'DAILY',
};

/**
 * Default schedule configuration.
 */
export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  reminderMinutesBefore: 15,
  reminderAtTime: true,
};

/**
 * Template-specific default frequencies.
 */
export const TEMPLATE_FREQUENCY_DEFAULTS: Record<TemplateType, FrequencyConfig> = {
  QUIT_SMOKING: { type: 'DAILY' },
  EXERCISE: { type: 'TIMES_PER_WEEK', targetCount: 3 },
  MEDITATION: { type: 'DAILY' },
  DIET: { type: 'DAILY' },
  SLEEP: { type: 'DAILY' },
  CUSTOM: { type: 'DAILY' },
};

/**
 * Template-specific default schedules.
 */
export const TEMPLATE_SCHEDULE_DEFAULTS: Record<TemplateType, ScheduleConfig> = {
  QUIT_SMOKING: { reminderMinutesBefore: 15, reminderAtTime: true },
  EXERCISE: { preferredTime: '18:00', reminderMinutesBefore: 30, reminderAtTime: true },
  MEDITATION: { preferredTime: '07:00', reminderMinutesBefore: 15, reminderAtTime: true },
  DIET: { preferredTime: '21:00', reminderMinutesBefore: 15, reminderAtTime: true },
  SLEEP: { preferredTime: '09:00', reminderMinutesBefore: 15, reminderAtTime: true },
  CUSTOM: { reminderMinutesBefore: 15, reminderAtTime: true },
};

/**
 * Template-specific "why" prompts for motivation.
 */
export const TEMPLATE_WHY_PROMPTS: Record<TemplateType, string[]> = {
  QUIT_SMOKING: ['Health', 'Family', 'Money', 'Freedom', 'Energy', 'Smell/Taste'],
  EXERCISE: ['Energy', 'Strength', 'Appearance', 'Mental Health', 'Longevity', 'Confidence'],
  MEDITATION: ['Stress Relief', 'Focus', 'Sleep', 'Inner Peace', 'Clarity', 'Patience'],
  DIET: ['Weight', 'Energy', 'Health Condition', 'Confidence', 'Longevity', 'Performance'],
  SLEEP: ['Energy', 'Productivity', 'Health', 'Mood', 'Focus', 'Recovery'],
  CUSTOM: ['Personal Growth', 'Discipline', 'Achievement', 'Happiness', 'Relationships', 'Career'],
};

/**
 * Get easier frequency recommendation for restart.
 * Returns null if no easier frequency is recommended.
 */
export function getEasierFrequencyRecommendation(
  currentFrequency: FrequencyConfig,
): FrequencyConfig | null {
  switch (currentFrequency.type) {
    case 'DAILY':
      return { type: 'TIMES_PER_WEEK', targetCount: 5 };
    case 'TIMES_PER_WEEK': {
      const count = currentFrequency.targetCount ?? 3;
      if (count >= 5) return { type: 'TIMES_PER_WEEK', targetCount: 3 };
      if (count >= 3) return { type: 'TIMES_PER_WEEK', targetCount: 2 };
      return null;
    }
    case 'TIMES_PER_MONTH': {
      const count = currentFrequency.targetCount ?? 10;
      if (count >= 15) return { type: 'TIMES_PER_MONTH', targetCount: 10 };
      if (count >= 10) return { type: 'TIMES_PER_MONTH', targetCount: 6 };
      return null;
    }
    case 'SPECIFIC_DAYS': {
      const days = currentFrequency.specificDays?.length ?? 0;
      if (days >= 5) return { type: 'TIMES_PER_WEEK', targetCount: 3 };
      if (days >= 3) return { type: 'TIMES_PER_WEEK', targetCount: 2 };
      return null;
    }
    default:
      return null;
  }
}

/**
 * Format frequency config into human-readable string.
 */
export function formatFrequency(frequency: FrequencyConfig): string {
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

  switch (frequency.type) {
    case 'DAILY':
      return i18n.t('commitments:frequency.formatted.daily');
    case 'TIMES_PER_WEEK':
      return i18n.t('commitments:frequency.formatted.timesPerWeek', { count: frequency.targetCount ?? 3 });
    case 'TIMES_PER_MONTH':
      return i18n.t('commitments:frequency.formatted.timesPerMonth', { count: frequency.targetCount ?? 10 });
    case 'SPECIFIC_DAYS': {
      const days = frequency.specificDays
        ?.map((d) => i18n.t(`commitments:frequency.days.${dayKeys[d - 1]}`))
        .join(', ');
      return days || i18n.t('commitments:frequency.formatted.noDaysSelected');
    }
    default:
      return i18n.t('commitments:frequency.formatted.unknown');
  }
}

export interface DistributionConfig {
  charityPercent: number;
  supportersPercent: number;
  charityId?: string;
}

export interface CurrentCycle {
  id: string;
  sequenceNumber: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  completedCheckIns: number;
  missedCheckIns: number;
  status: CycleStatus;
}

// Pending deposit summary (for custodian mode commitments)
export interface PendingDepositSummary {
  id: string;
  status: 'AWAITING_PAYMENT' | 'PAYMENT_MARKED_BY_CREATOR' | 'RECEIVED_CONFIRMED_BY_CUSTODIAN' | 'REJECTED_BY_CUSTODIAN';
  amountCents: number;
  currency: string;
  custodianUserId: string;
  createdAt: string;
  markedPaidAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// Matches CommitmentResponseDto from generated.ts
export interface Commitment {
  id: string;
  userId: string;
  templateType: TemplateType;
  state: CommitmentState;
  timezone: string;
  stakeAmountCents?: number;
  stakeCurrency?: string;
  stakeState?: string;
  startDate: string;
  endDate: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
  currentCycle?: CurrentCycle;
  // Frequency & Schedule (from rule snapshot when active)
  frequency?: FrequencyConfig;
  schedule?: ScheduleConfig;
  whyNote?: string;
  // Custodian mode fields (Closed Alpha)
  custodianUserId?: string;
  custodyMode?: CustodyMode;
  pendingDeposit?: PendingDepositSummary;
}

// Initial supporter to invite when creating commitment
export interface InitialSupporterInvite {
  email?: string;
  phone?: string;
  role: 'OBSERVER' | 'ENCOURAGER' | 'VERIFIER';
}

// Matches CreateCommitmentDto from generated.ts
export interface CreateCommitmentRequest {
  templateType: TemplateType;
  timezone: string;
  stakeAmountCents: number;
  stakeCurrency?: string;
  startDate: string;
  endDate: string;
  distributionConfig?: DistributionConfig;
  // Frequency & Schedule (Commitment Templates feature)
  frequencyConfig?: FrequencyConfig;
  scheduleConfig?: ScheduleConfig;
  whyNote?: string;           // Personal motivation note (max 500 chars)
  // Phase C: Payment fields (all optional - backend auto-detects country from IP)
  country?: string;           // ISO 3166-1 alpha-2 ('US', 'BR') - optional override
  paymentMethodId?: string;   // Stripe payment method ID (for card payments)
  customerDocument?: string;  // CPF for Brazil (required when country=BR)
  customerEmail?: string;     // Email for payment receipts
  // Initial supporters to invite (optional)
  initialSupporters?: InitialSupporterInvite[];
  // Verification settings - who can vote to fail the commitment
  verificationAuthorityType?: VerificationAuthorityType;
  // Custodian mode (Closed Alpha) - if set, commitment uses manual custody
  custodianUserId?: string;
}

// Matches CreateCommitmentResponseDto from generated.ts
export interface CreateCommitmentResponse {
  id: string;
  state: CommitmentState;
  message: string;
  // Phase C: PIX payment fields (present for BR PIX payments)
  pixQrCode?: string;         // QR code data for rendering
  pixCopyPaste?: string;      // Copy-paste code
  paymentExpiresAt?: string;  // ISO timestamp when payment expires
  detectedCountry?: string;   // Country detected by backend from IP
  // Error field (present when payment capture failed but commitment was still created)
  paymentError?: string;      // Error message if payment failed
}

// Matches RestartCommitmentDto from generated.ts
export interface RestartCommitmentRequest {
  recoveryMode: RecoveryMode;
  newStartDate: string;
  newEndDate: string;
  newStakeAmountCents?: number;
  newDistributionConfig?: DistributionConfig;
  // Frequency changes (ADJUSTED_RETRY only) - recommend easier frequency on restart
  newFrequencyConfig?: FrequencyConfig;
  newScheduleConfig?: ScheduleConfig;
  reinviteSupporterIds?: string[];
}

// Matches RestartCommitmentResponseDto from generated.ts
export interface RestartCommitmentResponse {
  commitmentId: string;
  cycleId: string;
  cycleNumber: number;
  state: string;
  recoveryMode: RecoveryMode;
  newStartDate: string;
  newEndDate: string;
  stakeAmountCents: number;
  message: string;
}

// Matches RestartEligibilityResponseDto from generated.ts
export interface RestartEligibility {
  canRestart: boolean;
  reason?: string;
  lastCycleStatus?: CycleStatus;
  totalCycles: number;
}

// Matches CycleHistoryItemDto from generated.ts
export interface CycleHistoryItem {
  id: string;
  sequenceNumber: number;
  status: CycleStatus;
  recoveryMode?: RecoveryMode;
  startDate: string;
  endDate: string;
  startedAt: string;
  endedAt?: string;
  endReason?: CycleEndReason;
}

// Matches CycleDetailDto from generated.ts
export interface CycleDetail extends CycleHistoryItem {
  commitmentId: string;
  stakeId?: string;
}

// ============================================================================
// PAYOUT TYPES (Phase D)
// ============================================================================

export type PayoutRecipientType = 'SUPPORTER' | 'CHARITY' | 'APP_POOL';
export type PayoutStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PayoutTransaction {
  id: string;
  recipientType: PayoutRecipientType;
  recipientId: string;
  amountCents: number;
  status: PayoutStatusType;
  completedAt?: string;
}

export interface DistributionResult {
  originalAmountCents: number;
  charityAmountCents: number;
  supportersAmountCents: number;
  totalDistributedCents: number;
  recipientCount: number;
}

export interface CommitmentPayoutStatus {
  commitmentId: string;
  stakeId: string | null;
  stakeState: string | null;
  distributionResult: DistributionResult | null;
  payouts: PayoutTransaction[];
  allPayoutsCompleted: boolean;
}

// ============================================================================
// SELF-REPORT FAILURE TYPES
// ============================================================================

/**
 * Request body for self-reporting commitment failure.
 */
export interface ReportFailureRequest {
  /** Optional reason for the failure (max 500 characters) */
  reason?: string;
}

/**
 * Response after self-reporting failure.
 */
export interface ReportFailureResponse {
  /** Commitment ID */
  id: string;
  /** New commitment state (always BROKEN) */
  state: CommitmentState;
  /** ISO timestamp when failure was recorded */
  failedAt: string;
  /** Confirmation message */
  message: string;
}
