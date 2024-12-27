import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { DetailItem, ListItem } from '../data';
import { formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef } from 'react';
import { type ActionType } from '@ant-design/pro-components';
import { type FormInstance } from 'antd';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { getReportsDetail } from '../service';
export default ({ record }: { record: ListItem }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<FormInstance>();
  const columns: ProColumns<DetailItem>[] = [
    {
      // title: FormattedMessage({ id: 'report.route.created_at', defaultMessage: 'created_at' }),
      title: formatMessage({ id: 'report.route.created_at' }),
      dataIndex: 'date',
      hideInSearch: true,
    },
    {
      // title: FormattedMessage({ id: 'report.route.currency', defaultMessage: 'currency' }),
      title: formatMessage({ id: 'report.route.currency' }),
      dataIndex: 'currency',
      hideInSearch: true,
    },
    {
      // title: FormattedMessage({ id: 'report.route.bet_users', defaultMessage: 'bet_users' }),
      title: formatMessage({ id: 'report.route.bet_users' }),
      dataIndex: 'bet_users',
      hideInSearch: true,
    },
    {
      // title: FormattedMessage({ id: 'report.route.bet_count', defaultMessage: 'bet_count' }),
      title: formatMessage({ id: 'report.route.bet_count' }),
      dataIndex: 'bet_count',
      hideInSearch: true,
    },
    {
      title: formatMessage({ id: 'report.route.amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // title: FormattedMessage({ id: 'report.route.valid_bet', defaultMessage: 'valid_bet' }),
      title: formatMessage({ id: 'report.route.valid_bet' }),
      dataIndex: 'valid_bet',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // title: FormattedMessage({ id: 'report.route.valid_bet', defaultMessage: 'valid_bet' }),
      title: formatMessage({ id: 'report.route.prize_amount' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    {
      title: FormattedMessage({ id: 'report.route.pool_money', defaultMessage: 'pool_money' }),
      dataIndex: 'pool_money',
      hideInSearch: true,
      // valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'record.host.tip', defaultMessage: '小费' }),
      dataIndex: 'gift_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // title: FormattedMessage({ id: 'report.route.profit_amount', defaultMessage: 'profit_amount' }),
      title: formatMessage({ id: 'report.route.profit_amount' }),
      dataIndex: 'profit_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    {
      title: FormattedMessage({ id: 'common.activity.amount', defaultMessage: '活动支出金额' }),
      dataIndex: 'act_prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // title: FormattedMessage({ id: 'report.route.profit_rate', defaultMessage: 'profit_rate' }),
      title: formatMessage({ id: 'report.route.profit_rate' }),
      dataIndex: 'profit_rate',
      hideInSearch: true,
      valueType: 'winLoseRate' as any,
    },
  ];
  // useEffect(() => {
  //   searchFormRef.current?.setFieldsValue({
  //     dateTimeRange: dateTimeRange,
  //   });
  //   searchFormRef.current?.submit();
  // }, []);
  return (
    <ProTable<DetailItem, DetailItem>
      actionRef={actionRef}
      formRef={searchFormRef}
      // manualRequest={true}
      form={{ ignoreRules: false, labelWidth: 'auto', span: 8, span: 12 }}
      // search={{
      //   defaultCollapsed: false,
      //   labelWidth: 'auto',
      //   span: 8,
      // }}
      scroll={{ x: 'max-content' }}
      rowKey="key"
      columns={columns}
      // manualRequest={true}
      request={async (params) => {
        const res = await getReportsDetail(objValTrim(omitEmpty({ ...params, ...record })));
        return {
          total: res.data.length,
          data: res.data,
        };
      }}
      pagination={{ showSizeChanger: true }}
    />
  );
};
