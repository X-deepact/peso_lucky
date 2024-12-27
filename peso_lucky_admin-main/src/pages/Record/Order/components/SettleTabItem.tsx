import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from '../data';
import { useIntl, useModel, formatMessage, useRequest } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import {
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
  ProFormGroup,
  ProCard,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormDependency,
} from '@ant-design/pro-components';
import { Divider, message, Modal } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { querysettle, getDetail, settleSum } from '../service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import ColorGameResult from '@/components/ColorGameResult';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, getDefaultDateTimeRange, getToDayRange } from '@/utils/dateRange';
import { isEmpty, keys } from 'lodash';
import { sleep } from '@/utils/sleep';
import { currencySelectOption } from '@/utils/options';
import { getGameType } from '@/pages/Game/Content/service';
import { DownOutlined } from '@ant-design/icons';

export default () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const form = useBetaSchemaForm();

  const [initVals, setinitVals] = useState({} as any);

  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="record.order.dateTimeRange" />,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const bet_time_start = moment(value[0]).valueOf();
          const bet_time_end = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            bet_time_start,
            bet_time_end,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: <FormattedMessage id="record.order.created_at__" defaultMessage="结算时间" />,
      dataIndex: 'dateTimeRange2',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const settle_start_at = moment(value[0]).valueOf();
          const settle_end_at = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            settle_start_at,
            settle_end_at,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    // 注单信息
    {
      title: <FormattedMessage id="record.order.created_at" defaultMessage="created_at" />,
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.settle_time', defaultMessage: 'settle_time' }),
      dataIndex: 'settle_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // 订单号
    {
      title: formatMessage({ id: 'record.order.order_number' }),
      dataIndex: 'order_number',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.lottery.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      valueType: 'select',
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: <FormattedMessage id="game.info.game_name" defaultMessage="seq" />,
      dataIndex: 'game_name',
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
              // {
              //   label: (
              //     <FormattedMessage id="record.order.order_number" defaultMessage="order_number" />
              //   ),
              //   dataIndex: 'order_number',
              //   valueType: 'copyable',
              // },
              {
                label: <FormattedMessage id="record.order.username" defaultMessage="username" />,
                dataIndex: 'username',
              },
              {
                label: <FormattedMessage id="record.order.user_id" defaultMessage="user_id" />,
                dataIndex: 'user_id',
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
                // 游戏期号
                dataIndex: 'seq',
              },
              {
                label: <FormattedMessage id="game.info.code_type" defaultMessage="code_type" />,
                dataIndex: 'code_type',
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
                dataIndex: 'bet_content',
                render: (v) => {
                  return <ColorGameResult moneys={v as string} game_type={record.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.second_bet_content"
                    defaultMessage="second_bet_content_summary"
                  />
                ),
                dataIndex: 'second_bet_content',
                render: (v) => {
                  if (record.code_type === 'JP' || record.game_code_type === 'JP') return null;
                  return <ColorGameResult colors={v as string} game_type={record.game_type} />;
                },
              },
            ]}
          />
        );
      },
      width: '400px',
    },
    // 币种
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
      fieldProps: {
        defaultValue: '',
      },
    },
    // 商户用户ID
    {
      title: (
        <FormattedMessage id="record.order.merchant_user_id" defaultMessage="merchant_user_id" />
      ),
      dataIndex: 'merchant_user_id',
      hideInTable: true,
      hideInForm: true,
    },
    // 下注金额
    {
      title: FormattedMessage({ id: 'record.order.amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
      sorter: true,
    },
    // 派奖金额
    {
      title: FormattedMessage({ id: 'record.order.prize_amount' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
      sorter: true,
    },
    {
      title: FormattedMessage({
        id: 'record.order.jackpot_amount',
        defaultMessage: 'award_amount',
      }),
      dataIndex: 'award_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'record.order.prize_type', defaultMessage: 'prize_type' }),
      dataIndex: 'prize_type',
      hideInSearch: true,
      render: (_dom, record) => {
        // 奖池玩法
        if (record.code_type === 'JP' || record.game_code_type === 'JP') {
          const value = record.second_draw_result;

          const jackpotMapping = {
            88801: 'minor jackpot',
            88802: 'major jackpot',
            88803: 'grand jackpot',
          };
          // 判断是否为 jackpot
          if (value in jackpotMapping) {
            return (jackpotMapping as any)[value] as string;
          }
          // 如果有值则返回多倍信息
          if (value) {
            return `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`;
          }

          // 默认返回 award_amount 或 '-'
          return '-';
        }
        // if (record.code_type === 'SG') {

        // const value = record.second_draw_result;
        return record?.prize_type < 88801 && record?.prize_type > 0
          ? `${record?.prize_type} ${FormattedMessage({ id: 'record.order.multiple' })}`
          : '-';

        // (
        //   <ColorGameResult colors={value as string} />
        // );
        // }
        // return null;
        // const value =
        //   Number(record.second_draw_result) - Number(record.prize_type) === 1
        //     ? record?.second_draw_result
        //     : record.prize_type;
        // return value == 88801
        //   ? 'minor jackpot'
        //   : value == 88802
        //   ? 'major jackpot'
        //   : value == 88803
        //   ? 'grand jackpot'
        //   : value
        //   ? // second_draw_result
        //     `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
        //   : record.award_amount;
      },
    },
    {
      title: (
        <FormattedMessage id="record.order.win_lose_amount" defaultMessage="win_lose_amount" />
      ),
      dataIndex: 'win_lose_amount',
      hideInSearch: true,
      valueType: 'winLoseAmount' as any,
      // sorter: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.amount_valid', defaultMessage: 'amount_valid' }),
      dataIndex: 'amount_valid',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
      dataIndex: 'status1',
      hideInSearch: true, // 只展示
      render: (_dom: any, record: any) =>
        // 【脏活】后端订单有一定情况 已结算处理中会给未结算的状态 这边做一下处理
        formatMessage({ id: `dict.order_status.${record.status}` }),
    } as any,
    {
      title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInTable: true,
      // request: async () => await optionDictDataSelect({ dictType: 'order_status' }, true),
      // 1 - 未开奖(可以下注)，2 - 开奖中(停止下注)，3 - 游戏取消(撤单)，4 - 一次开奖，5 - 二次开奖
      request: async () => {
        return [
          // {
          //   label: formatMessage({ id: 'dict.order_status.1' }),
          //   value: 1,
          // },
          {
            label: formatMessage({ id: 'dict.order_status.2' }),
            value: 2,
          },
          {
            label: formatMessage({ id: 'dict.order_status.3' }),
            value: 3,
          },
          {
            label: formatMessage({ id: 'dict.order_status.4' }),
            value: 4,
          },
        ];
      },
      valueType: 'select',
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
    {
      title: formatMessage({ id: 'record.order.merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      title: formatMessage({ id: 'record.order.user_id' }),
      dataIndex: 'user_id',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'record.order.username' }),
      dataIndex: 'username',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
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
      title: formatMessage({ id: 'common.draw.result' }),
      dataIndex: 'option',
      valueType: 'option',
      align: 'center',
      width: 120,
      hideInTable: false,
      render: (dom, record) => [
        <ActionAnchor
          key="edit"
          access="/record/order_view"
          onClick={() => {
            Modal.info({
              width: '800px',
              content: (
                <ProCard
                  bordered
                  headerBordered
                  title={formatMessage({ id: 'common.draw.result' })}
                  extra={formatMessage({ id: 'trAdd.periodNum' }) + `：${record.seq}`}
                  split="horizontal"
                >
                  <ProCard title={formatMessage({ id: 'record.first_settlement_result' })}>
                    <ProDescriptions
                      layout="horizontal"
                      dataSource={record}
                      column={2}
                      columns={[
                        {
                          title: formatMessage({ id: 'common.first_draw_result' }),
                          dataIndex: 'first_draw_result',
                          render(v) {
                            return (
                              <ColorGameResult colors={v as string} game_type={record.game_type} />
                            );
                          },
                        },
                        {
                          title: formatMessage({ id: 'common.first_draw_time' }),
                          dataIndex: 'first_draw_time',
                          valueType: 'dateTime',
                        },
                        {
                          title: formatMessage({ id: 'common.second_draw_result' }),
                          dataIndex: 'second_draw_result',
                          render() {
                            // 奖池玩法
                            const value = record.second_draw_result;
                            if (record.code_type === 'JP' || record.game_code_type === 'JP') {
                              return value == 88801
                                ? 'minor jackpot'
                                : value == 88802
                                ? 'major jackpot'
                                : value == 88803
                                ? 'grand jackpot'
                                : value
                                ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                                : '-';
                            }
                            return (
                              <ColorGameResult
                                colors={value as string}
                                game_type={record.game_type}
                              />
                            );
                          },
                        },
                        {
                          title: formatMessage({ id: 'common.second_draw_time' }),
                          dataIndex: 'second_draw_time',
                          valueType: 'dateTime',
                        },
                      ]}
                    />
                  </ProCard>
                  <ProCard
                    title={formatMessage({
                      id: 'record.second_settlement_result',
                      defaultMessage: '二次结算结果',
                    })}
                  >
                    <ProDescriptions
                      layout="horizontal"
                      dataSource={record}
                      column={2}
                      columns={[
                        // 二次结算

                        {
                          title: formatMessage({ id: 'common.first_draw_result' }),
                          dataIndex: 'ss_first_draw_result',
                          render(v) {
                            console.log(record, 'record.code_type');
                            return (
                              <ColorGameResult colors={v as string} game_type={record.game_type} />
                            );
                          },
                        },
                        {
                          title: formatMessage({ id: 'common.second_draw_result' }),
                          dataIndex: 'ss_second_draw_result',
                          render(value) {
                            // 奖池玩法
                            if (record.code_type === 'JP' || record.game_code_type === 'JP') {
                              return value == 88801
                                ? 'minor jackpot'
                                : value == 88802
                                ? 'major jackpot'
                                : value == 88803
                                ? 'grand jackpot'
                                : value
                                ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                                : '-';
                            }

                            return (
                              <ColorGameResult
                                colors={value as string}
                                game_type={record.game_type}
                              />
                            );
                          },
                        },
                        {
                          title: formatMessage({ id: 'common.second_draw_time' }),
                          dataIndex: 'ss_settle_time',
                          valueType: 'dateTime',
                        },
                      ]}
                    />
                  </ProCard>
                </ProCard>
              ),
            });
            // Modal.info({
            //   width: '800px',
            //   title: formatMessage({ id: 'common.draw.result' }),
            //   content: (
            //     <ProDescriptions
            //       title={
            //         <Space>
            //           {intl.formatMessage({
            //             id: 'trAdd.periodNum',
            //             defaultMessage: '期号',
            //           })}
            //           <span>{record.seq}</span>
            //         </Space>
            //       }
            //       layout="horizontal"
            //       dataSource={record}
            //       column={2}
            //       columns={[
            //         {
            //           title: formatMessage({ id: 'common.first_draw_result' }),
            //           dataIndex: 'first_draw_result',
            //           render(v) {
            //             return (
            //               <ColorGameResult colors={v as string} game_type={record.game_type} />
            //             );
            //           },
            //         },
            //         {
            //           title: formatMessage({ id: 'common.first_draw_time' }),
            //           dataIndex: 'first_draw_time',
            //           valueType: 'dateTime',
            //         },
            //         {
            //           title: formatMessage({ id: 'common.second_draw_result' }),
            //           dataIndex: 'second_draw_result',
            //           render(v) {
            //             const value = record.second_draw_result;
            //             if (record.code_type === 'JP' || record.game_code_type === 'JP') {
            //               let val;
            //               switch (value) {
            //                 case '88801':
            //                   return 'minor jackpot';
            //                   break;

            //                 case '88802':
            //                   return 'major jackpot';
            //                   break;

            //                 case '88803':
            //                   return 'grand jackpot';
            //                   break;

            //                 default:
            //                   // 如果value为空说明  没有进入二次开奖
            //                   if (value) {
            //                     val = `${value} ${FormattedMessage({
            //                       id: 'record.order.multiple',
            //                     })}`;
            //                   } else {
            //                     // val = record.award_amount;
            //                     val = '-';
            //                   }
            //                   break;
            //               }

            //               return val;
            //             }
            //             return (
            //               <ColorGameResult colors={v as string} game_type={record.game_type} />
            //             );
            //           },
            //         },
            //         {
            //           title: formatMessage({ id: 'common.second_draw_time' }),
            //           dataIndex: 'second_draw_time',
            //           valueType: 'dateTime',
            //         },
            //       ]}
            //     />
            //   ),
            // });
          }}
        >
          <FormattedMessage id="common.view" />
        </ActionAnchor>,
      ],
      fixed: 'right',
    },
    // {
    //   title: FormattedMessage({
    //     id: 'record.lottery.game_type',
    //     defaultMessage: '游戏类型',
    //   }),
    //   dataIndex: 'game_type',
    //   valueType: 'select',
    //   request: async () => [
    //     { label: 'Color Game', value: 1 },
    //     { label: 'DROP BALL GAME', value: 2 },
    //   ],
    //   hideInTable: true,
    // },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: 'option' }),
      dataIndex: 'option',
      hideInSearch: true,
      fixed: 'right',
      width: '80px',
      hideInTable: process.env.PLATFORM === 'MERCHANT' || false,
      render: (dom, record) => {
        return [
          <ActionAnchor
            key="edit"
            access="/record/order_cancel"
            action={async () => {
              const { data = {} } = await getDetail(record.order_number);

              setinitVals({
                ...record,
                ...data,
              });

              form.setShow(true);
            }}
          >
            <FormattedMessage id="common.detail" />
          </ActionAnchor>,
        ];
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

  const settleSumData = useRequest(settleSum, {
    manual: true,
  });
  const formatAmout = (v: number) => {
    if (v == null) return 0;
    // 格式化成 11,234,567.45形式
    if (typeof v !== 'number') {
      return v;
    }
    try {
      const formattedValue = (v / 100).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return formattedValue;
    } catch (error) {
      return v / 100;
    }
  };
  const format = (v: number) => {
    return formatAmout(v ? v * 100 : 0);
  };

  return (
    <div>
      <ProTable<ListItem, any>
        actionRef={actionRef}
        manualRequest={true}
        formRef={searchFormRef}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        toolBarRender={() => [
          <ActionBtn
            access="/record/order_export"
            key="out"
            type="primary"
            onClick={() => {
              // 下载导出数据

              //  获取当前页码
              const current = actionRef.current?.pageInfo?.current || 1;
              const pageSize = actionRef.current?.pageInfo?.pageSize || 20;

              const Platform = localStorage.getItem('Platform') || '';
              const token = localStorage.getItem('token');

              const { dateTimeRange, dateTimeRange2 } = searchFormRef.current?.getFieldsValue();

              const values = {
                ...objValTrim(omitEmpty(searchFormRef.current?.getFieldsValue())),
                bet_time_start: dateTimeRange?.[0]?.valueOf(),
                bet_time_end: dateTimeRange?.[1]?.valueOf(),
                settle_start_at: dateTimeRange2?.[0]?.valueOf(),
                settle_end_at: dateTimeRange2?.[1]?.valueOf(),
                current,
                pageSize,
                dateTimeRange: undefined,
              };

              const url: string = '/api/v1/record/order/settle/excel';
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
              })
                .then((response) => {
                  response.blob().then((blob) => {
                    const a = document.createElement('a');
                    const DownloadURl = window.URL.createObjectURL(blob);
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = '注单记录-已结算.xls';
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
                })
                .catch((error) => {
                  message.error(FormattedMessage({ id: 'common.export.error' }));
                });
            }}
          >
            <FormattedMessage id="pages.export" defaultMessage="导出" />
            <DownOutlined />
          </ActionBtn>,
        ]}
        tableExtraRender={() => {
          return [
            <ProDescriptions bordered loading={settleSumData.loading} column={4}>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.total_orders' })}
              >
                {format(settleSumData?.data?.[0]?.bet_count)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.total_users' })}
              >
                {format(settleSumData?.data?.[0]?.bet_users)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.total_bet_amount' })}
              >
                {formatAmout(settleSumData?.data?.[0]?.amount)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.total_bonus' })}
              >
                {formatAmout(settleSumData?.data?.[0]?.total_bonus)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.total_win_loss' })}
              >
                {formatAmout(settleSumData?.data?.[0]?.win_lose_amount)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.prize_amount' })}
              >
                {formatAmout(settleSumData?.data?.[0]?.prize_amount)}
              </ProDescriptions.Item>
              <ProDescriptions.Item
                copyable
                label={FormattedMessage({ id: 'record.lottery.award_amount' })}
              >
                {formatAmout(settleSumData?.data?.[0]?.award_amount)}
              </ProDescriptions.Item>
            </ProDescriptions>,
          ];
        }}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params, sort) => {
          // Betting time and settlement time cannot be checked at the same time.
          //
          if (params.bet_time_start && params.settle_start_at) {
            message.error(FormattedMessage({ id: 'order.time.errorinfo' }));
            return Promise.reject(FormattedMessage({ id: 'order.time.errorinfo' }));
          }
          const query = objValTrim(omitEmpty({ ...params } as any));
          console.log(params, sort, '---------9090909');
          if (sort.prize_amount) {
            query.order_by_prize_amount = sort.prize_amount === 'ascend' ? 'asc' : 'desc';
          }
          if (sort.amount) {
            query.order_by_amount = sort.amount === 'ascend' ? 'asc' : 'desc';
          }
          if (sort.win_lose_amount) {
            query.order_by_win_lose_amount = sort.win_lose_amount === 'ascend' ? 'asc' : 'desc';
          }
          settleSumData.run(query);
          // 兼容后端接口 一起请求有问题， 具体咨询 dabluo
          sleep(1000);
          const res = await querysettle(query);
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />

      <ModalForm<any>
        modalProps={{
          destroyOnClose: true,
        }}
        onVisibleChange={form.setShow}
        formRef={form.formRef}
        visible={form.show}
        readonly
        initialValues={initVals}
        syncToInitialValues
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 24,
        }}
        title={FormattedMessage({ id: 'common.order.detail', defaultMessage: '注单详情' })}
        onFinish={async () => {
          return true;
        }}
      >
        <ProFormGroup>
          <ProFormText
            width="md"
            name="username"
            label={FormattedMessage({ id: 'player.nickname' })}
          />
          <ProFormText width="md" name="user_id" label={FormattedMessage({ id: 'player.id' })} />
          <ProFormText
            width="md"
            name="merchant_name"
            label={FormattedMessage({ id: 'chat.merchant_name', defaultMessage: '商户名称' })}
          />
          <ProFormText
            width="md"
            name="merchant_code"
            label={FormattedMessage({ id: 'record.merchant_code' })}
          />
          <ProFormText
            width="md"
            name="game_name"
            label={FormattedMessage({ id: 'record.order.game_name', defaultMessage: '游戏名称' })}
          />
          <ProFormText
            width="md"
            name="game_code"
            label={FormattedMessage({ id: 'record.game_code' })}
          />
          <ProFormSelect
            width="md"
            name="game_type"
            label={FormattedMessage({ id: 'record.lottery.game_type', defaultMessage: '游戏类型' })}
            options={[
              { label: 'Color Game', value: 1 },
              { label: 'DROP BALL GAME', value: 2 },
            ]}
          />
          <ProFormSelect
            width="md"
            name="code_type"
            label={FormattedMessage({ id: 'record.play_type', defaultMessage: '玩法类型' })}
            options={[
              { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
              { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
            ]}
          />
          <ProFormText
            width="md"
            name="seq"
            label={FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' })}
          />
          <ProFormDateTimePicker
            name="created_at"
            label={FormattedMessage({ id: 'record.lottery.open_time', defaultMessage: '开始时间' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />
          <ProFormSelect
            width="md"
            name="device_type"
            label={FormattedMessage({ id: 'record.order.device_type', defaultMessage: '设备类型' })}
            valueEnum={{ 1: 'PC-WEB', 2: 'H5', 3: 'APP(iOS)', 4: 'APP(Android)', 0: 'OTHER' }}
          />
          <ProFormText width="md" name="ip" label="IP" />
          <ProFormText
            width="md"
            name="currency"
            label={FormattedMessage({ id: 'record.deal.currency' })}
          />
          <ProFormSelect
            width="md"
            name="free_status"
            label={FormattedMessage({ id: 'pages.menuManage.menuType' })}
            valueEnum={{
              1: FormattedMessage({ id: 'dict.free_status.1' }),
              2: FormattedMessage({ id: 'dict.free_status.2' }),
              0: FormattedMessage({ id: 'dict.free_status.1' }),
            }}
          />
        </ProFormGroup>
        <Divider />
        <ProFormGroup>
          <ProFormText
            width="md"
            name="anchor_name"
            label={FormattedMessage({ id: 'record.draw_person' })}
          />
          <ProFormSelect
            width="md"
            name="status"
            label={FormattedMessage({ id: 'record.order.status' })}
            options={[
              {
                label: formatMessage({ id: 'dict.order_status.2' }),
                value: 2,
              },
              {
                label: formatMessage({ id: 'dict.order_status.3' }),
                value: 3,
              },
              {
                label: formatMessage({ id: 'dict.order_status.4' }),
                value: 4,
              },
            ]}
          />
          <ProFormDateTimePicker
            name="first_draw_time"
            label={formatMessage({ id: 'record.first_bet_time' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />
          <ProFormDateTimePicker
            name="second_draw_time"
            label={formatMessage({ id: 'record.second_bet_time' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />

          <ProDescriptions
            layout="horizontal"
            dataSource={initVals}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage
                    id="record.order.bet_content"
                    defaultMessage="bet_content_summary"
                  />
                ),
                dataIndex: 'bet_content',
                render: (v) => {
                  return <ColorGameResult moneys={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage id="common.first_draw_result" defaultMessage="第一次开奖结果" />
                ),
                dataIndex: 'first_draw_result',
                render: (v) => {
                  return <ColorGameResult colors={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.second_bet_content"
                    defaultMessage="第二次下注内容"
                  />
                ),
                dataIndex: 'second_bet_content',
                render: (v) => {
                  if (initVals.code_type === 'JP' || initVals.game_code_type === 'JP') return null;
                  return <ColorGameResult colors={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="common.second_draw_result"
                    defaultMessage="第二次开奖结果"
                  />
                ),
                dataIndex: 'second_prize_content',
                render: () => {
                  // 奖池玩法
                  if (initVals.code_type === 'JP' || initVals.game_code_type === 'JP') {
                    const value = initVals.second_prize_content;
                    return value == 88801
                      ? 'minor jackpot'
                      : value == 88802
                      ? 'major jackpot'
                      : value == 88803
                      ? 'grand jackpot'
                      : value
                      ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                      : '-';
                  }
                  // if (initVals.code_type === 'SG') {

                  // const value = initVals.second_prize_content;
                  return initVals?.prize_type < 88801 && initVals?.prize_type > 0
                    ? `${initVals?.prize_type} ${FormattedMessage({ id: 'record.order.multiple' })}`
                    : '-';
                },
              },
            ]}
          />
        </ProFormGroup>
        <Divider />
        <ProFormGroup>
          <ProFormText
            width="md"
            name="amount"
            label={FormattedMessage({ id: 'record.lottery.total_bet_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="amount_valid"
            label={FormattedMessage({ id: 'record.order.award_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="prize_amount"
            label={FormattedMessage({ id: 'record.lottery.total_prize_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="win_lose_amount"
            label={FormattedMessage({ id: 'record.order.win_lose_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="jackpot_type"
            label={FormattedMessage({
              id: 'risk.jackpot_name',
              defaultMessage: 'prize_type',
            })}
            // convertValue={(value) => String(value / 100)}
            convertValue={(value) => {
              console.log(value, '----090909');
              return value == 88801
                ? 'minor jackpot'
                : value == 88802
                ? 'major jackpot'
                : value == 88803
                ? 'grand jackpot'
                : value
                ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                : '-';
            }}
          />
          <ProFormText
            width="md"
            name="jackpot_prize_amount"
            label={FormattedMessage({ id: 'risk.payout_amount' })}
            convertValue={(value) => String(value / 100)}
          />
        </ProFormGroup>

        {initVals?.status === 4 && (
          <ProCard.Group title="二次结算信息" direction={'row'}>
            <ProCard.Group direction={'row'}>
              <ProCard>
                <ProFormText
                  width="md"
                  name="amount"
                  label={FormattedMessage({ id: 'record.lottery.total_bet_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_amount_valid"
                  label={FormattedMessage({ id: 'record.order.award_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_adjust_amount"
                  label="派彩调整"
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_prize_amount"
                  label={FormattedMessage({ id: 'record.lottery.total_prize_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
            </ProCard.Group>

            <ProCard.Group direction={'row'}>
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_win_lose_amount"
                  label={FormattedMessage({ id: 'record.order.win_lose_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_win_lose_adjust"
                  label={FormattedMessage({ id: 'record.order.win_lose_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_jackpot_type"
                  label={FormattedMessage({ id: 'risk.jackpot_name' })}
                  // convertValue={(value) => String(value / 100)}
                  convertValue={(value) => {
                    return value == 88801
                      ? 'minor jackpot'
                      : value == 88802
                      ? 'major jackpot'
                      : value == 88803
                      ? 'grand jackpot'
                      : value
                      ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                      : '-';
                  }}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_jackpot_prize_amount"
                  label={FormattedMessage({ id: 'risk.payout_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
            </ProCard.Group>

            <ProCard.Group direction={'row'}>
              <ProFormGroup>
                <ProCard>
                  <ProFormDateTimePicker
                    name="ss_settle_time"
                    label={FormattedMessage({ id: 'secondSettlement.created_at' })}
                    fieldProps={{
                      format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
                    }}
                  />
                </ProCard>
                <ProCard>
                  <ProFormText
                    width="md"
                    name="ss_updated_by"
                    label={FormattedMessage({ id: 'trAdd.optionBy' })}
                  />
                </ProCard>
                <ProCard>
                  <ProFormText
                    width="md"
                    name="ss_remark"
                    label={FormattedMessage({ id: 'maintainLog.remark' })}
                  />
                </ProCard>
              </ProFormGroup>
            </ProCard.Group>
          </ProCard.Group>
        )}
      </ModalForm>
    </div>
  );
};
