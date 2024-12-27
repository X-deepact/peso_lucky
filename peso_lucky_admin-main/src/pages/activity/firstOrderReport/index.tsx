import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Modal, Space, Tabs, message } from 'antd';
import OrderList from './components/OrderList';
import ReportList from './components/ReportList';
import { formatMessage } from 'umi';
import { ProCard } from '@ant-design/pro-components';

export default (props: any) => {
  return (
    <PageHeaderWrapper>
      <ProCard>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'menu.activity.order', defaultMessage: '首单包赔领取明细记录' })} key="1">
            <OrderList {...props} />
          </Tabs.TabPane>
          <Tabs.TabPane  tab={formatMessage({ id: 'menu.activity.report', defaultMessage: '活动报表' })} key="2">
            <ReportList {...props} />
          </Tabs.TabPane>
        </Tabs>
      </ProCard>
    </PageHeaderWrapper>
  );
};
