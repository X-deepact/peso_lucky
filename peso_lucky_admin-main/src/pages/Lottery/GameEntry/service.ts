import { request } from 'umi';

export async function getLiveSpecify(params?: any) {
  return request<Record<string, any>>('/api/v1/live/hall', {
    // return request<Record<string, any>>('/api/v1/live/specify', {
    method: 'GET',
    params,
  });
}
