import { request } from 'umi';
import type { ListItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/trans',
    {
      params,
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/record/trans', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/record/trans/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/record/trans/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/record/trans/${id}`, { method: 'DELETE' });
}

export async function transSum(params: ListItem) {
  return request(`/api/v1/record/trans/sum`, { method: 'GET', params });
}
