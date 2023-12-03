import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';

export interface GetModelsRequestProps {
  key: string;
}
export interface GetConversationsRequestProps {
  userId: string;
}
export interface GetConversationsResponseProps {
  conversations: [];
}

const useApiService = () => {
  const fetchService = useFetch();

  // const getModels = useCallback(
  // 	(
  // 		params: GetManagementRoutineInstanceDetailedParams,
  // 		signal?: AbortSignal
  // 	) => {
  // 		return fetchService.get<GetManagementRoutineInstanceDetailed>(
  // 			`/v1/ManagementRoutines/${params.managementRoutineId}/instances/${params.instanceId
  // 			}?sensorGroupIds=${params.sensorGroupId ?? ''}`,
  // 			{
  // 				signal,
  // 			}
  // 		);
  // 	},
  // 	[fetchService]
  // );

  // const getModels = useCallback(
  //   (params: GetModelsRequestProps, signal?: AbortSignal) => {
  //     return fetchService.post<GetModelsRequestProps>(`/api/models`, {
  //       body: { key: params.key },
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       signal,
  //     });
  //   },
  //   [fetchService],
  // );

  const getConversations = useCallback(
    (params: GetConversationsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<GetConversationsResponseProps>(`/api/getConversations`, {
        body: { userId: params.userId },
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    getConversations,
  };
};

export default useApiService;
