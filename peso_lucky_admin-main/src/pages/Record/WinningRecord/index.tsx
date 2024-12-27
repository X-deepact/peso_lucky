import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { WinningQueryItem } from './data';
import { useEffect, useRef } from 'react';
import { type ActionType } from '@ant-design/pro-components';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { winningQuery } from './service';
import ActionAnchor from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import DetailsModal from './components/DetailsModal';
import { type ProFormInstance } from '@ant-design/pro-components';
export default () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<WinningQueryItem>[] = [
    {
      title: FormattedMessage({
        id: 'record.order.seq',
        defaultMessage: '游戏期号',
      }),
      dataIndex: 'seq',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({
        id: 'risk.jackpot_name',
        defaultMessage: '奖池名称',
      }),
      dataIndex: 'jackpot_name',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'game.info.game_name',
        defaultMessage: '游戏名称',
      }),
      dataIndex: 'game_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({
        id: 'record.lottery.game_type',
        defaultMessage: '游戏类型',
      }),
      dataIndex: 'game_type',
      valueType: 'select',
      request: async () => [
        { label: 'Color Game', value: 1 },
        { label: 'DROP BALL GAME', value: 2 },
      ],
    },
    {
      title: FormattedMessage({ id: 'win.recordResultTime', defaultMessage: '奖池开奖时间' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const start_time = moment(value[0]).valueOf();
          const end_time = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            start_time,
            end_time,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({
        id: 'win.recordResultTime',
        defaultMessage: '奖池开奖时间',
      }),
      dataIndex: 'draw_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({
        id: 'win.amount',
        defaultMessage: '奖池金额',
      }),
      dataIndex: 'amount',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'win.personNum',
        defaultMessage: '中奖人数',
      }),
      dataIndex: 'win_count',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'win.periodTime',
        defaultMessage: '奖期派彩时间',
      }),
      dataIndex: 'prize_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },

    {
      title: FormattedMessage({ id: 'pages.titleOption', defaultMessage: '操作' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      hideInSearch: true,
      render: (dom, record) => [
        // todo /record/winning_record_view  /api/v1/record/jackpot/winning/detail
        <ActionAnchor key="edit" access="/record/winningRecord_view">
          <DetailsModal data={record} />
        </ActionAnchor>,
      ],
    },
  ];
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
      <ProTable<WinningQueryItem, WinningQueryItem>
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
          const res = await winningQuery(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
    </PageHeaderWrapper>
  );
};
