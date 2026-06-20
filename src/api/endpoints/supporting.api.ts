/**
 * =============================================================================
 * SUPPORTING API
 * =============================================================================
 *
 * API endpoints for the supporter's view of commitments they're supporting.
 * These endpoints provide access to commitments the user has been invited to
 * support, with full progress visibility and engagement capabilities.
 */

import apiClient from '../client';
import type {
  SupportedCommitmentsResponse,
  SupportedCommitmentDetail,
  SupportedCheckIn,
  SupportedCommitmentFilter,
} from '../types';

/**
 * Get all commitments the current user is supporting.
 *
 * @param filter - Optional filter by commitment state ('all', 'active', 'completed')
 * @returns List of supported commitments with owner info and progress metrics
 */
export async function getSupportedCommitments(
  filter?: SupportedCommitmentFilter
): Promise<SupportedCommitmentsResponse> {
  const params = filter ? { state: filter } : undefined;
  const response = await apiClient.get<SupportedCommitmentsResponse>(
    '/supporters/my-commitments',
    { params }
  );
  return response.data;
}

/**
 * Get detailed view of a specific commitment the user is supporting.
 * Includes recent check-ins and the user's vote if they have voted.
 *
 * @param commitmentId - The commitment ID
 * @returns Full commitment detail with check-ins and voting status
 */
export async function getSupportedCommitment(
  commitmentId: string
): Promise<SupportedCommitmentDetail> {
  const response = await apiClient.get<SupportedCommitmentDetail>(
    `/supporters/my-commitments/${commitmentId}`
  );
  return response.data;
}

/**
 * Get paginated check-ins for a commitment the user is supporting.
 *
 * @param commitmentId - The commitment ID
 * @param options - Pagination options (limit, offset)
 * @returns List of check-ins for the commitment
 */
export async function getSupportedCommitmentCheckIns(
  commitmentId: string,
  options?: { limit?: number; offset?: number }
): Promise<SupportedCheckIn[]> {
  const response = await apiClient.get<SupportedCheckIn[]>(
    `/supporters/my-commitments/${commitmentId}/check-ins`,
    { params: options }
  );
  return response.data;
}
