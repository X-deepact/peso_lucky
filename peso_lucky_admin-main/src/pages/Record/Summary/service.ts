import { request } from 'umi';
import type { ListItem } from './data';

export async function query(data: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/cancel/order/summary',
    {
      method: 'POST',
      data,
    },
  );
}
