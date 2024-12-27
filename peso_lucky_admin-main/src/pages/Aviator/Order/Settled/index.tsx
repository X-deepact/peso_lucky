import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Modal, Space, Tabs, message } from 'antd';
import UnsettleTabItem from './components/UnsettleTabItem';
import SettleTabItem from './components/SettleTabItem';
import { formatMessage } from 'umi';
import { ProCard } from '@ant-design/pro-components';
import useUrlState from '@ahooksjs/use-url-state';

export default (props: any) => {
  const [state, setState] = useUrlState({ tab: 'unsettle', seq: '' });

  return (
    <PageHeaderWrapper>
      <ProCard>
        <Tabs
          defaultActiveKey="unsettle"
          activeKey={state.tab}
          destroyInactiveTabPane
          onChange={(v) => {
            setState({ tab: v });
          }}
        >
          <Tabs.TabPane tab={formatMessage({ id: 'dict.order_status.1' })} key="unsettle">
            <UnsettleTabItem {...props} seq={state.seq} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={formatMessage({ id: 'dict.order_status.2' })} key="settle">
            <SettleTabItem {...props} seq={state.seq} />
          </Tabs.TabPane>
        </Tabs>
      </ProCard>
    </PageHeaderWrapper>
  );
};
