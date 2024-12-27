import React, { useRef, useEffect, useState } from 'react';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { getOrderList, getOrderStatistics } from '../service';
import { getToDayRange, useNewGetDateTime } from '@/utils/dateRange';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { keys } from 'lodash';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { useRequest } from 'umi';
import { Tag } from 'antd';
import { useBetaSchemaForm } from '@/hooks';
import { currencySelectOption } from '@/utils/options';

const StatsList = [
  {
    label: FormattedMessage({ id: 'activity.total', defaultMessage: '总用户数' }),
    key: 'receive_users',
    tagColor: '#87d068',
  },
  {
    label: FormattedMessage({ id: 'activity.receive.price', defaultMessage: '总领取道具价值' }),
    key: 'receive_price',
    tagColor: '#87d068',
    type: 'price',
  },
  {
    label: FormattedMessage({ id: 'activity.theoretical', defaultMessage: '理论成本' }),
    key: 'theoretical_max_price',
    tagColor: '#87d068',
  },
];

export default (props: { isUnsettlement?: boolean }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const [statsList, setStatsList] = useState([]);
  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'common.dateTimeRange' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            start_at: dayjs(value[0]).valueOf().toString(),
            end_at: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
    },
    {
      title: FormattedMessage({ id: 'activity.getTime', defaultMessage: '获取时间' }),
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'player.id', defaultMessage: '用户ID' }),
      dataIndex: 'user_id',
    },
    // 币种
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      // hideInSearch: true,
      request: async () => {
        return currencySelectOption;
      },
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        defaultValue: 'PHP',
      },
    },
    {
      title: FormattedMessage({ id: 'activity.gameId', defaultMessage: '三方游戏ID' }),
      dataIndex: 'merchant_user_id',
    },
    {
      title: FormattedMessage({ id: 'activity.gameName', defaultMessage: '生效游戏' }),
      dataIndex: 'game_name',
    },
    {
      title: FormattedMessage({ id: 'activity.porp.name', defaultMessage: '道具名称' }),
      dataIndex: 'prop_name',
    },

    {
      title: FormattedMessage({ id: 'activity.line', defaultMessage: '归属线路' }),
      dataIndex: 'merchant_name',
    },
    {
      title: FormattedMessage({ id: 'activity.porp.type', defaultMessage: '道具类型' }),
      dataIndex: 'prop_type',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'activity.porp.free', defaultMessage: '免费投注' }),
            value: '1',
          },
        ];
      },
    },
    {
      title: FormattedMessage({ id: 'activity.porp.code', defaultMessage: '道具编码' }),
      dataIndex: 'prop_code',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'player.game_name', defaultMessage: '游戏名称' }),
      dataIndex: 'game_name',
    },
    {
      title: FormattedMessage({ id: 'activity.receive.quantity', defaultMessage: '领取数量' }),
      dataIndex: 'receive_quantity',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.prop.price', defaultMessage: '道具价值' }),
      dataIndex: 'prop_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
  ];

  // 初始化参数
  useEffect(() => {
    //默认查询币种为PHP, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      currency: 'PHP',
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <div>
      <ProTable
        // 默认展开搜索
        scroll={{ x: 'max-content' }}
        columns={columns}
        actionRef={actionRef}
        formRef={searchFormRef}
        request={async (params = {}) => {
          console.log(params);

          const res = await getOrderList(objValTrim(omitEmpty(params)));
          const dataStatistics = await getOrderStatistics(objValTrim(omitEmpty(params)));
          setStatsList(dataStatistics.data);
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
                <li>
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
                            {stat.key == 'theoretical_max_price'
                              ? `${(statsList.theoretical_min_price / 100).toLocaleString()}-${(
                                  statsList.theoretical_max_price / 100
                                ).toLocaleString()}`
                              : stat.type == 'price'
                              ? (statsList[stat.key] / 100).toLocaleString()
                              : statsList[stat.key]}
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
