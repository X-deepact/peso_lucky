import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button, DatePicker } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query } from './service';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { getGameType } from '@/pages/Game/Content/service';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const intl = useIntl();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'record.cancel.cancel_at', defaultMessage: '撤单时间' }),
      dataIndex: 'cancel_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'record.cancel.cancel_at', defaultMessage: '撤单时间' }),
      dataIndex: 'cancel_at',
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
      title: FormattedMessage({ id: 'record.cancel.seq', defaultMessage: '游戏期号' }),
      dataIndex: 'game_seq',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({ id: 'record.order.game_name', defaultMessage: '游戏名称' }),
      dataIndex: 'game_name',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.order_cancel_total',
        defaultMessage: '撤单数量',
      }),
      dataIndex: 'cancel_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.user_cancel_total',
        defaultMessage: '撤单用户',
      }),
      dataIndex: 'user_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.affect_lines',
        defaultMessage: '撤单影响线路',
      }),
      dataIndex: 'line_count',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({
        id: 'record.cancel.return_lose_amount',
        defaultMessage: '回退金额',
      }),
      dataIndex: 'refunded_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
      // valueType: 'dateTimeRange',
      // fieldProps: {
      //   ranges: useNewGetDateTime(),
      // },
      // search: {
      //   transform: (value: any) => {
      //     const start_at = moment(value[0]).valueOf();
      //     const end_at = moment(value[1]).milliseconds(999).valueOf() // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
      //     return {
      //       start_at,
      //       end_at,
      //     };
      //   },
      // },
      // hideInTable: true,
      // hideInForm: true,
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.recycle_win_amount',
        defaultMessage: '应回收金额',
      }),
      dataIndex: 'recoverable_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.actual_recycle_amount',
        defaultMessage: '收回金额',
      }),
      dataIndex: 'recovered_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
    },
    // prize_kind 派奖种类：0 - 未派奖，1 - 倍数，2 - 奖池；为0时“未收回奖池奖金”和“未收回倍数奖金"做"-"处理，为1时“未收回奖池奖金”做"-"处理，为2时“未收回倍数奖金”做"-"处理。
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_mult_amount',
        defaultMessage: '未收回倍数奖金',
      }),
      dataIndex: 'un_recovered_multi_amount',
      hideInSearch: true,
      renderText: (val: any, record: any) => {
        if (!val && (record.prize_kind === 0 || record.prize_kind === 2)) {
          return '-';
        }
        return (val / 100).toFixed(2);
      },
    },
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_mult_amount',
        defaultMessage: '未收回奖池奖金',
      }),
      dataIndex: 'un_recovered_jackpot_amount',
      hideInSearch: true,
      renderText: (val: any, record: any) => {
        if (!val && (record.prize_kind === 0 || record.prize_kind === 1)) {
          return '-';
        }
        return (val / 100).toFixed(2);
      },
    },
    {
      title: FormattedMessage({ id: 'record.lottery.operator', defaultMessage: '操作员' }),
      dataIndex: 'operator',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.cancel.operation_method', defaultMessage: '操作方式' }),
      dataIndex: 'operation_type',
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'record.cancel.batch_file', defaultMessage: '批量处理' }),
            value: 1,
          },
        ];
      },
    },
    // 金额/100展示
    // prize_kind 派奖种类：0 - 未派奖，1 - 倍数，2 - 奖池；为0时“未收回奖池奖金”和“未收回倍数奖金"做"-"处理，为1时“未收回奖池奖金”做"-"处理，为2时“未收回倍数奖金”做"-"处理。
    // {
    //   title: FormattedMessage({ id: 'record.cancel.bet_amount', defaultMessage: '投注额' }),
    //   dataIndex: 'bet_amount',
    //   hideInSearch: true,
    //   renderText: (val: any) => (val / 100).toFixed(2),
    // },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.prize_amount', defaultMessage: '派奖额' }),
    //   dataIndex: 'prize_amount',
    //   hideInSearch: true,
    //   renderText: (val: any) => (val / 100).toFixed(2),
    // },
  ];

  useEffect(() => {
    formRef?.current?.resetFields?.();
  }, [show]);

  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      cancel_at: dateOptions[5].value,
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
            // 过渡数据兼容
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
          span: 13,
        }}
        // title={
        //   isEdit ? FormattedMessage({ id: 'common.edit' }) : FormattedMessage({ id: 'pages.new' })
        // }
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        // onFinish={async (values) => {
        //   if (isEdit) {
        //     await edit({ ...editData, ...values });
        //   } else {
        //     await create(values);
        //   }
        //   actionRef?.current?.reload();
        //   return true;
        // }}
        columns={columns as any}
      />
    </PageHeaderWrapper>
  );
};
