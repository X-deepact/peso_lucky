// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

// 获取礼物列表
export async function getGiftList(params = {}) {
  return request<Record<string, any>>('/api/v1/gift/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加礼物
export async function addGift(params: {}) {
  return request<Record<string, any>>('/api/v1/gift/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除礼物
export async function deleteGift(params: { id: number }) {
  return request<Record<string, any>>('/api/v1/gift/delete', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 修改礼物
export async function editGift(params: { id: number }) {
  return request<Record<string, any>>('/api/v1/gift/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 开关礼物
export async function switchGift(params: { id: number; status: number }) {
  return request<Record<string, any>>('/api/v1/gift/switch', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
