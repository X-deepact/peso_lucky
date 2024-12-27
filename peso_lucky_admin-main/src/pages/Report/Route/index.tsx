import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import { type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Modal } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query } from './service';
import ActionAnchor from '@/components/ActionAnchor';
import Detail from './comonents/detail';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { currencySelectOption } from '@/utils/options';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const searchFormRef = useRef<ProFormInstance>();
  const [show, setShow] = useState(false);
  const [record, setRecord] = useState<{ record: ListItem; dateTimeRange: any[] }>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="common.dateTimeRange" />,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      formItemProps: {
        rules: [{ required: true, message: FormattedMessage({ id: 'tip.dateRange' }) }],
      },
      search: {
        transform: (value: any) => {
          const start_at = moment(value[0]).valueOf();
          const end_at = moment(value[1]).endOf('day').valueOf();
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
      // title: FormattedMessage({ id: 'report.route.merchant_name', defaultMessage: 'merchant_name' }),
      title: FormattedMessage({ id: 'report.route.merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      title: FormattedMessage({ id: 'report.route.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      // hideInSearch: true,
      request: async () => {
        return currencySelectOption.filter((v) => v.value !== '');
      },
    },
    {
      title: FormattedMessage({ id: 'report.route.bet_users', defaultMessage: 'bet_users' }),
      dataIndex: 'bet_users',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'report.route.bet_count', defaultMessage: 'bet_count' }),
      dataIndex: 'bet_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'report.route.amount', defaultMessage: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'report.route.valid_bet', defaultMessage: 'valid_bet' }),
      dataIndex: 'valid_bet',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'report.route.prize_amount', defaultMessage: 'prize_amount' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({
        id: 'report.route.profit_amount',
        defaultMessage: 'profit_amount',
      }),
      dataIndex: 'profit_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      // 礼物金额
      title: FormattedMessage({ id: 'record.host.tip', defaultMessage: '小费' }),
      dataIndex: 'gift_price',
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
      title: FormattedMessage({ id: 'report.route.profit_rate', defaultMessage: 'profit_rate' }),
      dataIndex: 'profit_rate',
      hideInSearch: true,
      valueType: 'winLoseRate' as any,
    },
    {
      title: FormattedMessage({ id: 'common.activity.amount', defaultMessage: '活动支出金额' }),
      dataIndex: 'act_prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'common.daily.detail', defaultMessage: '每日明细' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, _record) => [
        <ActionAnchor
          key="edit"
          access="/report/route_detail"
          action={() => {
            const dateTimeRange = searchFormRef?.current?.getFieldValue('dateTimeRange');
            setRecord({
              record: {
                ..._record,
                start_at: moment(dateTimeRange?.[0]).startOf('day').valueOf(),
                end_at: moment(dateTimeRange?.[1]).endOf('day').valueOf(),
              },
            } as any);

            setShow(true);
          }}
        >
          {FormattedMessage({ id: 'common.daily.detail.view', defaultMessage: '查看明细' })}
        </ActionAnchor>,
      ],
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
      currency: 'PHP',
    });
    searchFormRef.current?.submit();
  }, []);

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
      <Modal
        visible={show}
        onCancel={() => {
          setShow(false);
        }}
        destroyOnClose
        title={FormattedMessage({ id: 'common.daily.detail', defaultMessage: '每日明细' })}
        width={'1200px'}
        footer={null}
      >
        {record && <Detail {...record} />}
      </Modal>
    </PageHeaderWrapper>
  );
};
