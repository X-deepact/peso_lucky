import React, { useRef } from 'react';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { getOrderList, getOrderStatistics } from '../service';
import { getToDayRange, useNewGetDateTime } from '@/utils/dateRange';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { keys } from 'lodash';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
// import './list.less';
import { useRequest } from 'umi';
import { Tag } from 'antd';

const StatsList = [
  {
    label: FormattedMessage({ id: 'activity.total' }),
      // "总用户数"
    key: 'join_num',
    tagColor: '#f50',
  },
  {
    label:FormattedMessage({ id: 'activity.amount' }),
      // "总领取金额",
    key: 'prize_amount',
    tagColor: '#87d068',
  },
];

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const { run, data = {} } = useRequest(getOrderStatistics);

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'activity.betTime', defaultMessage: '下注时间查询' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            first_bet_start_time: dayjs(value[0]).valueOf().toString(),
            first_bet_end_time: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
    },
    {
      title: FormattedMessage({ id: 'player.id', defaultMessage: '用户ID' }),
      dataIndex: 'user_id',
    },
    {
      title: FormattedMessage({ id: 'activity.gameId', defaultMessage: '三方游戏ID' }),
      dataIndex: 'merchant_user_id',
    },
    {
      title: FormattedMessage({ id: 'activity.receiveTime', defaultMessage: '领取时间查询' }),
      dataIndex: 'receiveTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            receive_start_time: dayjs(value[0]).valueOf().toString(),
            receive_end_time: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
    },
    {
      title: FormattedMessage({ id: 'player.game_name', defaultMessage: '游戏名称' }),
      dataIndex: 'game_name',
    },
    {
      title: FormattedMessage({ id: 'activity.seq', defaultMessage: '游戏期号' }),
      dataIndex: 'issue_number',
      hideInTable: true,
    },
    {
      title: FormattedMessage({ id: 'activity.line', defaultMessage: '归属线路' }),
      dataIndex: 'merchant_name',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({ id: 'activity.betAmount', defaultMessage: '首单下注金额' }),
      dataIndex: 'first_bet_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.betTime', defaultMessage: '首单下注时间' }),
      valueType: 'dateTime',
      dataIndex: 'first_bet_time',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.prizeAmount', defaultMessage: '领取金额' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.receiveTime', defaultMessage: '领取时间' }),
      valueType: 'dateTime',
      dataIndex: 'receive_time',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.receiveStatus', defaultMessage: '领取状态' }),
      dataIndex: 'status',
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        return [
          { label: FormattedMessage({ id: 'activity.receiveStatus1', defaultMessage: '无资格' }), value: '1' },
          { label: FormattedMessage({ id: 'activity.receiveStatus2', defaultMessage: '未满足条件' }), value: '2' },
          { label: FormattedMessage({ id: 'activity.receiveStatus3', defaultMessage: '已达标未领取' }), value: '3' },
          { label: FormattedMessage({ id: 'activity.receiveStatus4', defaultMessage: '已领取' }), value: '4' },
        ];
      },
    }

  ];


  return (
    <div>
      <ProTable
        // 默认展开搜索
        scroll={{ x: 'max-content' }}
        columns={columns}
        actionRef={actionRef}
        formRef={searchFormRef}
        request={async (params = {}) => {
          console.log(params)
          await run(params);
          const res = await getOrderList(objValTrim(omitEmpty(params)));
          console.log(res)
          return {
            total: res?.total || 0,
            data: res?.data || [],
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

                <li >
                  <span>
                    {StatsList?.map((stat) => {
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
                            {stat.key === 'prize_amount'
                              ? (data[stat.key] / 100).toLocaleString()
                              : data[stat.key]}
                            {'   '}
                            {stat.key === 'prize_amount'}
                          </Tag>
                        </span>
                      );
                    })}
                  </span>
                </li>

              </ul>
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
    </div>
  );
};

export default FlowEditer;
