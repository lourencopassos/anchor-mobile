import axios from 'axios';
import apiClient from '../client';
import { ENV } from '@config/env';
import type {
  GenerateInvitationLinkRequest,
  InvitationLink,
  InvitationLinkContext,
  ClaimInvitationLinkRequest,
  ClaimInvitationLinkResponse,
  InvitationLinkStats,
} from '../types';

// ============================================================================
// OWNER ENDPOINTS (Authenticated)
// ============================================================================

/**
 * Generate a shareable invitation link for a commitment.
 */
export async function generateLink(
  commitmentId: string,
  request: GenerateInvitationLinkRequest
): Promise<InvitationLink> {
  const response = await apiClient.post<InvitationLink>(
    `/commitments/${commitmentId}/invitation-links`,
    request
  );
  return response.data;
}

/**
 * List all invitation links for a commitment.
 */
export async function listLinks(commitmentId: string): Promise<InvitationLink[]> {
  const response = await apiClient.get<InvitationLink[]>(
    `/commitments/${commitmentId}/invitation-links`
  );
  return response.data;
}

/**
 * Deactivate an invitation link.
 */
export async function deactivateLink(
  commitmentId: string,
  linkId: string
): Promise<void> {
  await apiClient.delete(`/commitments/${commitmentId}/invitation-links/${linkId}`);
}

/**
 * Get statistics for an invitation link.
 */
export async function getLinkStats(
  commitmentId: string,
  linkId: string
): Promise<InvitationLinkStats> {
  const response = await apiClient.get<InvitationLinkStats>(
    `/commitments/${commitmentId}/invitation-links/${linkId}/stats`
  );
  return response.data;
}

// ============================================================================
// PUBLIC ENDPOINTS (No Authentication Required)
// ============================================================================

/**
 * Get invitation link context (public).
 * This fetches commitment information for the join screen.
 */
export async function getLinkContext(
  code: string,
  utmParams?: Record<string, string>
): Promise<InvitationLinkContext> {
  // Use axios directly without auth interceptor for public endpoint
  const response = await axios.get<InvitationLinkContext>(
    `${ENV.API_URL}/join/${code}`,
    { params: utmParams }
  );
  return response.data;
}

// ============================================================================
// CLAIM ENDPOINT (Authenticated)
// ============================================================================

/**
 * Claim an invitation link and become a supporter.
 */
export async function claimLink(
  code: string,
  request?: ClaimInvitationLinkRequest
): Promise<ClaimInvitationLinkResponse> {
  const response = await apiClient.post<ClaimInvitationLinkResponse>(
    `/join/${code}/claim`,
    request || {}
  );
  return response.data;
}
