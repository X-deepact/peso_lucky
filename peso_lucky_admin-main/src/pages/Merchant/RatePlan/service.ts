import { request } from 'umi';
import type { ListItem } from './data';

export async function ratePlanQuery(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/merchant/rate/plan',
    {
      params,
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/merchant/rate/plan', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/merchant/rate/plan/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function editStatus(data: any) {
  return request(`/api/v1/merchant/rate/plan/status/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/merchant/rate/plan/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/merchant/rate/plan/${id}`, { method: 'DELETE' });
}
