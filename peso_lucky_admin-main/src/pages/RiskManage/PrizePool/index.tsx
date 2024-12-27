import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { WinningListItem } from './data';
import { useRef } from 'react';
import { type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { monitorQuery } from './service';
import ActionAnchor from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import DetailsModal from './components/DetailsModal';
import DetailsPoolModal from './components/DetailsPoolModal';
import { useModel, useRequest } from 'umi';
import { getLiveSpecify } from '@/pages/Lottery/GameEntry/service';

const prizeList = [
  {
    name: 'Minor',
    index: 0,
  },
  {
    name: 'Major',
    index: 1,
  },
  {
    name: 'Grand',
    index: 2,
  },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const searchFormRef = useRef<ProFormInstance>();
  const liveRooms = useRequest(() =>
    getLiveSpecify({ pageSize: 999999, current: 1, user_id: initialState?.currentUser?.userid }),
  );

  const columns: ProColumns<WinningListItem>[] = [
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
    // {
    //   title: FormattedMessage({
    //     id: 'record.lottery.game_type',
    //     defaultMessage: '游戏类型',
    //   }),
    //   dataIndex: 'game_code_type',
    // },
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
    // {
    //   title: FormattedMessage({ id: 'risk.lottery.open_time', defaultMessage: '查询时间' }),
    //   dataIndex: 'dateTimeRange',
    //   valueType: 'dateTimeRange',
    //   fieldProps: {
    //     ranges: useNewGetDateTime(),
    //   },
    //   search: {
    //     transform: (value: any) => {
    //       const created_start_at = moment(value[0]).valueOf();
    //       const created_end_at = moment(value[1]).milliseconds(999).valueOf() // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
    //       return {
    //         created_start_at,
    //         created_end_at,
    //       };
    //     },
    //   },
    //   hideInTable: true,
    //   hideInForm: true,
    // },
    {
      title: FormattedMessage({
        id: 'risk.comm_ratio',
        defaultMessage: '抽成比例',
      }),
      dataIndex: 'mer_comm_ratio',
      hideInSearch: true,
      render: (_, record) => {
        return `${record.mer_comm_ratio / 10000}%`;
      },
    },
    {
      title: FormattedMessage({
        id: 'risk.comul_comm_amount',
        defaultMessage: '累计抽成金额',
      }),
      dataIndex: 'cumul_amount',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'risk.current_amount',
        defaultMessage: '剩余抽成金额',
      }),
      dataIndex: 'rem_amount',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'risk.rem_comm_amount',
        defaultMessage: '当前奖池金额',
      }),
      dataIndex: 'amount',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <div>
            {prizeList.map(({ name, index }, idx) => {
              if (record.amount && record.amount[index] !== undefined) {
                return (
                  <p key={Math.random()}>
                    {name}：{record.amount[index]}
                  </p>
                );
              }
            })}
            {/* <p>minor: {record.amount[0]}</p>
            <p>major: {record.amount[1]}</p>
            <p>grand: {record.amount[2]}</p> */}
          </div>
        );
      },
    },
    {
      title: FormattedMessage({
        id: 'risk.win_count',
        defaultMessage: '中奖次数',
      }),
      dataIndex: 'win_count',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({ id: 'risk.totalDetail', defaultMessage: '累计明细' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      hideInSearch: true,
      render: (dom, record) => {
        if (!liveRooms.data) return null;
        return [
          <ActionAnchor key="detail" access="/riskManage/prizePool_view_jackpot">
            <DetailsModal game_id={record.game_id} />
          </ActionAnchor>,
          <ActionAnchor key="edit" access="/riskManage/prizePool_view_drawdown">
            <DetailsPoolModal game_id={record.game_id} />
          </ActionAnchor>,
        ];
      },
    },
  ];

  // // 初始化参数
  // useEffect(() => {
  //   // 默认查询今天的数据, 需要手动设置，默认值不生效
  //   searchFormRef.current?.setFieldsValue({
  //     dateTimeRange: dateOptions[5].value,
  //   });
  //   searchFormRef.current?.submit();
  // }, []);

  return (
    <PageHeaderWrapper>
      <ProTable<WinningListItem, WinningListItem>
        actionRef={actionRef}
        // manualRequest={true}
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
          const res = await monitorQuery(objValTrim(omitEmpty(params)));
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
