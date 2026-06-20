import apiClient from '../client';
import type {
  Supporter,
  InviteSupporterRequest,
  PendingVerificationsResponse,
  VerifyCheckInRequest,
  VerificationResponse,
} from '../types';

/**
 * Invite a supporter
 */
export async function invite(
  commitmentId: string,
  request: InviteSupporterRequest
): Promise<Supporter> {
  const response = await apiClient.post<Supporter>(
    `/commitments/${commitmentId}/supporters`,
    request
  );
  return response.data;
}

/**
 * List supporters for a commitment
 */
export async function list(commitmentId: string): Promise<Supporter[]> {
  const response = await apiClient.get<Supporter[]>(
    `/commitments/${commitmentId}/supporters`
  );
  return response.data;
}

/**
 * Accept invitation
 */
export async function accept(supporterId: string): Promise<Supporter> {
  const response = await apiClient.post<Supporter>(
    `/supporters/${supporterId}/accept`
  );
  return response.data;
}

/**
 * Decline invitation
 */
export async function decline(supporterId: string): Promise<void> {
  await apiClient.post(`/supporters/${supporterId}/decline`);
}

/**
 * Remove supporter
 */
export async function remove(supporterId: string): Promise<void> {
  await apiClient.delete(`/supporters/${supporterId}`);
}

/**
 * Resend invitation to a supporter
 */
export async function resend(supporterId: string): Promise<Supporter> {
  const response = await apiClient.post<Supporter>(
    `/supporters/${supporterId}/resend`
  );
  return response.data;
}

// ============================================================================
// CHECK-IN VERIFICATION
// ============================================================================

/**
 * Get pending verifications for the current supporter
 */
export async function getPendingVerifications(): Promise<PendingVerificationsResponse> {
  const response = await apiClient.get<PendingVerificationsResponse>(
    '/supporters/pending-verifications'
  );
  return response.data;
}

/**
 * Verify a check-in (VERIFY, DISPUTE, or SKIP)
 */
export async function verifyCheckIn(
  request: VerifyCheckInRequest
): Promise<VerificationResponse> {
  const response = await apiClient.post<VerificationResponse>(
    '/supporters/verify-checkin',
    request
  );
  return response.data;
}
