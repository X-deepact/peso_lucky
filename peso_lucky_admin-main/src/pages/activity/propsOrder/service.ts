import { request } from 'umi';
import type { ListItem } from './data';

//道具领取明细接口
export async function getOrderList(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/receive/list',
    {
      params,
    },
  );
}

//道具领取明细统计
export async function getOrderStatistics(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/receive/sum',
    {
      params,
    },
  );
}

//道具使用记录
export async function getUsageList(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/usage/list',
    {
      params,
    },
  );
}

//道具使用记录统计
export async function getUsageSum(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/usage/sum',
    {
      params,
    },
  );
}


//线路数据
export async function getOrderReport(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/report',
    {
      params,
    },
  );
}

//线路数据详情
export async function getOrderReportDetail(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/props/order/report/detail',
    {
      params,
    },
  );
}

