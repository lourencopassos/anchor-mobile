import apiClient from '../client';
import type {
  CustodianSummary,
  PendingDeposit,
  DepositDetail,
  ConfirmDepositRequest,
  RejectDepositRequest,
  PendingSettlement,
  SettlementDetail,
  CompleteSettlementRequest,
  FailSettlementRequest,
  MarkDepositPaidRequest,
  DepositStatusResponse,
} from '../types';

// ============================================================================
// CUSTODIAN SUMMARY
// ============================================================================

/**
 * Get custodian pending items summary (badge counts).
 */
export async function getSummary(): Promise<CustodianSummary> {
  const response = await apiClient.get<CustodianSummary>('/custodian/summary');
  return response.data;
}

// ============================================================================
// DEPOSIT ENDPOINTS (CUSTODIAN)
// ============================================================================

/**
 * Get pending deposits for current custodian.
 */
export async function getPendingDeposits(): Promise<PendingDeposit[]> {
  const response = await apiClient.get<PendingDeposit[]>('/custodian/deposits/pending');
  return response.data;
}

/**
 * Get deposit detail.
 */
export async function getDepositDetail(depositId: string): Promise<DepositDetail> {
  const response = await apiClient.get<DepositDetail>(`/custodian/deposits/${depositId}`);
  return response.data;
}

/**
 * Confirm deposit receipt (activates commitment).
 */
export async function confirmDeposit(
  depositId: string,
  request?: ConfirmDepositRequest
): Promise<DepositDetail> {
  const response = await apiClient.post<DepositDetail>(
    `/custodian/deposits/${depositId}/confirm-received`,
    request || {}
  );
  return response.data;
}

/**
 * Reject deposit.
 */
export async function rejectDeposit(
  depositId: string,
  request: RejectDepositRequest
): Promise<DepositDetail> {
  const response = await apiClient.post<DepositDetail>(
    `/custodian/deposits/${depositId}/reject`,
    request
  );
  return response.data;
}

// ============================================================================
// SETTLEMENT ENDPOINTS (CUSTODIAN)
// ============================================================================

/**
 * Get pending settlement tasks for current custodian.
 */
export async function getPendingSettlements(): Promise<PendingSettlement[]> {
  const response = await apiClient.get<PendingSettlement[]>('/custodian/settlements/pending');
  return response.data;
}

/**
 * Get settlement task detail.
 */
export async function getSettlementDetail(taskId: string): Promise<SettlementDetail> {
  const response = await apiClient.get<SettlementDetail>(`/custodian/settlements/${taskId}`);
  return response.data;
}

/**
 * Mark settlement task as completed.
 */
export async function completeSettlement(
  taskId: string,
  request?: CompleteSettlementRequest
): Promise<SettlementDetail> {
  const response = await apiClient.post<SettlementDetail>(
    `/custodian/settlements/${taskId}/mark-completed`,
    request || {}
  );
  return response.data;
}

/**
 * Mark settlement task as failed.
 */
export async function failSettlement(
  taskId: string,
  request: FailSettlementRequest
): Promise<SettlementDetail> {
  const response = await apiClient.post<SettlementDetail>(
    `/custodian/settlements/${taskId}/mark-failed`,
    request
  );
  return response.data;
}

// ============================================================================
// DEPOSIT ENDPOINTS (CREATOR)
// ============================================================================

/**
 * Get deposit status for a commitment (creator view).
 */
export async function getDepositStatus(commitmentId: string): Promise<DepositStatusResponse> {
  const response = await apiClient.get<DepositStatusResponse>(
    `/commitments/${commitmentId}/deposit`
  );
  return response.data;
}

/**
 * Mark deposit as paid (creator action).
 */
export async function markDepositPaid(
  commitmentId: string,
  request?: MarkDepositPaidRequest
): Promise<DepositStatusResponse> {
  const response = await apiClient.post<DepositStatusResponse>(
    `/commitments/${commitmentId}/deposit/mark-paid`,
    request || {}
  );
  return response.data;
}
