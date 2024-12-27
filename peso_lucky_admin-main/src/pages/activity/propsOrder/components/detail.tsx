import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef } from 'react';
import { type ActionType } from '@ant-design/pro-components';
import { type FormInstance } from 'antd';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { getOrderReportDetail } from '../service';
  export default ({ record }: { record: {} }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<FormInstance>();
  const columns: ProColumns[] = [
    {
      title: '日期',
      dataIndex: 'created_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'activity.receive.price' ,defaultMessage:'发放总价值'}),
      dataIndex: 'receive_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.usage.price' ,defaultMessage:'使用总价值'}),
      dataIndex: 'usage_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.prize.amount' ,defaultMessage:'总派彩金额/总成本'}),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.theoretical' ,defaultMessage:'理论成本'}),
      dataIndex: 'theoretical_min_price',
      hideInSearch: true,
      renderText(text, record, index, action) {
        return  `${(record.theoretical_min_price/ 100).toLocaleString()}-${(record.theoretical_max_price/ 100).toLocaleString()}`;
      },
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
        const res = await getOrderReportDetail(objValTrim(omitEmpty({...record})));
        return {
          total: res.data.length,
          data: res.data,
        };
      }}
      pagination={{ showSizeChanger: true }}
    />
  );
};
