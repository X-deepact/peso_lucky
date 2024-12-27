import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne } from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { getGameType } from '@/pages/Game/Content/service';
import dayjs from 'dayjs';
import { getToDayRange, useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { divide, multiply } from 'mathjs';
import { currencySelectOption } from '@/utils/options';

export default () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'gift.time', defaultMessage: '时间' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          return {
            start_at: dayjs(value[0]).valueOf(),
            end_at: dayjs(value[1]).valueOf(),
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({ id: 'report.game.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      valueType: 'select',
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: FormattedMessage({ id: 'report.game.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'game_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // 币种
    {
      title: FormattedMessage({ id: 'report.game.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
      fieldProps: {
        defaultValue: 'PHP',
      },
    },
    {
      title: FormattedMessage({ id: 'report.game.amount', defaultMessage: 'amount' }),
      dataIndex: 'amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="report.game.bet_content_profitable_color"
    //       defaultMessage="bet_content_profitable_color"
    //     />
    //   ),
    //   dataIndex: 'bet_content_profitable_color',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'report.game.valid_bet', defaultMessage: 'valid_bet' }),
      dataIndex: 'valid_bet',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    {
      title: FormattedMessage({ id: 'report.game.bet_count', defaultMessage: 'bet_count' }),
      dataIndex: 'bet_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'report.game.bet_users', defaultMessage: 'bet_users' }),
      dataIndex: 'bet_users',
      hideInSearch: true,
    },
    {
      // 礼物金额
      title: FormattedMessage({ id: 'record.host.tip', defaultMessage: '小费' }),
      dataIndex: 'gift_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'report.game.prize_amount', defaultMessage: 'prize_amount' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // 游戏局数
    {
      title: FormattedMessage({ id: 'report.round.game_num', defaultMessage: '游戏局数' }),
      dataIndex: 'round_num',
      hideInSearch: true,
    },
    // 平均每局投注金额
    {
      title: FormattedMessage({
        id: 'report.round.game_av_amount',
        defaultMessage: '平均每局投注金额',
      }),
      dataIndex: 'round_av_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // 均场投注人数
    {
      title: FormattedMessage({
        id: 'report.round.game_bet_users',
        defaultMessage: '均场投注人数',
      }),
      dataIndex: 'round_av_bet_users',
      hideInSearch: true,
    },
    // 均场投注笔数
    {
      title: FormattedMessage({
        id: 'report.round.game_bet_count',
        defaultMessage: '均场投注笔数',
      }),
      dataIndex: 'round_av_bet_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'record.total_reg_users',
        defaultMessage: '注册人数',
      }),
      dataIndex: 'total_reg_users',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'info.conversion_rate',
        defaultMessage: '转换率',
      }),
      dataIndex: 'total_bet_users',
      hideInSearch: true,
      renderText(text, record, index, action) {
        // return multiply(divide(+text, +record.total_reg_users || 1), 100) + '%';
        return multiply(divide(+text, +record.total_reg_users || 1), 100).toFixed(2) + '%';
      },
    },
    {
      title: FormattedMessage({ id: 'common.activity.amount', defaultMessage: '活动支出金额' }),
      dataIndex: 'act_prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'report.game.profit_amount', defaultMessage: 'profit_amount' }),
      dataIndex: 'profit_amount',
      hideInSearch: true,
      valueType: 'winLoseAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'report.game.profit_rate', defaultMessage: 'profit_rate' }),
      dataIndex: 'profit_rate',
      hideInSearch: true,
      valueType: 'winLoseRate' as any,
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
        // toolBarRender={() => [
        //   <ActionBtn
        //     access="can__Insert"
        //     type="primary"
        //     onClick={() => {
        //       setShow(true);
        //       setIsEdit(false);
        //     }}
        //     key="add"
        //   >
        //     <FormattedMessage id="pages.new" />
        //   </ActionBtn>,
        // ]}
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
