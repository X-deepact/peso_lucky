import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne } from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'record.deal.updated_at', defaultMessage: 'updated_at' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const created_start_at = moment(value[0]).valueOf();
          const created_end_at = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            created_start_at,
            created_end_at,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({ id: 'record.deal.updated_at', defaultMessage: 'updated_at' }),
      dataIndex: 'updated_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'record.deal.order_number', defaultMessage: 'order_number' }),
      dataIndex: 'order_number',
      hideInSearch: true,
    },
    {
      // title: FormattedMessage({ id: 'record.deal.user_id', defaultMessage: 'user_id' }),
      title: FormattedMessage({ id: 'record.deal.user_id', defaultMessage: 'user_id' }),
      dataIndex: 'user_id',
      // hideInSearch: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.deal.user_name', defaultMessage: 'user_name' }),
      dataIndex: 'user_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      // hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.deal.MerCode', defaultMessage: 'MerCode' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },

    {
      title: FormattedMessage({ id: 'record.deal.type', defaultMessage: 'type' }),
      dataIndex: 'type',
      valueType: 'select',
      request: async () => {
        return [
          {
            label: formatMessage({ id: 'dict.dealtype.4' }),
            value: 4,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.5' }),
            value: 5,
          },
        ];
      },
    },
    {
      title: FormattedMessage({ id: 'record.deal.amount', defaultMessage: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({
        id: 'record.deal.before_balance',
        defaultMessage: 'before_balance',
      }),
      dataIndex: 'before_balance',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'record.deal.balance', defaultMessage: 'balance' }),
      dataIndex: 'balance',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'record.deal.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'record.deal.mer_transfer_no',
        defaultMessage: 'mer_transfer_no',
      }),
      dataIndex: 'mer_transfer_no',
      hideInSearch: true,
    },
  ];

  useEffect(() => {
    formRef?.current?.resetFields?.();
  }, [show]);

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
      <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={setShow}
        formRef={formRef}
        visible={show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        title={
          isEdit ? FormattedMessage({ id: 'common.edit' }) : FormattedMessage({ id: 'pages.new' })
        }
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {
          if (isEdit) {
            await edit({ ...editData, ...values });
          } else {
            await create(values);
          }
          actionRef?.current?.reload();
          return true;
        }}
        columns={columns as any}
      />
    </PageHeaderWrapper>
  );
};
