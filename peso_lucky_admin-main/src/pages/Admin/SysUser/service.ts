import { request } from 'umi';
/** 新建 POST /api/v1/sys-request-log */

export async function getliveHall(params?: any) {
  return request<Record<string, any>>('/api/v1/live/hall', {
    method: 'GET',
    params,
  });
}

export async function setliveHallRoom(data?: any) {
  return request<Record<string, any>>('/api/v1/live/hall/room', {
    method: 'POST',
    data,
  });
}
