import { request } from 'umi';
import type { ListItem } from './data';

export async function query(data: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/reports/list',
    {
      data,
      method: 'POST',
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/reports/list', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/reports/list/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/reports/list/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/reports/list/${id}`, { method: 'DELETE' });
}
