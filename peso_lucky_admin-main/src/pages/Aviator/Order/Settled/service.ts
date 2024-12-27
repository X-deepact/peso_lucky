import { request } from 'umi';
import type { ListItem } from './data';

export async function querysettle(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/av/order/settle',
    {
      params,
    },
  );
}

export async function queryUnsettle(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/av/order/unsettle',
    { params },
  );
}

export async function queryUnsettleSub(data: any) {
  return request(`/api/v1/DEMO/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/record/av/order/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/record/av/order/${id}`, { method: 'DELETE' });
}

export async function cancelOrder(data: { id: string; remark: string }) {
  return request(`/api/v1/record/cancel/order`, { method: 'POST', data });
}

export async function getDetail(id: string | number) {
  return request(`/api/v1/record/av/order/settle/detail/?order_number=${id}`, { method: 'GET' });
}
