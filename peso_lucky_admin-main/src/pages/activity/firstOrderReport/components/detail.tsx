import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef } from 'react';
import { type ActionType } from '@ant-design/pro-components';
import { type FormInstance } from 'antd';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { getReportDetail } from '../service';
  export default ({ record }: { record: {} }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<FormInstance>();
  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'player.merchant_code', defaultMessage: '线路名称' }),
      dataIndex: 'merchant_name',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.actID', defaultMessage: '活动编号' }),
      dataIndex: 'seq',
    },
    {
      title: FormattedMessage({ id: 'activity.actFrequency', defaultMessage: '活动周期' }),
      dataIndex: 'act_frequency',
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        return [
          { label: FormattedMessage({ id: 'firstOrderCompensation.single' }), value: '1' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.day' }), value: '2' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.weekly' }), value: '3' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.month' }), value: '4' },
        ];
      },
    },
    {
      title: FormattedMessage({ id: 'activity.joinNum', defaultMessage: '活动参与人数' }),
      dataIndex: 'achievement_num',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({ id: 'activity.newNum', defaultMessage: '活动新用户人数' }),
      dataIndex: 'join_num',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.betAmount', defaultMessage: '首单投注总金额' }),
      dataIndex: 'first_bet_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.prizeAmount', defaultMessage: '包赔发放金额' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.avg', defaultMessage: '平均每用户赔付金额' }),
      dataIndex: 'avg_prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.receiveRate', defaultMessage: '领取率' }),
      dataIndex: 'prize_receive_rate',
      hideInSearch: true,
      renderText(text, record, index, action) {
        return  `${(record.prize_receive_rate*100).toLocaleString()}%`;
      },
    },
    {
      title: FormattedMessage({ id: 'activity.winLoss', defaultMessage: '首单输赢情况' }),
      dataIndex: 'first_bet_win_lose',
      hideInSearch: true,
    },
  ];


  return (
    <ProTable<DetailItem, DetailItem>
      actionRef={actionRef}
      formRef={searchFormRef}
      form={{ ignoreRules: false, labelWidth: 'auto', span: 8, span: 12 }}
      scroll={{ x: 'max-content' }}
      rowKey="key"
      columns={columns}
      search={false}
      request={async (params) => {
        console.log(params, {...record},record )
        const res = await getReportDetail(objValTrim(omitEmpty({...record})));
        return {
          total: res.data.length,
          data: res.data,
        };
      }}
      pagination={{ showSizeChanger: true }}
    />
  );
};
