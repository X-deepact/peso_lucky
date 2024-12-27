import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import FormattedMessage from '@/components/FormattedMessage';
import { Tabs, Card, Spin } from 'antd';
import type { TabsProps } from 'antd';
import TableItem from './components/tableItem';
import { query } from '@/pages/Game/Info/service';
import { useRequest } from 'umi';
import type { GameItem } from './data';

export default () => {
  const { data, loading } = useRequest(() => query({ pageSize: 10000, current: 1 } as any));

  const gameItems: TabsProps['items'] = data?.map((v: GameItem) => {
    return {
      key: v.id.toString(),
      label: v.game_name,
      children: <TableItem game_id={v.id} game_type={v.game_type} />,
    };
  });

  return (
    <PageHeaderWrapper>
      <Spin spinning={loading}>
        <Card>
          {gameItems && gameItems.length > 0 && (
            <Tabs defaultActiveKey={gameItems[0].key} items={gameItems} />
          )}
        </Card>
      </Spin>
    </PageHeaderWrapper>
  );
};
