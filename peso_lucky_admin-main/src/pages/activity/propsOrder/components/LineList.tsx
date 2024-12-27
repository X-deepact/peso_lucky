import React, { useRef, useEffect, useState } from 'react';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { getOrderReport, getOrderReportDetail } from '../service';
import { getToDayRange, useNewGetDateTime } from '@/utils/dateRange';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { keys } from 'lodash';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { useRequest } from 'umi';
import { Tag, Modal } from 'antd';
import { useBetaSchemaForm } from '@/hooks';
import { currencySelectOption } from '@/utils/options';
import Detail from './detail';

export default (props: { isUnsettlement?: boolean }) => {
  const [show, setShow] = useState(false);
  const [record, setRecord] = useState<{ record: {} }>();
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();


  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: "common.dateTimeRange" }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            start_time: dayjs(value[0]).valueOf().toString(),
            end_time: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
    },
    {
      title: FormattedMessage({ id: 'activity.line', defaultMessage: '归属线路' }),
      dataIndex: 'merchant_name',
    },

    // 币种
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
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
      title: FormattedMessage({ id: 'activity.receive.price', defaultMessage: '发放总价值' }),
      dataIndex: 'receive_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.usage.price', defaultMessage: '使用总价值' }),
      dataIndex: 'usage_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.prize.amount', defaultMessage: '总派彩金额/总成本' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.theoretical', defaultMessage: '理论成本' }),
      dataIndex: 'theoretical_min_price',
      hideInSearch: true,
      renderText(text, record, index, action) {
        return `${(record.theoretical_min_price / 100).toLocaleString()}-${(record.theoretical_max_price / 100).toLocaleString()}`;
      },
    },
    {
      title: FormattedMessage({ id: 'activity.lineData', defaultMessage: '线路数据' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, _record) => [
        <ActionAnchor
          key="edit"
          access="/props/lineList/detail"
          action={async () => {
            setShow(true);
            const dateTimeRange = searchFormRef?.current?.getFieldValue('dateTimeRange');
            setRecord({
              record: {
                'merchant_id': _record.merchant_id,
                'currency': _record.currency,
                'start_time': dateTimeRange ? dayjs(dateTimeRange?.[0]).startOf('day').valueOf() : '',
                'end_time': dateTimeRange ? dayjs(dateTimeRange?.[1]).endOf('day').valueOf() : '',
              },
            } as any);
          }}
        >
          <FormattedMessage id="activity.view" />
        </ActionAnchor>,
      ],
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
          const res = await getOrderReport(objValTrim(omitEmpty(params)));
          console.log(res);
          return {
            total: res?.total || 0,
            data: res?.data || [],
          };
        }}
        editable={{
          type: 'multiple',
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
      <Modal
        visible={show}
        onCancel={() => {
          setShow(false);
        }}
        destroyOnClose
        title={FormattedMessage({ id: 'activity.lineData', defaultMessage: '线路数据' })}
        width={'1000px'}
        footer={null}
      >
        {record && <Detail {...record} />}
      </Modal>
    </div>
  );
};
