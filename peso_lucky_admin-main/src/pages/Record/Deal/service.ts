import { request } from 'umi';
import type { ListItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/deal',
    {
      params,
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/record/deal', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/record/deal/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/record/deal/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/record/deal/${id}`, { method: 'DELETE' });
}
