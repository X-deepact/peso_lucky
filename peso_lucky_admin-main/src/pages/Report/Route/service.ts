import { request } from 'umi';
import type { ListItem, DetailItem } from './data';

export async function query(data: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/reports/merchant',
    {
      data,
      method: 'POST',
    },
  );
}

export async function getReportsDetail(data: DetailItem) {
  return request(`/api/v1/reports/details`, { data, method: 'POST' });
}
