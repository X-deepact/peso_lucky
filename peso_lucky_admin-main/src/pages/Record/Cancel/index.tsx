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
      title: FormattedMessage({ id: 'record.cancel.seq', defaultMessage: '游戏期号' }),
      dataIndex: 'seq',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({ id: 'record.order.order_number', defaultMessage: '交易单号' }),
      dataIndex: 'order_id',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({ id: 'player.nickname', defaultMessage: '账号名称' }),
      dataIndex: 'username',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({ id: 'game.info.game_name', defaultMessage: '游戏名称' }),
      dataIndex: 'game_name',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({ id: 'chat.merchant_name', defaultMessage: '商户名称' }),
      dataIndex: 'merchant_name',
      hideInSearch: false,
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

    // 金额/100展示
    // prize_kind 派奖种类：0 - 未派奖，1 - 倍数，2 - 奖池；为0时“未收回奖池奖金”和“未收回倍数奖金"做"-"处理，为1时“未收回奖池奖金”做"-"处理，为2时“未收回倍数奖金”做"-"处理。
    {
      title: FormattedMessage({ id: 'report.game.amount', defaultMessage: '投注额' }),
      dataIndex: 'bet_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
    },
    {
      title: FormattedMessage({ id: 'record.order.prize_amount', defaultMessage: '派奖金额' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.recycle_win_amount',
        defaultMessage: '应回收奖金',
      }),
      dataIndex: 'recycle_win_amount',
      hideInSearch: true,
      renderText: (val: any) => (val / 100).toFixed(2),
    },

    // prize_kind 派奖种类：0 - 未派奖，1 - 倍数，2 - 奖池；为0时“未收回奖池奖金”和“未收回倍数奖金"做"-"处理，为1时“未收回奖池奖金”做"-"处理，为2时“未收回倍数奖金”做"-"处理。
    {
      title: FormattedMessage({
        id: 'secondSettlement.not_recycle_mult_amount',
        defaultMessage: '未收回倍数金额',
      }),
      dataIndex: 'not_recycle_mult_amount',
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
        id: 'secondSettlement.not_recycle_jackpot_amount',
        defaultMessage: '未收回奖池金额',
      }),
      dataIndex: 'not_recycle_jackpot_amount',
      hideInSearch: true,
      renderText: (val: any, record: any) => {
        if (!val && (record.prize_kind === 0 || record.prize_kind === 1)) {
          return '-';
        }
        return (val / 100).toFixed(2);
      },
    },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.seq2', defaultMessage: '未收回注水金额' }),
    //   dataIndex: 'seq',
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({ id: 'game.info.game_type', defaultMessage: 'game_type' }),
    //   dataIndex: 'game_type',
    //   valueType: 'select',
    //   async request() {
    //     const res = await getGameType({ game_category: 1 });
    //     return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
    //   },
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.order_cancel_total',
    //     defaultMessage: '撤单数量',
    //   }),
    //   dataIndex: 'order_cancel_total',
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.user_cancel_total',
    //     defaultMessage: '撤单用户',
    //   }),
    //   dataIndex: 'user_cancel_total',
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({ id: 'record.cancel.affect_lines', defaultMessage: '影响线路' }),
    //   dataIndex: 'affect_lines',
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.return_lose_amount',
    //     defaultMessage: '回退金额',
    //   }),
    //   dataIndex: 'return_lose_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.recycle_win_amount',
    //     defaultMessage: '应回收金额',
    //   }),
    //   dataIndex: 'recycle_win_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: (
    //     <FormattedMessage id="record.cancel.actual_recycle_amount" defaultMessage="收回金额" />
    //   ),
    //   dataIndex: 'actual_recycle_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: (
    //     <FormattedMessage id="record.cancel.not_recycle_amount" defaultMessage="未回收的金额" />
    //   ),
    //   dataIndex: 'not_recycle_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.cancel_id', defaultMessage: 'cancel_id' }),
    //   dataIndex: 'cancel_id',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.create_at', defaultMessage: '创建时间' }),
    //   dataIndex: 'create_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    // title: FormattedMessage({ id: 'record.cancel.operator', defaultMessage: '操作人' }),
    //   title: formatMessage({ id: 'record.cancel.operator' }),
    //   dataIndex: 'operator',
    //   formItemProps: {
    //     rules: [{ max: 50 }],
    //   },
    // },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.operation_method', defaultMessage: '操作方式' }),
    //   dataIndex: 'operation_method',
    //   valueType: 'select',
    //   request: async () => {
    //     return [
    //       {
    //         value: 1,
    //         label: intl.formatMessage({
    //           id: 'risk.type5',
    //           defaultMessage: '按期撤单',
    //         }),
    //       },
    //       {
    //         value: 2,
    //         label: intl.formatMessage({
    //           id: 'risk.type4',
    //           defaultMessage: '单注撤单',
    //         }),
    //       },
    //     ];
    //   },
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.game_type', defaultMessage: 'game_type' }),
    //   dataIndex: 'game_type',
    //   valueType: 'select',
    //   async request() {
    //     const res = await getGameType({ game_category: 1 });
    //     return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
    //   },
    //   hideInTable: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.jackpot_prize_amount',
    //     defaultMessage: '常规派彩金额',
    //   }),
    //   dataIndex: 'normal_prize_amount',
    //   valueType: 'okAmount' as any,
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.jackpot_recycle_amount',
    //     defaultMessage: '回收派彩金额',
    //   }),
    //   dataIndex: 'normal_recycle_amount',
    //   valueType: 'okAmount' as any,
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.normal_prize_amount',
    //     defaultMessage: '奖池派彩金额',
    //   }),
    //   dataIndex: 'jackpot_prize_amount',
    //   valueType: 'okAmount' as any,
    //   hideInSearch: true,
    // },

    // {
    //   title: FormattedMessage({
    //     id: 'record.cancel.normal_recycle_amount',
    //     defaultMessage: '回收奖池金额',
    //   }),
    //   dataIndex: 'jackpot_recycle_amount',
    //   valueType: 'okAmount' as any,
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.cancel.remark', defaultMessage: '备注' }),
    //   dataIndex: 'remark',
    //   hideInSearch: true,
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
        form={{ ignoreRules: false }}
        manualRequest={true}
        formRef={searchFormRef}
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
            data: res.data?.list ?? res.data,
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
