import { type Source } from '../interface/source.interface';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetSourcesRequest {}

export interface GetSourcesResponse {
  sources: Source[];
}

export const getSources = async (
  input: GetSourcesRequest
): Promise<GetSourcesResponse> => {
  return {
    sources: [
      {
        id: '1',
        content: 'Source 1',
      },
      {
        id: '2',
        content: 'Source 2',
      },
      {
        id: '3',
        content: 'Source 3',
      },
    ],
  };
};
