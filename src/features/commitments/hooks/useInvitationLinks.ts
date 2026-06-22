import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as invitationLinksApi from '@api/endpoints/invitation-links.api';
import type { GenerateInvitationLinkRequest, InvitationLink } from '@api/types';

/**
 * Query key for a commitment's shareable invitation links.
 */
export const INVITATION_LINKS_QUERY_KEY = ['invitation-links'] as const;

/**
 * List the shareable invitation links for a commitment (owner only).
 */
export function useInvitationLinks(commitmentId: string | undefined) {
  return useQuery({
    queryKey: [...INVITATION_LINKS_QUERY_KEY, commitmentId],
    queryFn: () => invitationLinksApi.listLinks(commitmentId!),
    enabled: !!commitmentId,
    staleTime: 60 * 1000,
  });
}

/**
 * Generate a new shareable invitation link for a commitment.
 */
export function useGenerateInvitationLink(commitmentId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: GenerateInvitationLinkRequest) => {
      if (!commitmentId) {
        throw new Error('Commitment ID is required');
      }
      return invitationLinksApi.generateLink(commitmentId, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...INVITATION_LINKS_QUERY_KEY, commitmentId],
      });
    },
  });

  return {
    generateLink: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Deactivate an existing invitation link.
 */
export function useDeactivateInvitationLink(commitmentId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (linkId: string) => {
      if (!commitmentId) {
        throw new Error('Commitment ID is required');
      }
      return invitationLinksApi.deactivateLink(commitmentId, linkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...INVITATION_LINKS_QUERY_KEY, commitmentId],
      });
    },
  });

  return {
    deactivateLink: mutation.mutateAsync,
    isDeactivating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Resolve the shareable URL for a link.
 *
 * On web (the alpha target) we build it from the current origin so it always
 * points at the deployed web app, regardless of the backend's APP_BASE_URL.
 * On native we fall back to the URL the backend returned.
 */
export function getShareableUrl(link: Pick<InvitationLink, 'code' | 'url'>): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/join/${link.code}`;
  }
  return link.url;
}
