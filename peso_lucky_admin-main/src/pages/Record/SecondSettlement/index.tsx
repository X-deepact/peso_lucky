import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query } from './service';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { useEffect, useRef, useState } from 'react';
import { type ProFormInstance } from '@ant-design/pro-components';

export default () => {
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
    {
      title: FormattedMessage({
        id: 'secondSettlement.id',
        defaultMessage: 'ID',
      }),
      dataIndex: 'id',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({
        id: 'secondSettlement.created_at',
        defaultMessage: '二次结算时间',
      }),
      dataIndex: 'settle_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({
        id: 'record.order.seq',
        defaultMessage: 'seq',
      }),
      dataIndex: 'seq',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'record.order.game_name',
        defaultMessage: '游戏名称',
      }),
      dataIndex: 'game_name',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.order_count',
        defaultMessage: 'order_count',
      }),
      dataIndex: 'order_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.user_count',
        defaultMessage: '影响用户',
      }),
      dataIndex: 'user_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.mer_count',
        defaultMessage: '影响线路',
      }),
      dataIndex: 'mer_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.init_prize_amount',
        defaultMessage: '第一次派彩金额',
      }),
      dataIndex: 'init_prize_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.second_prize_amount',
        defaultMessage: '第二次派彩金额',
      }),
      dataIndex: 'second_prize_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.recycle_win_amount',
        defaultMessage: '应回收金额',
      }),
      dataIndex: 'recycle_win_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.actual_recycle_win_amount',
        defaultMessage: '回收金额', // todo
      }),
      dataIndex: 'actual_recycle_win_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_mult_amount',
        defaultMessage: '未收回倍数金额',
      }),
      dataIndex: 'not_recycle_mult_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_jackpot_amount',
        defaultMessage: '未收回奖池金额',
      }),
      dataIndex: 'not_recycle_jackpot_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.jackpot_deficit_amount',
        defaultMessage: '奖池补足金额',
      }),
      dataIndex: 'jackpot_deficit_amount',
      hideInSearch: true,
      renderText: (val: any) => val / 100,
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.updated_by',
        defaultMessage: '操作人员',
      }),
      dataIndex: 'updated_by',
      hideInSearch: true,
    },
    // {
    //   title: FormattedMessage({
    //     id: 'secondSettlement.status',
    //     defaultMessage: '操作方式',
    //   }),
    //   dataIndex: 'status',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({
        id: 'secondSettlement.remark',
        defaultMessage: '备注',
      }),
      dataIndex: 'remark',
      hideInSearch: true,
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
