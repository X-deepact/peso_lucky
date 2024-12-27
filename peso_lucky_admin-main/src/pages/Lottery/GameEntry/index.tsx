import FormattedMessage from '@/components/FormattedMessage';
import { getLiveSpecify } from './service';
import { PageHeaderWrapper, ProCard } from '@ant-design/pro-components';
import { Link, useModel, useRequest } from 'umi';
import { filter } from 'lodash';
import useModal from 'antd/lib/modal/useModal';

export default function GameEntry() {
  const { initialState } = useModel('@@initialState');
  const liveRooms = useRequest(() =>
    getLiveSpecify({ pageSize: 999999, current: 1, user_id: initialState?.currentUser?.userid }),
  );
  return (
    <PageHeaderWrapper>
      <ProCard>
        <div>
          <div>GameEntry</div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <ul>
              <li>
                <FormattedMessage id="game.controlEntry" />
              </li>
              {filter(liveRooms?.data, { hall_type: 1 })?.map((v) => (
                <Link key={v.game_code} to={`/lottery/colorgame?game_code=${v.game_code}`}>
                  <li>
                    <FormattedMessage id="game.goTo" />【{v.game_code}】
                  </li>
                </Link>
              ))}
            </ul>

            <ul>
              <li>
                <FormattedMessage id="game.sceneEntry" />
              </li>
              {filter(liveRooms?.data, { hall_type: 2 })?.map((v) => (
                <Link key={v.game_code} to={`/lottery/colorgameScene?game_code=${v.game_code}`}>
                  <li>
                    <FormattedMessage id="game.goTo" />【{v.game_code}】
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </div>
      </ProCard>
    </PageHeaderWrapper>
  );
}
