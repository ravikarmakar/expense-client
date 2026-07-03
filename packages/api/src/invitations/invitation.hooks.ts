import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvitationsApi, acceptInvitationApi, declineInvitationApi } from './invitation.api';

export const invitationKeys = {
  all: () => ['invitations'] as const,
};

export const useInvitations = () =>
  useQuery({
    queryKey: invitationKeys.all(),
    queryFn: getInvitationsApi,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptInvitationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: declineInvitationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationKeys.all() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
