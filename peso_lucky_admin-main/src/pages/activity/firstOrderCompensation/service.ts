// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { DataItem, GameListItem, MerchantListItem } from './data';

/** 获取Job列表 GET /api/v1/sys-job */
export async function getDetail() {
  return request<{ data: DataItem; current: number; pageSize: number; total: number }>(
    '/api/v1/act/compensation/detail',
    {
      method: 'GET',
    },
  );
}

/** 修改配置详情 POST  */
export async function updateSysJob(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/act/compensation/detail/add', {
    method: 'POST',
    data: options || {},
  });
}

/** 获取所有线路列表 POST /api/v1/sys-job */
export async function getMerchantsList(options?: {}) {
  return request<{ data: MerchantListItem[] }>('/api/v1/merchant/mer/all/merchants', {
    method: 'GET',
    data: options || {},
  });
}

/** 获取所有游戏列表 POST /api/v1/sys-job */
export async function getGameList(options?: {}) {
  return request<{ data: GameListItem[] }>('/api/v1/game/info/all/code', {
    method: 'GET',
    data: options || {},
  });
}

/** 开关设置 POST /api/v1/act/compensation/detail/switch */
export async function setDetailSwitch(params: { id: number; act_switch: number }) {
  const formData = new FormData();
  formData.append('id', String(params.id));
  formData.append('act_switch', String(params.act_switch));
  return request<Record<string, any>>('/api/v1/act/compensation/detail/switch', {
    method: 'POST',
    requestType: 'form',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  });
}

// 上传头像
export async function uploadImage(params: { file: any }) {
  const formData = new FormData();
  formData.append('file', params.file);
  return request<Record<string, any>>('/api/v1/upload/file', {
    method: 'POST',
    requestType: 'form',
    headers: { 'Content-Type': 'multipart/form-data' },

    body: formData,
  });
}
