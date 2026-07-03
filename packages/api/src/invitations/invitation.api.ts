import { getApiClient } from '../client';
import { invitationListResponseSchema, type Invitation } from './invitation.types';

export const getInvitationsApi = async (): Promise<Invitation[]> => {
  const { data } = await getApiClient().get<unknown>('/invitations');
  const parsed = invitationListResponseSchema.parse(data);
  return parsed.data.invitations;
};

export const acceptInvitationApi = async (invitationId: string): Promise<void> => {
  await getApiClient().post(`/invitations/${invitationId}/accept`);
};

export const declineInvitationApi = async (invitationId: string): Promise<void> => {
  await getApiClient().post(`/invitations/${invitationId}/decline`);
};
