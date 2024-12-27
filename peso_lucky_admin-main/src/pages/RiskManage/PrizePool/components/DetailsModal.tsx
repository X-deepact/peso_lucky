import type { ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';
import FormattedMessage from '@/components/FormattedMessage';
import { transQuery } from '../service';

interface DetailsItem {
  game_id: number;
}

export default (props: DetailsItem) => {
  const amountType = [
    {
      label: FormattedMessage({
        id: 'risk.type1',
        defaultMessage: '注入',
      }),
      value: 1,
    },
    {
      label: FormattedMessage({
        id: 'risk.type2',
        defaultMessage: '奖池派奖',
      }),
      value: 2,
    },
    {
      label: FormattedMessage({
        id: 'risk.type3',
        defaultMessage: '恢复池底',
      }),
      value: 3,
    },
    {
      label: FormattedMessage({
        id: 'risk.type4',
        defaultMessage: '单注撤单',
      }),
      value: 4,
    },
    {
      label: FormattedMessage({
        id: 'risk.type5',
        defaultMessage: '整期撤单',
      }),
      value: 5,
    },
  ];
  const columns: ProColumns<DetailsItem>[] = [
    {
      dataIndex: 'seq',
      key: 'seq',
      title: <FormattedMessage id="record.lottery.seq" defaultMessage="游戏期号" />,
      align: 'center',
    },
    {
      dataIndex: 'start_time',
      key: 'start_time',
      title: <FormattedMessage id="risk.startTime" defaultMessage="奖期开始时间" />,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      dataIndex: 'created_at',
      key: 'created_at',
      title: <FormattedMessage id="trAdd.changeTime" defaultMessage="账变时间" />,
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      dataIndex: 'jackpot_name',
      key: 'jackpot_name',
      title: <FormattedMessage id="risk.periodName" defaultMessage="奖池名称" />,
      align: 'center',
    },
    {
      dataIndex: 'trans_type',
      key: 'trans_type',
      title: <FormattedMessage id="risk.periodType" defaultMessage="账变类型" />,
      align: 'center',
      valueType: 'select',
      fieldProps: {
        options: amountType,
      },
    },

    {
      dataIndex: 'amount_before',
      key: 'amount_before',
      title: <FormattedMessage id="risk.beforeAmount" defaultMessage="变更前奖池余额" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'amount_change',
      key: 'amount_change',
      title: <FormattedMessage id="risk.changeAmount" defaultMessage="变更奖池余额" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'amount_after',
      key: 'amount_after',
      title: <FormattedMessage id="risk.afterAmount" defaultMessage="变更后奖池余额" />,
      align: 'center',
      hideInSearch: true,
    },
  ];
  return (
    <ModalForm
      labelCol={{ span: 6 }}
      layout="horizontal"
      width={'80%'}
      style={{ height: '600px', overflowY: 'auto' }}
      title={FormattedMessage({
        id: 'risk.checkPoolDetail',
        defaultMessage: '查看奖池明细',
      })}
      trigger={
        <Button type="link" key="details">
          <FormattedMessage id="risk.checkPoolDetail" />
        </Button>
      }
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async () => {
        return true;
      }}
    >
      <ProTable<DetailsItem>
        columns={columns}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        request={async (params: any) => {
          const res = await transQuery({ ...params, game_id: props.game_id });
          return {
            total: res.total,
            data: res.data,
          };
        }}
        rowKey={'id'}
        toolBarRender={false}
      />
    </ModalForm>
  );
};
