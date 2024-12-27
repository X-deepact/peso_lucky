import { request } from 'umi';
import type { WinningQueryItem, DetailQueryItem } from './data';

export async function winningQuery(params: WinningQueryItem) {
  return request<{ data: WinningQueryItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/record/jackpot/winning',
    {
      params,
    },
  );
}

export async function detailQuery(params: DetailQueryItem) {
  return request<{ total: number; data: DetailQueryItem[] }>(
    '/api/v1/record/jackpot/winning/detail',
    {
      params,
    },
  );
}
