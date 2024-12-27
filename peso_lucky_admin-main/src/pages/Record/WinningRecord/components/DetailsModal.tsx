import type { ProColumns } from '@ant-design/pro-components';
import { ModalForm, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useState } from 'react';
import FormattedMessage from '@/components/FormattedMessage';
import { detailQuery } from '../service';

interface DetailsItem {}

export default ({ data }: any) => {
  const columns: ProColumns<DetailsItem>[] = [
    {
      dataIndex: 'seq',
      key: 'seq',
      title: <FormattedMessage id="record.order.index" defaultMessage="序号" />,
      align: 'center',
      hideInSearch: true,
      render: (_, record, index) => <span>{index + 1}</span>,
    },
    {
      dataIndex: 'user_id',
      key: 'user_id',
      title: <FormattedMessage id="record.deal.user_id" defaultMessage="用户ID" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'nickname',
      key: 'nickname',
      title: <FormattedMessage id="win.userName" defaultMessage="用户名称" />,
      align: 'center',
    },
    {
      dataIndex: 'merchant_name',
      key: 'merchant_name',
      title: <FormattedMessage id="win.belongLine" defaultMessage="归属线路" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'seq',
      key: 'seq',
      title: <FormattedMessage id="record.order.seq" defaultMessage="游戏期号" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'game_type',
      key: 'game_type',
      title: <FormattedMessage id="game.info.game_type" defaultMessage="游戏类型" />,
      align: 'center',
      hideInSearch: true,
      valueType: 'select',
      request: async () => [
        { label: 'Color Game', value: 1 },
        { label: 'DROP BALL GAME', value: 2 },
      ],
    },
    {
      dataIndex: 'game_name',
      key: 'game_name',
      title: <FormattedMessage id="game.info.game_name" defaultMessage="游戏名称" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'jackpot_name',
      key: 'jackpot_name',
      title: <FormattedMessage id="risk.jackpot_name" defaultMessage="奖池名称" />,
      align: 'center',
      hideInSearch: true,
    },
    {
      dataIndex: 'bet_amount',
      key: 'bet_amount',
      title: <FormattedMessage id="win.betAmount" defaultMessage="投注金额" />,
      align: 'center',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // {
    //   dataIndex: 'alloc_ratio',
    //   key: 'alloc_ratio',
    //   title: <FormattedMessage id="win.prop" defaultMessage="分配比例" />,
    //   align: 'center',
    //   hideInSearch: true,
    // },
    {
      dataIndex: 'award_amount',
      key: 'award_amount',
      title: <FormattedMessage id="win.winAmount" defaultMessage="中奖金额" />,
      align: 'center',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
  ];
  return (
    <ModalForm
      labelCol={{ span: 6 }}
      layout="horizontal"
      width={'80%'}
      style={{ height: '600px', overflowY: 'auto' }}
      title={FormattedMessage({
        id: 'common.daily.detail.view',
        defaultMessage: '查看明细',
      })}
      trigger={
        <Button type="link" key="details">
          <FormattedMessage id="common.daily.detail.view" />
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
        request={async (params: any) => {
          const res = await detailQuery({ ...params, ...data });
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
