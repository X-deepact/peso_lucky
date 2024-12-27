import { request } from 'umi';
import type { WinningListItem } from './data';

export async function monitorQuery(params: WinningListItem) {
  return request<{ data: WinningListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/risk/jackpot/monitor',
    {
      params,
    },
  );
}

/**奖池明细 */
export async function transQuery(params: {
  current: number;
  pageSize: number;
  seq?: string;
  jackpot_name?: string;
  trans_type?: number;
  game_id: number;
}) {
  return request<{ data: WinningListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/risk/jackpot/trans',
    {
      params,
    },
  );
}

/**抽成明细 */
export async function commissionQuery(params: {
  current: number;
  pageSize: number;
  seq?: string;
  game_id: number;
}) {
  return request<{ data: WinningListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/risk/jackpot/commission',
    {
      params,
    },
  );
}
