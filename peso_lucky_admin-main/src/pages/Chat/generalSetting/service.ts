// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取Job列表 GET /api/v1/sys-job */
export async function sysJob(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  let order = {};
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      const element = options[key];
      order[key + 'Order'] = String(element).replace('end', '');
    }
  }
  return request<SysJobList>('/api/v1/sys-job', {
    method: 'GET',
    params: {
      ...(params || {}),
      ...(order || {}),
    },
    ...(options || {}),
  });
}

/** 查询Job Get /api/v1/sys-job */
export async function getSysJob(id?: number) {
  return request<SysJobGet>('/api/v1/sys-job/' + id, {
    method: 'GET',
  });
}

/** 开始Job Get /job/start/ */
export async function startSysJob(id?: number) {
  return request<Record<string, any>>('/api/v1/job/start/' + id, {
    method: 'GET',
  });
}

/** 停止Job Get /job/remove/ */
export async function stopSysJob(id?: number) {
  return request<Record<string, any>>('/api/v1/job/remove/' + id, {
    method: 'GET',
  });
}

/** 修改Job PUT /api/v1/sys-job/{id} */
export async function updateSysJob(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/sys-job', {
    method: 'PUT',
    data: options || {},
  });
}

/** 新建Job POST /api/v1/sys-job */
export async function addSysJob(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/v1/sys-job', {
    method: 'POST',
    data: options || {},
  });
}

/** 删除Job DELETE /api/v1/sys-job */
export async function removeSysJob(id?: number) {
  return request<Record<string, any>>('/api/v1/sys-job/' + id, {
    method: 'DELETE',
  });
}

// 获取敏感词列表
export async function getSensitiveWordList(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/sensitive/list', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 删除敏感词
export async function deleteSensitiveWord(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/sensitive/delete', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 添加敏感词
export async function addSensitiveWord(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/sensitive/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 聊天室通知开关设置
export async function chatRoomNotice(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/notice/switch', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 获取通知内容
export async function getNoticeContent(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/notice/content', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 编辑通知内容
export async function editNoticeContent(params = {}) {
  return request<Record<string, any>>('/api/v1/chat/notice/edit', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
