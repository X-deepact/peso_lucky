import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from '../data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Modal, Space, message, Image } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { queryUnsettle } from '../service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { colorGameColors, dropGameBgs } from '@/utils/color';
import ActionAnchor from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, getToDayRange } from '@/utils/dateRange';
import UnsettleTabItemDetail from './UnsettleTabItemDetail';

import { history, useLocation } from 'umi';

import { dropGames as dropArr } from '@/utils/color';
import { currencySelectOption } from '@/utils/options';
const isdebug = window.location.hash.includes('debug');
export default (props: { isUnsettlement?: boolean }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const form = useBetaSchemaForm();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<ListItem>();

  const drop_ball_render = (v: string, isSecond?: boolean) => {
    // const dropArr = ['黑桃A', '红桃K', '红桃Q', '方片J', '黑桃10', '梅花9'];
    // const dropArr = ['pineapple', 'banana', 'strawberry', 'orange', 'watermelon', 'grapes'];
    return v
      ?.toString()
      .split(',')
      .map((v1: string, i) => {
        if (!v1) return null;
        const [color, money] = v1.split(': ');
        const index = dropArr.indexOf(color?.trim());
        console.log(index, 'vv');
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <Image width={31} src={dropGameBgs[index ?? 0]} />
            {!isSecond ? (money as any as number) / 100 : null}
          </div>
        );
      });
  };

  const columns: ProColumns<ListItem>[] = [
    // {
    //   title: <FormattedMessage id="record.order.dateTimeRange" />,
    //   dataIndex: 'dateTimeRange',
    //   valueType: 'dateTimeRange',
    //   fieldProps: {
    //     ranges: useNewGetDateTime(),
    //   },
    //   search: {
    //     transform: (value: any) => {
    //       const bet_time_start = moment(value[0]).valueOf();
    //       const bet_time_end = moment(value[1]).milliseconds(999).valueOf() // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
    //       return {
    //         bet_time_start,
    //         bet_time_end,
    //       };
    //     },
    //   },
    //   hideInTable: true,
    //   hideInForm: true,
    // },
    {
      title: <FormattedMessage id="common.dateTimeRange" />,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const start_at = moment(value[0]).valueOf();
          const end_at = moment(value[1]).endOf('day').valueOf();
          return {
            start_at,
            end_at,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: <FormattedMessage id="record.order.bettingUser" />,
      dataIndex: 'id',
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage id="record.order.order_number" defaultMessage="order_number" />
                ),
                dataIndex: 'order_number',
                valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="record.order.username" defaultMessage="username" />,
                dataIndex: 'username',
              },
              {
                label: <FormattedMessage id="record.order.user_id" defaultMessage="user_id" />,
                dataIndex: 'user_id',
                // valueType: 'copyable',
              },
              {
                label: (
                  <FormattedMessage id="record.order.merchant_user_id" defaultMessage="user_id" />
                ),
                dataIndex: 'merchant_user_id',
              },
            ]}
          />
        );
      },
      width: '300px',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.bettingInfo', defaultMessage: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: <FormattedMessage id="record.order.seq" defaultMessage="seq" />,
                dataIndex: 'seq',
                // valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="game.info.game_name" />,
                dataIndex: 'game_name',
                // valueType: 'copyable',
              },
              {
                label: (
                  <FormattedMessage id="game.info.code_type" defaultMessage="game_code_type" />
                ),
                dataIndex: 'game_code_type',
                valueType: 'select',
                request: async () => {
                  return [
                    { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
                    { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
                  ];
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.bet_content"
                    defaultMessage="bet_content_summary"
                  />
                ),
                dataIndex: 'bet_content_summary',
                render: (v) => {
                  if (record.game_type === 2) {
                    return drop_ball_render(v as string);
                  }
                  return v
                    ?.toString()
                    .split(',')
                    .map((v1: string, i) => {
                      if (!v1) return null;
                      const [color, money] = v1.split(': ');
                      const index = ['YELLOW', 'WHITE', 'PINK', 'BLUE', 'RED', 'GREEN'].indexOf(
                        color?.trim(),
                      );
                      return (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={i + v1}
                          style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              backgroundColor: colorGameColors[index ?? 0],
                              width: '20px',
                              height: '20px',
                              margin: '0 5px',
                              boxShadow: '0 0 5px #ccc',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                          {(money as any) / 100}
                        </div>
                      );
                    });
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.second_bet_content"
                    defaultMessage="second_bet_content_summary"
                  />
                ),
                dataIndex: 'second_bet_content_summary',
                render: (v) => {
                  if (record.game_type === 2) {
                    return drop_ball_render(v as string, true);
                  }
                  return v
                    ?.toString()
                    .split(',')
                    .map((color: string) => {
                      if (!color) return null;
                      const index = ['YELLOW', 'WHITE', 'PINK', 'BLUE', 'RED', 'GREEN'].indexOf(
                        color?.trim(),
                      );
                      return (
                        <div
                          key={color}
                          style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <div
                            style={{
                              display: 'inline-block',
                              backgroundColor: colorGameColors[index ?? 0],
                              width: '20px',
                              height: '20px',
                              margin: '0 5px',
                              boxShadow: '0 0 5px #ccc',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      );
                    });
                },
              },
              {
                label: (
                  <FormattedMessage id="record.order.created_at" defaultMessage="created_at" />
                ),
                dataIndex: 'created_at',
                valueType: 'dateTime',
              },
            ]}
          />
        );
      },
      width: '400px',
    },

    // {
    //   // title: FormattedMessage({ id: 'record.order.id', defaultMessage: 'id' }),
    //   title: formatMessage({ id: 'record.order.order_number' }),
    //   dataIndex: 'order_number',
    //   hideInTable: true,
    //   formItemProps: {
    //     rules: [{ max: 50 }],
    //   },
    // },
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
    },
    // {
    //   title: FormattedMessage({ id: 'record.order.amount.all', defaultMessage: 'amount' }),
    //   dataIndex: 'amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    {
      title: FormattedMessage({ id: 'record.order.amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
      // 排序
      sorter: true,
    },
    // {
    //   title: (
    //     <FormattedMessage id="record.order.win_lose_amount" defaultMessage="win_lose_amount" />
    //   ),
    //   dataIndex: 'win_lose_amount',
    //   hideInSearch: true,
    //   valueType: 'winLoseAmount' as any,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.amount_valid', defaultMessage: 'amount_valid' }),
    //   dataIndex: 'amount_valid',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.award_amount', defaultMessage: 'award_amount' }),
    //   dataIndex: 'award_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    {
      title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
      dataIndex: 'status1',
      hideInSearch: true, // 只展示
      // request: async () => await optionDictDataSelect({ dictType: 'order_status' }, true),
      // 1 - 未开奖(可以下注)，2 - 开奖中(停止下注)，3 - 游戏取消(撤单)，4 - 一次开奖，5 - 二次开奖
      render: () => formatMessage({ id: 'dict.order_status.1' }),
    } as any,
    // {
    //   title: FormattedMessage({ id: 'record.order.settle_time', defaultMessage: 'settle_time' }),
    //   dataIndex: 'settle_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    {
      title: (
        <FormattedMessage id="record.order.merchant_user_id" defaultMessage="merchant_user_id" />
      ),
      dataIndex: 'merchant_user_id',
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.device_type', defaultMessage: 'device_type' }),
      dataIndex: 'device_type',
      hideInSearch: true,
      valueEnum: {
        1: 'PC-WEB',
        2: 'H5',
        3: 'APP(iOS)',
        4: 'APP(Android)',
        0: 'OTHER',
      },
    },

    // {
    //   title: FormattedMessage({ id: 'record.order.created_at', defaultMessage: 'created_at' }),
    //   dataIndex: 'created_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.updated_at', defaultMessage: 'updated_at' }),
    //   dataIndex: 'updated_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.prize_at', defaultMessage: 'prize_at' }),
    //   dataIndex: 'prize_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.merchant_id', defaultMessage: 'merchant_id' }),
    //   dataIndex: 'merchant_id',
    //   hideInSearch: true,
    // },
    {
      title: formatMessage({ id: 'record.order.merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      // title: FormattedMessage({ id: 'record.order.user_id', defaultMessage: 'user_id' }),
      title: formatMessage({ id: 'record.order.user_id' }),
      dataIndex: 'user_id',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      // title: FormattedMessage({ id: 'record.order.username', defaultMessage: 'username' }),

      title: formatMessage({ id: 'record.order.username' }),
      dataIndex: 'username',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // {
    //   title: FormattedMessage({ id: 'record.order.order_number', defaultMessage: 'order_number' }),
    //   dataIndex: 'order_number',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'record.order.seq', defaultMessage: 'seq' }),
      dataIndex: 'seq',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.order.free_status', defaultMessage: 'free_status' }),
      dataIndex: 'free_status',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
      request: async () => {
        return [
          {
            label: formatMessage({ id: 'dict.free_status.all' }),
            value: '',
          },
          {
            label: formatMessage({ id: 'dict.free_status.1' }),
            value: '1',
          },
          {
            label: formatMessage({ id: 'dict.free_status.2' }),
            value: '2',
          },
        ];
      },
    },
    {
      title: '流程id',
      dataIndex: 'flow_id',
      hideInSearch: !isdebug,
      hideInTable: !isdebug,
    },
    {
      // title: <FormattedMessage id="common.option" />,
      title: formatMessage({ id: 'common.option' }),
      dataIndex: 'option',
      valueType: 'option',
      align: 'center',
      width: 120,
      hideInTable: props.isUnsettlement,
      render: (dom, record) => [
        <ActionAnchor
          key="edit"
          access="/record/order_view"
          onClick={() => {
            setShow(true);
            setData(record);
          }}
        >
          <FormattedMessage id="common.view" />
        </ActionAnchor>,
      ],
      fixed: 'right',
    },
    {
      title: FormattedMessage({
        id: 'record.lottery.game_type',
        defaultMessage: '游戏类型',
      }),
      dataIndex: 'game_type',
      valueType: 'select',
      request: async () => [
        { label: 'Color Game', value: 1 },
        { label: 'DROP BALL GAME', value: 2 },
      ],
      hideInTable: true,
    },
    // {
    //   title: FormattedMessage({ id: 'record.order.game_name', defaultMessage: 'game_name' }),
    //   dataIndex: 'game_name',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.game_code', defaultMessage: 'game_code' }),
    //   dataIndex: 'game_code',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.play_code', defaultMessage: 'play_code' }),
    //   dataIndex: 'play_code',
    //   hideInSearch: true,
    // },
    // // {
    // //   title: FormattedMessage({ id: 'record.order.multiples', defaultMessage: 'multiples' }),
    // //   dataIndex: 'multiples',
    // //   hideInSearch: true,
    // // },
    // {
    //   title: FormattedMessage({ id: 'record.order.prize_amount', defaultMessage: 'prize_amount' }),
    //   dataIndex: 'prize_amount',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.order_type', defaultMessage: 'order_type' }),
    //   dataIndex: 'order_type',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.ip', defaultMessage: 'ip' }),
    //   dataIndex: 'ip',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.bet_content', defaultMessage: 'bet_content' }),
    //   dataIndex: 'bet_content',
    //   hideInSearch: true,
    // },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="record.order.second_bet_content"
    //       defaultMessage="second_bet_content"
    //     />
    //   ),
    //   dataIndex: 'second_bet_content',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.jackpot_ratio', defaultMessage: 'jackpot_ratio' }),
    //   dataIndex: 'jackpot_ratio',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.prize_type', defaultMessage: 'prize_type' }),
    //   dataIndex: 'prize_type',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.user_id', defaultMessage: 'user_id' }),
    //   dataIndex: 'user_id',
    //   hideInSearch: true,
    // },
  ];
  const location = useLocation() as any;
  // 初始化参数
  useEffect(() => {
    searchFormRef.current?.setFieldsValue({
      ...(location.query || {}),
      dateTimeRange: getToDayRange(),
    });
    history.replace(window.location.pathname + window.location.hash);
    searchFormRef.current?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        manualRequest={true}
        formRef={searchFormRef}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params, sort) => {
          const quert = objValTrim(omitEmpty({ status: 1, ...params } as any));
          if (sort.amount) {
            quert.order_by_amount = sort.amount === 'ascend' ? 'asc' : 'desc';
          }
          const res = await queryUnsettle(quert);
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
      <Modal
        visible={show}
        onCancel={() => {
          setShow(false);
        }}
        destroyOnClose
        title={FormattedMessage({ id: 'common.order.detail', defaultMessage: '注单详情' })}
        width={'1200px'}
        footer={null}
      >
        {data && <UnsettleTabItemDetail {...data} />}
      </Modal>
    </div>
  );
};
