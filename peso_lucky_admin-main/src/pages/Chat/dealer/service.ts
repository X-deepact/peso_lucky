// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取禁言列表 */
export async function getMuteChatList(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/mute/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 解除禁言
export async function cancelMuteChat(params: { user_id: number }) {
  return request<Record<string, any>>('/api/v1/chat/mute/cancel', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取主播列表
export async function getAnchorList(params = {}) {
  return request<Record<string, any>>('/api/v1/anchor/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除主播
export async function deleteAnchor(params: { id: number }) {
  return request<Record<string, any>>('/api/v1/anchor/delete', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加主播
export async function addAnchor(params: {}) {
  return request<Record<string, any>>('/api/v1/anchor/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑主播
export async function editAnchor(params: {}) {
  return request<Record<string, any>>('/api/v1/anchor/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 上传头像
export async function uploadAvatar(params: { file: any }) {
  const formData = new FormData();
  formData.append('file', params.file);
  return request<Record<string, any>>('/api/v1/upload/file', {
    method: 'POST',
    requestType: 'form',
    headers: { 'Content-Type': 'multipart/form-data' },

    body: formData,
  });
}
