import React, { useRef, useEffect } from 'react';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { getGiftRecordList, getGiftStatistics } from './service';
import { getToDayRange, useNewGetDateTime } from '@/utils/dateRange';

import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { DownOutlined } from '@ant-design/icons';
import { keys } from 'lodash';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';

import './list.less';
import { useRequest } from 'umi';
import { Tag } from 'antd';

const StatsList = [
  {
    label: FormattedMessage({ id: 'gift.total' }),
    key: 'count',
    tagColor: '#f50',
  },
  {
    label: FormattedMessage({ id: 'gift.all.amount' }),
    key: 'total_amount',
    tagColor: '#87d068',
  },
];

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const { run, data = [] } = useRequest(getGiftStatistics);

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'gift.time', defaultMessage: '时间' }),
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'gift.time', defaultMessage: '时间' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            start_time: dayjs(value[0]).valueOf().toString(),
            end_time: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
    },
    {
      title: FormattedMessage({ id: 'chat.merchant_name', defaultMessage: '商户名称' }),
      dataIndex: 'merchant_name',
    },
    {
      title: FormattedMessage({ id: 'player.anchor_name', defaultMessage: '主播' }),
      dataIndex: 'anchor_name',
    },
    {
      title: FormattedMessage({ id: 'player.game_name', defaultMessage: '游戏名称' }),
      dataIndex: 'game_name',
    },
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: '币种' }),
      dataIndex: 'currency',
    },
    {
      title: FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' }),
      dataIndex: 'seq',
    },
    {
      title: FormattedMessage({ id: 'player.id', defaultMessage: '用户ID' }),
      dataIndex: 'user_id',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'win.userName', defaultMessage: '用户名称' }),
      dataIndex: 'nickname',
    },
    {
      title: FormattedMessage({ id: 'gift.name', defaultMessage: '礼物' }),
      dataIndex: 'gift_name',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'gift.quantity', defaultMessage: '个数' }),
      dataIndex: 'quantity',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'gift.unit_price', defaultMessage: '单价' }),
      dataIndex: 'unit_price',
      // 除以100
      render: (text: any) => {
        return text / 100;
      },
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'gift.unit_total', defaultMessage: '总价' }),
      dataIndex: 'unit_total',
      // 除以100
      render: (text: any) => {
        return text / 100;
      },
    },
  ];

  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      dateTimeRange: getToDayRange(),
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <PageContainer>
      <ProTable
        // 默认展开搜索
        scroll={{ x: 'max-content' }}
        columns={columns}
        actionRef={actionRef}
        formRef={searchFormRef}
        request={async (params = {}) => {
          await run(params);
          const res = await getGiftRecordList(params);
          return {
            total: res.total || 0,
            data: res.data || [],
          };
        }}
        editable={{
          type: 'multiple',
        }}
        toolbar={{
          actions: [
            <header
              key={Math.random()}
              className="gift-header"
              style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'baseline' }}
            >
              <ul
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: 0,
                }}
              >
                {data.map((item: any) => {
                  return (
                    <li key={item.currency}>
                      <span>
                        {StatsList.map((stat) => {
                          return (
                            <span
                              key={stat.key}
                              style={{
                                marginRight: '20px',
                                lineHeight: '28px',
                                fontSize: '16px',
                              }}
                            >
                              <span>{stat.label}：</span>
                              <Tag
                                color={stat.tagColor}
                                style={{
                                  fontSize: '20px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {/* 金额千分位 */}
                                {stat.key === 'total_amount'
                                  ? (item[stat.key] / 100).toLocaleString()
                                  : item[stat.key]}
                                {'   '}
                                {stat.key === 'total_amount' && item.currency}
                              </Tag>
                            </span>
                          );
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <ActionBtn
                access="/record/gift/excel"
                key="out"
                type="primary"
                onClick={() => {
                  // 下载导出数据

                  //  获取当前页码
                  const current = actionRef.current?.pageInfo?.current || 1;
                  const pageSize = actionRef.current?.pageInfo?.pageSize || 20;

                  const Platform = localStorage.getItem('Platform') || '';
                  const token = localStorage.getItem('token');

                  const { dateTimeRange } = searchFormRef.current?.getFieldsValue();

                  const values = {
                    ...objValTrim(omitEmpty(searchFormRef.current?.getFieldsValue())),
                    open_time_start: dateTimeRange?.[0]?.valueOf(),
                    open_time_end: dateTimeRange?.[1]?.valueOf(),
                    pageIndex: current,
                    pageSize,
                    dateTimeRange: undefined,
                  };

                  const url: string = '/api/v1/record/gift/excel';
                  const queryParams = objValTrim(omitEmpty(values)) || {};

                  const queryStr = keys(queryParams)
                    .map((key) => `${key}=${queryParams[key]}`)
                    .join('&');

                  fetch(`${url}?${queryStr}`, {
                    method: 'GET',
                    headers: {
                      Authorization: `Bearer ${token}` || '',
                      Platform,
                    },
                  }).then((response) => {
                    response.blob().then((blob) => {
                      const a = document.createElement('a');
                      const DownloadURl = window.URL.createObjectURL(blob);
                      const contentDisposition = response.headers.get('Content-Disposition');
                      let filename = `${FormattedMessage({
                        id: 'menu.record.recordgift',
                        defaultMessage: 'record_gift_list',
                      })}.xls`;
                      if (contentDisposition) {
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(contentDisposition);
                        if (matches != null && matches[1]) {
                          filename = matches[1].replace(/['"]/g, '');
                        }
                      }
                      a.href = DownloadURl;
                      a.download = filename;
                      a.click();
                      window.URL.revokeObjectURL(DownloadURl);
                    });
                  });
                }}
              >
                <FormattedMessage id="pages.export" defaultMessage="导出" />
                <DownOutlined />
              </ActionBtn>
            </header>,
          ],
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{ showSizeChanger: true }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};

export default FlowEditer;
