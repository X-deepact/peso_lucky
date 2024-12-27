import { request } from 'umi';
import type { ListItem } from './data';
import { omit } from 'lodash';

const emum = {
  status: [
    { label: '正常', value: '0' },
    { label: '禁用', value: '1' },
  ],
  type: [
    { label: '普通', value: '0' },
    { label: '代理', value: '1' },
  ],
  contact_no: [
    { label: '普通', value: '0' },
    { label: 'VIP', value: '1' },
  ],
};
export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/merchant/mer',
    {
      params,
    },
  );
}

// /api/v1/merchant/mer/game/add/info
export async function queryGameAddInfo(params: any) {
  return request<{ data: { list: any[] }; current: number; pageSize: number; total: number }>(
    '/api/v1/merchant/mer/game/add/info',
    { params },
  );
}

export async function queryGameUdpInfo(params: any) {
  return request<{ data: { list: any[] }; current: number; pageSize: number; total: number }>(
    '/api/v1/merchant/mer/game/udp/info',
    { params },
  );
}

export async function create(data: any) {
  return request('/api/v1/merchant/mer', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/merchant/mer/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function changeStatus(data: { id: string; enable_status: number }) {
  return request(`/api/v1/merchant/mer/status/${data.id}`, { method: 'PUT', data });
}

export async function deleteOne(id: string) {
  return request(`/api/v1/merchant/mer/${id}`, { method: 'DELETE' });
}
