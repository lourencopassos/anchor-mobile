import apiClient from '../client';
import type {
  Commitment,
  CreateCommitmentRequest,
  CreateCommitmentResponse,
  RestartCommitmentRequest,
  RestartEligibility,
  CycleHistoryItem,
  CommitmentPayoutStatus,
  ReportFailureRequest,
  ReportFailureResponse,
  SupporterActivityResponse,
  SupporterActivityQueryOptions,
} from '../types';

/**
 * List user's commitments
 */
export async function list(): Promise<Commitment[]> {
  const response = await apiClient.get<Commitment[]>('/commitments');
  return response.data;
}

/**
 * Get a single commitment
 */
export async function get(id: string): Promise<Commitment> {
  const response = await apiClient.get<Commitment>(`/commitments/${id}`);
  return response.data;
}

/**
 * Create a new commitment
 * Returns PIX payment details for Brazilian users
 */
export async function create(
  request: CreateCommitmentRequest,
  idempotencyKey: string
): Promise<CreateCommitmentResponse> {
  const response = await apiClient.post<CreateCommitmentResponse>(
    '/commitments',
    request,
    {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    }
  );
  return response.data;
}

/**
 * Check restart eligibility
 */
export async function checkRestartEligibility(
  id: string
): Promise<RestartEligibility> {
  const response = await apiClient.get<RestartEligibility>(
    `/commitments/${id}/restart-eligibility`
  );
  return response.data;
}

/**
 * Restart a failed commitment
 */
export async function restart(
  id: string,
  request: RestartCommitmentRequest
): Promise<{ commitmentId: string; cycleId: string }> {
  const response = await apiClient.post(`/commitments/${id}/restart`, request);
  return response.data;
}

/**
 * Get cycle history
 */
export async function getCycles(id: string): Promise<CycleHistoryItem[]> {
  const response = await apiClient.get<CycleHistoryItem[]>(
    `/commitments/${id}/cycles`
  );
  return response.data;
}

/**
 * Get payout status for a failed commitment (Phase D)
 */
export async function getPayoutStatus(
  id: string
): Promise<CommitmentPayoutStatus> {
  const response = await apiClient.get<CommitmentPayoutStatus>(
    `/commitments/${id}/payout-status`
  );
  return response.data;
}

/**
 * Self-report commitment failure
 * User voluntarily reports they have failed their commitment.
 * This immediately marks the commitment as BROKEN and initiates stake forfeiture.
 */
export async function reportFailure(
  id: string,
  request?: ReportFailureRequest
): Promise<ReportFailureResponse> {
  const response = await apiClient.post<ReportFailureResponse>(
    `/commitments/${id}/report-failure`,
    request || {}
  );
  return response.data;
}

/**
 * Cancel (remove) a DRAFT commitment.
 * Only valid for failed/incomplete DRAFT commitments — successfully created
 * commitments cannot be cancelled.
 */
export async function cancel(
  id: string
): Promise<{ id: string; state: string; message: string }> {
  const response = await apiClient.post<{ id: string; state: string; message: string }>(
    `/commitments/${id}/cancel`,
    {}
  );
  return response.data;
}

/**
 * Get supporter activity for a commitment (owner only)
 * Returns reactions, comments, and votes from supporters.
 */
export async function getSupporterActivity(
  id: string,
  options?: SupporterActivityQueryOptions
): Promise<SupporterActivityResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.cursor) params.append('cursor', options.cursor);
  if (options?.type) params.append('type', options.type);

  const queryString = params.toString();
  const url = `/commitments/${id}/supporter-activity${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<SupporterActivityResponse>(url);
  return response.data;
}
