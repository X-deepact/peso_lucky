import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Modal, Space, Tabs, message } from 'antd';
import LineList from './components/LineList';
import ReceiveList from './components/ReceiveList';
import UsageList from './components/UsageList';
import { formatMessage } from 'umi';
import { ProCard } from '@ant-design/pro-components';

export default (props: any) => {
  return (
    <PageHeaderWrapper>
      <ProCard>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'activity.receiveList', defaultMessage: "道具领取明细记录" })} key="1">
            <ReceiveList {...props} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'activity.usageList', defaultMessage: "使用记录" })} key="2">
            <UsageList {...props} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'activity.lineList', defaultMessage: "线路数据" })} key="3">
            <LineList {...props} />
          </Tabs.TabPane>
        </Tabs>
      </ProCard>
    </PageHeaderWrapper>
  );
};
