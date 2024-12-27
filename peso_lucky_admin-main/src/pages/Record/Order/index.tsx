import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Modal, Space, Tabs, message } from 'antd';
import UnsettleTabItem from './components/UnsettleTabItem';
import SettleTabItem from './components/SettleTabItem';
import { formatMessage } from 'umi';
import { ProCard } from '@ant-design/pro-components';

export default (props: any) => {
  return (
    <PageHeaderWrapper>
      <ProCard>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'dict.order_status.1' })} key="1">
            <UnsettleTabItem {...props} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'dict.order_status.2' })} key="2">
            <SettleTabItem {...props} />
          </Tabs.TabPane>
        </Tabs>
      </ProCard>
    </PageHeaderWrapper>
  );
};
