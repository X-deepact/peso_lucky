import { request } from 'umi';
import type { ListItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/user/member',
    {
      params,
    },
  );
}

export async function changeStatus(data: { id: string; status: number }) {
  return request(`/api/v1/user/member/status/${data.id}`, {
    method: 'PUT',
    data,
  });
}
