// @ts-ignore
/* eslint-disable */
import { request } from 'umi';


export async function getReportList(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/act/compensation/report',
    {
      params,
    },
  );
}

export async function getReportDetail(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/act/compensation/report/detail',
    {
      params,
    },
  );
}


export async function getOrderList(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/act/compensation/order',
    {
      params,
    },
  );
}


export async function getOrderStatistics(params: ListItem) {
  return request<{ data: ListItem[]; current: number; pageSize: number; total: number }>(
    '/api/v1/act/compensation/order/sum',
    {
      params,
    },
  );
}
