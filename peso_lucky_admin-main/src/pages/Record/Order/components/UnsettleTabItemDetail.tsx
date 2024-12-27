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
import { cancelOrder, queryUnsettleSub } from '../service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { BorderOutlined } from '@ant-design/icons';
import { colorGameColors, dropGameBgs } from '@/utils/color';
import ColorGameResult from '@/components/ColorGameResult';
import ActionAnchor from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { sleep } from '@/utils/sleep';

import { history, useLocation } from 'umi';
import { dropGames as dropArr } from '@/utils/color';
import { currencySelectOption } from '@/utils/options';
export default (record: ListItem) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const form = useBetaSchemaForm();
  const drop_ball_render = (v: string) => {
    // const dropArr = ['黑桃A', '红桃K', '红桃Q', '方片J', '黑桃10', '梅花9'];
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
            {(money as any as number) / 100}
          </div>
        );
      });
  };
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
              //   dataIndex: 'sum_order_number',
              //   valueType: 'copyable',
              // },
              {
                label: <FormattedMessage id="record.order.username" defaultMessage="username" />,
                dataIndex: 'username',
              },
              {
                label: <FormattedMessage id="record.order.user_id" defaultMessage="user_id" />,
                dataIndex: 'user_id',
                // valueType: 'copyable',
              },
            ]}
          />
        );
      },
      width: '330px',
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
                // valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="game.info.game_name" />,
                dataIndex: 'game_name',
                // valueType: 'copyable',
              },
              {
                label: (
                  <FormattedMessage id="record.order.bet_content" defaultMessage="bet_content" />
                ),
                dataIndex: 'bet_content',

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
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
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
                          {(money as any as number) / 100}
                        </div>
                      );
                    });
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.second_bet_content"
                    defaultMessage="second_bet_content"
                  />
                ),
                dataIndex: 'second_bet_content',
                render: (v) => {
                  // #RE 1071202403200057
                  return v
                    ?.toString()
                    .split(',')
                    .map((color: string, i) => {
                      if (!color) return null;
                      const index = ['YELLOW', 'WHITE', 'PINK', 'BLUE', 'RED', 'GREEN'].indexOf(
                        color?.trim(),
                      );
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
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
      width: '300px',
    },

    {
      // title: FormattedMessage({ id: 'record.order.id', defaultMessage: 'id' }),
      title: formatMessage({ id: 'record.order.order_number' }),
      dataIndex: 'order_number',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
    },
    {
      title: FormattedMessage({ id: 'record.order.amount', defaultMessage: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // title: FormattedMessage({ id: 'record.order.merchant_name', defaultMessage: 'merchant_name' }),
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
  ];

  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      dateTimeRange: dateOptions[5].value,
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <div>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        manualRequest={true}
        formRef={searchFormRef}
        form={{ ignoreRules: false }}
        search={false}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params) => {
          const res = await queryUnsettleSub(
            objValTrim(omitEmpty({ ...params, order_number: record.order_number } as any)),
          );
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
      <ModalForm<any>
        onVisibleChange={form.setShow}
        formRef={form.formRef}
        visible={form.show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        title={FormattedMessage({ id: 'common.cancel' })}
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {
          const res = await cancelOrder({ ...values, id: form.data.id });
          if (res.success) {
            message.open({
              type: 'success',
              content: FormattedMessage({ id: 'common.optionSuccess' }),
            });
          }
          actionRef.current?.reload();
          return true;
        }}
      >
        <Space direction={'vertical'}>
          <div>
            <FormattedMessage id="record.order.seq" defaultMessage="seq" /> :{' '}
            {form?.data?.issue_number}
          </div>
          <div>
            <FormattedMessage id="record.order.order_number" defaultMessage="order_number" /> :
            {form?.data?.order_number}
          </div>
          <div>
            <FormattedMessage id="record.order.user_id" defaultMessage="user_id" /> :
            {form?.data?.user_id}
          </div>
          <div>
            <FormattedMessage id="record.order.bet_content" defaultMessage="bet_content" /> :
            <div style={{ display: 'inline-flex', width: '400px' }}>
              <ColorGameResult moneys={form?.data?.bet_content as string} />
            </div>
          </div>
          <div>
            <FormattedMessage id="record.order.prize_amount" defaultMessage="prize_amount" /> :
            {form?.data?.prize_amount / 100}
          </div>
          <div>
            <FormattedMessage id="record.order.win_lose_amount" defaultMessage="win_lose_amount" />{' '}
            :{form?.data?.win_lose_amount / 100}
          </div>
        </Space>
        <div style={{ height: '30px' }}></div>
        <ProFormText
          style={{ marginTop: '60px' }}
          name="remark"
          labelAlign={'left'}
          label={FormattedMessage({ id: 'common.remark' })}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </div>
  );
};
