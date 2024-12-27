import type { ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';
import FormattedMessage from '@/components/FormattedMessage';
import { commissionQuery } from '../service';

interface DetailsItem {
  game_id: number;
}

export default (props: DetailsItem) => {
  const columns: ProColumns<DetailsItem>[] = [
    {
      dataIndex: 'seq',
      key: 'seq',
      title: <FormattedMessage id="record.lottery.seq" defaultMessage="游戏期号" />,
      align: 'center',
    },
    {
      dataIndex: 'bet_amount',
      key: 'bet_amount',
      title: <FormattedMessage id="win.betAmount" defaultMessage="投注金额" />,
      align: 'center',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      dataIndex: 'comm_amount',
      key: 'comm_amount',
      title: <FormattedMessage id="risk.comm_amount" defaultMessage="抽成金额" />,
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
        id: 'risk.checkAmountDetail',
        defaultMessage: '查看抽成明细',
      })}
      trigger={
        <Button type="link" key="details">
          <FormattedMessage id="risk.checkAmountDetail" />
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
          const res = await commissionQuery({ ...params, game_id: props.game_id });
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
