import { request } from 'umi';
import type { ListItem } from './data';

export async function querysettle(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/order/settle',
    {
      params,
    },
  );
}

export async function queryUnsettle(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/order/unsettle',
    {
      params,
    },
  );
}

export async function queryUnsettleSub(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/order/sub',
    {
      params,
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/record/order', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/record/order/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/record/order/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/record/order/${id}`, { method: 'DELETE' });
}

export async function cancelOrder(data: { id: string; remark: string }) {
  return request(`/api/v1/record/cancel/order`, { method: 'POST', data });
}

export async function getDetail(id: string | number) {
  return request(`/api/v1/record/order/settle/detail/?order_number=${id}`, { method: 'GET' });
}

export async function settleSum(params: ListItem) {
  return request(`/api/v1/record/order/settle/sum`, { method: 'GET', params });
}
