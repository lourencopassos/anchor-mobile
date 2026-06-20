import apiClient from '../client';
import type {
  CheckIn,
  SubmitCheckInRequest,
  Reaction,
  ReactionsListResponse,
  AddReactionRequest,
  Comment,
  CommentsListResponse,
  AddCommentRequest,
} from '../types';

/**
 * Submit a check-in
 */
export async function submit(request: SubmitCheckInRequest): Promise<CheckIn> {
  const response = await apiClient.post<CheckIn>('/check-ins', request);
  return response.data;
}

/**
 * Get a single check-in
 */
export async function get(id: string): Promise<CheckIn> {
  const response = await apiClient.get<CheckIn>(`/check-ins/${id}`);
  return response.data;
}

/**
 * Get check-ins for a commitment
 */
export async function getForCommitment(
  commitmentId: string
): Promise<CheckIn[]> {
  const response = await apiClient.get<CheckIn[]>(
    `/check-ins/commitment/${commitmentId}`
  );
  return response.data;
}

// ============================================================================
// REACTIONS
// ============================================================================

/**
 * Get reactions for a check-in
 */
export async function getReactions(checkInId: string): Promise<ReactionsListResponse> {
  const response = await apiClient.get<ReactionsListResponse>(
    `/check-ins/${checkInId}/reactions`
  );
  return response.data;
}

/**
 * Add a reaction to a check-in
 */
export async function addReaction(
  checkInId: string,
  request: AddReactionRequest
): Promise<Reaction> {
  const response = await apiClient.post<Reaction>(
    `/check-ins/${checkInId}/reactions`,
    request
  );
  return response.data;
}

/**
 * Remove a reaction from a check-in
 */
export async function removeReaction(
  checkInId: string,
  emoji: string
): Promise<void> {
  await apiClient.delete(`/check-ins/${checkInId}/reactions/${encodeURIComponent(emoji)}`);
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Get comments for a check-in
 */
export async function getComments(checkInId: string): Promise<CommentsListResponse> {
  const response = await apiClient.get<CommentsListResponse>(
    `/check-ins/${checkInId}/comments`
  );
  return response.data;
}

/**
 * Add a comment to a check-in
 */
export async function addComment(
  checkInId: string,
  request: AddCommentRequest
): Promise<Comment> {
  const response = await apiClient.post<Comment>(
    `/check-ins/${checkInId}/comments`,
    request
  );
  return response.data;
}

/**
 * Delete a comment
 */
export async function deleteComment(
  checkInId: string,
  commentId: string
): Promise<void> {
  await apiClient.delete(`/check-ins/${checkInId}/comments/${commentId}`);
}
