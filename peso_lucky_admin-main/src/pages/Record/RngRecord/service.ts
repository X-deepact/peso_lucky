import { request } from 'umi';
import type { GameItem } from './data';

export async function queryRng(params: GameItem) {
  return request<{ game_id: number; seq?: string; start_time?: string; end_time?: string }>(
    '/api/v1/risk/rng/info',
    {
      params,
    },
  );
}
