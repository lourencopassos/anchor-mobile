// ============================================================================
// CHECK-IN TYPES
// ============================================================================

export enum CheckInStatus {
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
}

export enum EvidenceType {
  SELF_REPORT = 'SELF_REPORT',
  PHOTO = 'PHOTO',
  MANUAL = 'MANUAL',
}

export interface CheckIn {
  id: string;
  commitmentId: string;
  cycleId: string;
  userId: string;
  checkInDate: string;
  status: CheckInStatus;
  evidenceType: EvidenceType;
  notes: string | null;
  createdAt: string;
  wasCached: boolean;
}

export interface SubmitCheckInRequest {
  commitmentId: string;
  status: CheckInStatus;
  evidenceType: EvidenceType;
  notes?: string;
}

// For offline support
export interface PendingCheckIn {
  localId: string;
  request: SubmitCheckInRequest;
  createdAt: string;
  retryCount: number;
}

// ============================================================================
// REACTION TYPES
// ============================================================================

export const AVAILABLE_EMOJIS = ['👍', '❤️', '🎉', '💪', '🔥', '👏', '🙌', '⭐', '💯', '🤝'] as const;
export type ReactionEmoji = (typeof AVAILABLE_EMOJIS)[number];

export interface Reaction {
  id: string;
  checkinId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface ReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
  currentUserReacted: boolean;
}

export interface ReactionsListResponse {
  reactions: ReactionSummary[];
  totalCount: number;
}

export interface AddReactionRequest {
  emoji: string;
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

export interface Comment {
  id: string;
  checkinId: string;
  userId: string;
  userDisplayName: string | null;
  userAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentsListResponse {
  comments: Comment[];
  totalCount: number;
}

export interface AddCommentRequest {
  content: string;
}
