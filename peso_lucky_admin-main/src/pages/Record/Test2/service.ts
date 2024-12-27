import { request } from 'umi';
import type { ListItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/round',
    {
      params,
    },
  );
}

export async function edit(data: any) {
  return request(`/api/v1/merchant/rate/plan/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/record/round/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/record/round/${id}`, { method: 'DELETE' });
}
export interface Cancel {
  seq: string;
  remark: string;
}
export async function gamenoCancel(data: Cancel) {
  return request(`/api/v1/record/cancel/order/batch`, { method: 'POST', data });
}

export async function gameroundCancel(data: Cancel) {
  return request(`/api/v1/record/round/cancel`, { method: 'POST', data });
}

export async function getTotal(params: { seq: string }) {
  return request(`/api/v1/record/round/total`, { params });
}
