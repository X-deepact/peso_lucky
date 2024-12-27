import { request } from 'umi';
import type { ListItem } from './data';

export async function query(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/game/rule',
    {
      params,
    },
  );
}

export async function create(data: any) {
  return request('/api/v1/game/rule', {
    method: 'POST',
    data,
  });
}

export async function edit(data: any) {
  return request(`/api/v1/game/rule/${data.id}`, {
    method: 'PUT',
    data,
  });
}

export async function getOne(id: string) {
  return request(`/api/v1/game/rule/${id}`);
}

export async function deleteOne(id: string) {
  return request(`/api/v1/game/rule/${id}`, { method: 'DELETE' });
}

export async function getGameType({ game_category }: { game_category: number }) {
  return request<API.TreeOptionList>('/api/v1/game/types', {
    method: 'GET',
    params: { game_category },
  });
}
