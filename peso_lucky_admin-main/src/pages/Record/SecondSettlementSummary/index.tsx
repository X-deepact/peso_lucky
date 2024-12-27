import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useEffect, useRef, useState } from 'react';
import { type ActionType } from '@ant-design/pro-components';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query } from './service';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { currencySelectOption } from '@/utils/options';
import { type ProFormInstance } from '@ant-design/pro-components';
export default () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'secondSettlement.dateTimeRange', defaultMessage: '撤单时间' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const start_at = moment(value[0]).valueOf();
          const end_at = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
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
      title: FormattedMessage({
        id: 'record.order.game_name',
        defaultMessage: 'game_name',
      }),
      dataIndex: 'game_name',
      hideInTable: true,
    },
    {
      title: FormattedMessage({
        id: 'record.order.seq',
        defaultMessage: 'seq',
      }),
      dataIndex: 'seq',
      hideInTable: true,
    },
    // 二次结算时间

    {
      title: FormattedMessage({
        id: 'secondSettlement.created_at',
        defaultMessage: '二次结算时间',
      }),
      dataIndex: 'created_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },

    // 交易单号
    {
      title: FormattedMessage({
        id: 'record.order.order_number',
        defaultMessage: '交易单号',
      }),
      dataIndex: 'order_number',
      // hideInSearch: true,
    },

    // 游戏期号
    {
      title: FormattedMessage({
        id: 'record.order.seq',
        defaultMessage: '游戏期号',
      }),
      dataIndex: 'seq',
      hideInSearch: true,
    },
    // 账号名称
    {
      title: FormattedMessage({ id: 'player.nickname' }),
      dataIndex: 'nickname',
      // hideInSearch: true,
    },
    // 币种
    {
      title: FormattedMessage({
        id: 'merchant.currency',
        defaultMessage: '币种',
      }),
      dataIndex: 'currency',
      // hideInSearch: true,
      request: async () => {
        return currencySelectOption;
      },
    },
    // 游戏名称

    {
      title: FormattedMessage({
        id: 'game.info.game_name',
        defaultMessage: '游戏名称',
      }),
      dataIndex: 'game_name',
      hideInSearch: true,
    },
    // 商户名称
    {
      title: FormattedMessage({
        id: 'record.order.merchant_name',
        defaultMessage: '商户名称',
      }),
      dataIndex: 'merchant_name',
      // hideInSearch: true,
    },
    // 初次派彩金额
    {
      title: FormattedMessage({
        id: 'secondSettlement.init_prize_amount',
        defaultMessage: '初次派彩金额',
      }),
      dataIndex: 'init_prize_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    // 二次派彩金额
    {
      title: FormattedMessage({
        id: 'secondSettlement.second_prize_amount',
        defaultMessage: '二次派彩金额',
      }),
      dataIndex: 'second_prize_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    // 调整金额
    {
      title: FormattedMessage({
        id: 'secondSettlement.adjust_amount',
        defaultMessage: '调整金额',
      }),
      dataIndex: 'adjust_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    // 未收回倍数奖金
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_mult_amount',
        defaultMessage: '未收回倍数金额',
      }),
      dataIndex: 'not_recycle_mult_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    // 未收回奖池奖金
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_jackpot_amount',
        defaultMessage: '未收回奖池金额',
      }),
      dataIndex: 'not_recycle_jackpot_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
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
    <PageHeaderWrapper>
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
        request={async (params) => {
          const res = await query(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
    </PageHeaderWrapper>
  );
};
