import { request } from 'umi';
import type { ListItem, ChipItem, GameRuleItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/game/info',
    {
      params,
    },
  );
}

export async function add(data: ListItem) {
  return request('/api/v1/game/info', {
    method: 'POST',
    data,
  });
}
export async function getChipByGameId(params: { game_id: number }) {
  return request<{ data: ChipItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/game/chip',
    {
      params,
    },
  );
}

export async function getGameRuleByGameId(params: { game_id: number; game_type: number }) {
  return request<{ data: GameRuleItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/game/gameplay',
    {
      params,
    },
  );
}

export async function editGameRuleByGameId(data: { game_id: number; game_type: number }) {
  return request<{ data: GameRuleItem[]; current: number; pageSize: number; total: number }>(
    `/api/v1/game/gameplay/${data.game_id}`,
    {
      data,
      method: 'PUT',
    },
  );
}

export async function edit(data: any) {
  return request(`/api/v1/game/info/${data.id}`, {
    method: 'PUT',
    data,
  });
}
export async function create(data: any) {
  return request(`/api/v1/game/info`, {
    method: 'POST',
    data,
  });
}

export async function editChip(data: any) {
  return request(`/api/v1/game/chip/${data.id}`, {
    method: 'PUT',
    data,
  });
}
export async function getJackpot(params: any) {
  return request(`/api/v1/game/jackpot`, {
    method: 'GET',
    params,
  });
}

export async function updateJackpot(id: number | string, data: any[]) {
  return request(`/api/v1/game/jackpot/${id}`, {
    method: 'PUT',
    data,
  });
}
