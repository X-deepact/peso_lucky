import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ProCard,
} from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import { Button } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne, transSum } from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { useNewGetDateTime, getToDayRange } from '@/utils/dateRange';
import { currencySelectOption } from '@/utils/options';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const searchFormRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'record.deal.created_at', defaultMessage: 'created_at' }),
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
      title: FormattedMessage({ id: 'record.deal.created_at', defaultMessage: 'created_at' }),
      dataIndex: 'created_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'record.deal.order_number', defaultMessage: 'order_number' }),
      dataIndex: 'order_number',
      // hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.deal.user_id', defaultMessage: 'user_id' }),
      dataIndex: 'user_id',
      // hideInSearch: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.deal.mer_user_name', defaultMessage: '三方用户名' }),
      dataIndex: 'user_name',
      // hideInSearch: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.deal.MerCode', defaultMessage: 'mer_code' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    // 交易类型
    {
      title: FormattedMessage({ id: 'record.deal.type', defaultMessage: 'type' }),
      dataIndex: 'type',
      valueType: 'select',
      request: async () => {
        return [
          {
            label: formatMessage({ id: 'dict.dealtype.1' }),
            value: 1,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.2' }),
            value: 2,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.3' }),
            value: 3,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.4' }),
            value: 4,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.5' }),
            value: 5,
          },
          {
            label: formatMessage({ id: 'record.host.tip', defaultMessage: '小费' }),
            value: 6,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.7', defaultMessage: '二次结算' }),
            value: 7,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.8', defaultMessage: '奖励发放' }),
            value: 8,
          },
          {
            label: formatMessage({ id: 'dict.dealtype.9', defaultMessage: '取消' }),
            value: 9,
          },
        ];
      },
    },

    {
      title: FormattedMessage({ id: 'record.deal.amount', defaultMessage: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
      sorter: true,
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
    {
      title: FormattedMessage({ id: 'record.deal.remark', defaultMessage: 'remark' }),
      dataIndex: 'remark',
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
      dateTimeRange: getToDayRange(),
    });
    searchFormRef.current?.submit();
  }, []);

  const transSumData = useRequest(transSum, {
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
  console.log('transSumData', transSumData);

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        formRef={searchFormRef}
        manualRequest={true}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        tableExtraRender={() => {
          return [
            <ProCard>
              <ProDescriptions loading={transSumData.loading}>
                <ProDescriptions.Item
                  copyable
                  label={FormattedMessage({ id: 'record.total_transaction_ amount' })}
                >
                  {formatAmout(transSumData?.data?.amount)}
                </ProDescriptions.Item>
              </ProDescriptions>
            </ProCard>,
          ];
        }}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params, sort) => {
          const queryData = objValTrim(omitEmpty({ ...params } as any));
          if (sort.amount) {
            queryData.order_by_amount = sort.amount === 'ascend' ? 'asc' : 'desc';
          }
          transSumData.run(queryData);
          const res = await query(queryData);
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
          return true;
        }}
        columns={columns as any}
      />
    </PageHeaderWrapper>
  );
};
