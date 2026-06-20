// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export enum NotificationType {
  COMMITMENT_ACTIVATED = 'COMMITMENT_ACTIVATED',
  COMMITMENT_RESTARTED = 'COMMITMENT_RESTARTED',
  CHECKIN_MISSED = 'CHECKIN_MISSED',
  EVALUATION_SUMMARY = 'EVALUATION_SUMMARY',
  SUPPORTER_INVITED = 'SUPPORTER_INVITED',
  VOTE_RECEIVED = 'VOTE_RECEIVED',
  FAILURE_THRESHOLD = 'FAILURE_THRESHOLD',
  // Check-in engagement (Phase 14)
  REACTION_RECEIVED = 'REACTION_RECEIVED',
  COMMENT_RECEIVED = 'COMMENT_RECEIVED',
  PEER_REACTION = 'PEER_REACTION',
  PEER_COMMENT = 'PEER_COMMENT',
}

export interface NotificationInboxItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationInboxResponse {
  items: NotificationInboxItem[];
  nextCursor?: string;
  unreadCount: number;
}

export interface MarkAsReadResponse {
  id: string;
  isRead: boolean;
  readAt: string;
}

export interface MarkAllReadResponse {
  updatedCount: number;
}
