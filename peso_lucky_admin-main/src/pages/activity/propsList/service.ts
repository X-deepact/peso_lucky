// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取所有线路列表 POST /api/v1/sys-job */
export async function getMerchantsList(options?: {}) {
  return request('/api/v1/merchant/mer/all/merchants', {
    method: 'GET',
    data: (options || {}),
  });
}

/** 获取所有游戏列表 POST /api/v1/sys-job */
export async function getGameList(options?: {}) {
  return request('/api/v1/game/info/all/code', {
    method: 'GET',
    data: (options || {}),
  });
}


export async function getAnchorList(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/list',
    {
      params,
    },
  );
}


// 添加
export async function addAnchor(params: {}) {
  return request<Record<string, any>>('/api/v1/props/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑
export async function editAnchor(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/props/update/' + String(options?.id), {
    method: 'PUT',
    data: options || {},
  });
}

// 删除

export async function deleteAnchor(id: string) {
  return request(`/api/v1/props/delete/${id}?id=${id}`, { method: 'DELETE' });
}

// export async function deleteAnchor(options?: { [key: string]: any }) {
//   return request<Record<string, any>>('/api/v1/props/update/' + String(options?.id), {
//     method: 'DELETE',
//     data:{
//       ...options
//     }
//     // data: options || {},
//   });
// }
