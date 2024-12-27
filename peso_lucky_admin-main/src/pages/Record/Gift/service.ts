// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

// 获取赠送礼物列表
export async function getGiftRecordList(params = {}) {
  return request<Record<string, any>>('/api/v1/record/gift', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

// 礼物消费统计
export async function getGiftStatistics(params = {}) {
  return request<Record<string, any>>('/api/v1/record/gift/stats', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
