import React, { useRef, useEffect, useState } from 'react';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable, ProCard } from '@ant-design/pro-components';
import FormattedMessage from '@/components/FormattedMessage';
import dayjs from 'dayjs';
import { getReportList, getReportDetail } from '../service';
import { getToDayRange, useNewGetDateTime } from '@/utils/dateRange';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { keys } from 'lodash';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
// import './list.less';
import { useRequest, formatMessage } from 'umi';
import { Tag, Modal } from 'antd';
import Order from '@/pages/Record/Order';
import { currencySelectOption } from '@/utils/options';
import Detail from './detail';

const FlowEditer: React.FC = () => {
  const [show, setShow] = useState(false);
  const [record, setRecord] = useState<{ record: {} }>();
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'activity.time', defaultMessage: 'activity.time' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value: any) => {
          return {
            act_start_time: dayjs(value[0]).valueOf().toString(),
            act_end_time: dayjs(value[1]).valueOf().toString(),
          };
        },
      },
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
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
      title: FormattedMessage({ id: 'activity.actID', defaultMessage: '活动编号' }),
      dataIndex: 'seq',
    },
    {
      title: FormattedMessage({ id: 'activity.actFrequency', defaultMessage: '活动周期' }),
      dataIndex: 'act_frequency',
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        return [
          { label: FormattedMessage({ id: 'firstOrderCompensation.single' }), value: '1' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.day' }), value: '2' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.weekly' }), value: '3' },
          { label: FormattedMessage({ id: 'firstOrderCompensation.month' }), value: '4' },
        ];
      },
    },

    {
      title: FormattedMessage({ id: 'activity.joinNum', defaultMessage: '活动参与人数' }),
      dataIndex: 'achievement_num',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({ id: 'activity.newNum', defaultMessage: '活动新用户人数' }),
      dataIndex: 'join_num',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'activity.betAmount', defaultMessage: '首单投注总金额' }),
      dataIndex: 'first_bet_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.prizeAmount', defaultMessage: '包赔发放金额' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.avg', defaultMessage: '平均每用户赔付金额' }),
      dataIndex: 'avg_prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({ id: 'activity.receiveRate', defaultMessage: '领取率' }),
      dataIndex: 'prize_receive_rate',
      hideInSearch: true,
      renderText(text, record, index, action) {
        return  `${(record.prize_receive_rate*100).toLocaleString()}%`;
      },
    },
    {
      title: FormattedMessage({ id: 'activity.winLoss', defaultMessage: '首单输赢情况' }),
      dataIndex: 'first_bet_win_lose',
      hideInSearch: true,
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
          access="/firstOrderReport/report/detail"
          action={async () => {
            setShow(true);
            const dateTimeRange = searchFormRef?.current?.getFieldValue('dateTimeRange');
            setRecord({
              record: {
                'seq': _record.seq,
                'currency': _record.currency,
                'act_start_time': dateTimeRange ? dayjs(dateTimeRange?.[0]).startOf('day').valueOf() : '',
                'act_end_time': dateTimeRange ? dayjs(dateTimeRange?.[1]).endOf('day').valueOf() : '',
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
          const res = await getReportList(objValTrim(omitEmpty(params)));
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

export default FlowEditer;
