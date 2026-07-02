import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getApiClient } from '../client';
import {
  Wallet,
  SetupWalletInput,
  UpdateManagerInput,
  UpdateTargetInput,
  ContributeInput,
} from './wallet.types';

// ─────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────

export const useWallet = (groupId: string) => {
  return useQuery({
    queryKey: ['wallet', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      try {
        const { data } = await getApiClient().get<Wallet>(`/groups/${groupId}/wallet`);
        return data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!groupId,
  });
};

export const useSetupWallet = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SetupWalletInput) => {
      const { data } = await getApiClient().post<Wallet>(`/groups/${groupId}/wallet`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', groupId] });
    },
  });
};

export const useUpdateWalletManager = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateManagerInput) => {
      const { data } = await getApiClient().patch<Wallet>(
        `/groups/${groupId}/wallet/manager`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', groupId] });
    },
  });
};

export const useUpdateWalletTarget = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTargetInput) => {
      const { data } = await getApiClient().patch<Wallet>(
        `/groups/${groupId}/wallet/target`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', groupId] });
    },
  });
};

export const useContribute = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContributeInput) => {
      const { data } = await getApiClient().post<Wallet>(
        `/groups/${groupId}/wallet/contribute`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
