/* eslint-disable react/no-array-index-key */
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Input, Modal, Select, Spin, Tag, message, Statistic, Typography } from 'antd';
import { formatMessage, useRequest } from 'umi';
import type { GameDetail } from './service';
import {
  firstAward,
  queryDetail,
  secondAward,
  startGame,
  jackpotOptions,
  changeGameStatus,
} from './service';
import { ProCard } from '@ant-design/pro-components';
import { Card, Row, Col, Button } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { colorGameColors, isCanSecond } from '@/utils/color';
import FormattedMessage from '@/components/FormattedMessage';
import qs from 'qs';
import { find, padEnd, set } from 'lodash';
import './index.css';
import GameBetItem from './components/gameBetItem';
import modal from 'antd/lib/modal';

export default () => {
  const game_code = qs.parse(location.search, { ignoreQueryPrefix: true })
    .game_code as any as string;
  const { data: { list: gameDetail = {} as GameDetail } = {}, mutate } = useRequest(
    () => queryDetail({ game_code }),
    {
      pollingInterval: 500,
      refreshOnWindowFocus: true,
    },
  );
  const startGameData = useRequest(() => startGame({ seq: gameDetail?.seq ?? '', game_code }), {
    manual: true,
    ready: !!gameDetail?.seq,
  });
  const firstAwardData = useRequest(firstAward, {
    manual: true,
    ready: !!gameDetail?.seq,
  });
  const secondAwardData = useRequest(secondAward, {
    manual: true,
    ready: !!gameDetail?.seq,
  });
  const changeGameStatusData = useRequest(changeGameStatus, {
    manual: true,
    ready: !!gameDetail?.seq,
  });

  const [color, setColor] = useState<string[]>([]);
  const [color_SG, setColor_SG] = useState<string>('');
  const [color_JP, setColor_JP] = useState<string>('');
  const [visible_SG, setVisible_SG] = useState<boolean>(false);
  const [visible_JP, setVisible_JP] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  // 已经弹出过二次开奖的
  const toastSecondDrawEnterIds = useRef<string[]>([]);
  const { Paragraph } = Typography;

  const isFirstDraw = (gameDetail?.live_status ?? 0) < 30 && (gameDetail?.live_status ?? 0) != 0;
  const isSg = gameDetail?.game_code_type === 'SG';
  const isJp = gameDetail?.game_code_type === 'JP';

  const render = () => {
    if (gameDetail?.live_status == 0 || gameDetail?.live_status == 30) return;
    if (gameDetail?.live_status < 30) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            background: '#f2f3f3',
            padding: '20px',
            borderRadius: '8px',
            // justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              justifyContent: 'space-between',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            {colorGameColors.map((item, index: number) => {
              return (
                <GameBetItem
                  val={index + 1}
                  key={index}
                  onClick={() => {
                    if (color.length >= 3) return;
                    setColor((arr) => [...arr, (index + 1).toString()]);
                  }}
                  game_type={gameDetail?.game_type}
                />
              );
              return (
                <div
                  key={index}
                  style={{
                    width: 100,
                    height: 80,
                    marginBottom: 10,
                    backgroundColor: item,
                    border: '1px solid rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  // 键盘事件
                  data-key={index + 1}
                  onClick={() => {
                    if (color.length >= 3) return;
                    setColor((arr) => [...arr, (index + 1).toString()]);
                  }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>

          <Button
            type="primary"
            style={{ width: '100px', height: '60px', marginLeft: '40px' }}
            data-key=".,。,Backspace,Escape,Delete"
            onClick={() => setColor([])}
          >
            <FormattedMessage id="colorLottery.clear" /> (.)
          </Button>
        </div>
      );
    }
    if (isSg) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            background: '#f2f3f3',
            padding: '20px',
            borderRadius: '8px',
            // justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              justifyContent: 'space-between',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            {colorGameColors.map((item, index: number) => {
              return (
                <GameBetItem
                  val={index + 1}
                  key={index}
                  onClick={() => {
                    if (color.length >= 3) return;
                    setColor_SG((index + 1).toString());
                  }}
                  game_type={gameDetail?.game_type}
                />
              );
              return (
                <div
                  key={index}
                  style={{
                    width: 100,
                    height: 80,
                    marginBottom: 10,
                    backgroundColor: item,
                    border: '1px solid rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  data-key={index + 1}
                  onClick={() => {
                    console.log(color_SG, color_JP);
                    // if (!!color_SG) return;
                    setColor_SG((index + 1).toString());
                  }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
          <Button
            type="primary"
            style={{ width: '100px', height: '60px', marginLeft: '40px' }}
            data-key=".,。,Backspace,Escape,Delete"
            onClick={() => setColor_SG('')}
          >
            <FormattedMessage id="colorLottery.clear" /> (.)
          </Button>
        </div>
      );
    }
    if (isJp) {
      return (
        <div
          style={{
            display: 'flex',
            gap: '20px',
            background: '#f2f3f3',
            padding: '20px',
            borderRadius: '8px',
            // justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              justifyContent: 'space-between',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
            }}
          >
            {jackpotOptions.map((item, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: 210,
                    height: 90,
                    marginBottom: 10,
                    border: '1px solid rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => {
                    setColor_JP(item.value);
                  }}
                  data-key={index + 1}
                >
                  {item.label} ({index + 1})
                </div>
              );
            })}
          </div>

          <Button
            type="primary"
            style={{ width: '100px', height: '60px', marginLeft: '40px' }}
            data-key=".,。,Backspace,Escape,Delete"
            onClick={() => setColor_JP('')}
          >
            <FormattedMessage id="colorLottery.clear" /> (.)
          </Button>
        </div>
      );
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.key, 'e.key');
      // 获取所有元素
      const elements = document.querySelectorAll('[data-key]');
      // 遍历元素
      elements.forEach((element) => {
        // 获取 data-key 属性的值，并分割成数组
        const keys = (element.getAttribute('data-key') || '').split(',');
        // 如果数组包含按下的键，则触发点击事件
        if (keys.includes(e.key)) {
          (element as HTMLElement)?.click?.();
        }
      });
    };
    document.body.classList.add('hidden-sider');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('hidden-sider');
    };
  }, []);
  // 进入二次开奖弹窗
  useEffect(() => {
    if (
      (!!gameDetail?.seq && toastSecondDrawEnterIds.current.includes(gameDetail?.seq)) ||
      (gameDetail?.first_two_second || 0) <= 0
    ) {
      return;
    }
    toastSecondDrawEnterIds.current.push(gameDetail?.seq || '');
    let first_two_second = gameDetail?.first_two_second as number;
    const instance = modal.success({
      // title: 'This is a notification message',
      content: `${formatMessage({ id: 'common.enter.secondDraw' })} ${first_two_second}s`,
    });

    const timer = setInterval(() => {
      if (first_two_second <= 0) {
        clearInterval(timer);
        return instance.destroy();
      }
      first_two_second -= 1;
      instance.update({
        content: `${formatMessage({ id: 'common.enter.secondDraw' })} ${first_two_second}s`,
      });
    }, 1000);
  }, [gameDetail]);
  // console.log(gameDetail.first_two_second);
  // if (gameDetail.first_two_second) {
  //   alert('first_two_second');
  // }
  // if (gameDetail.game_end_second) {
  //   alert('game_end_second');
  // }
  const tips = gameDetail?.game_end_second
    ? `${formatMessage({ id: 'common.enter.prizesing' })} ${gameDetail?.game_end_second}s`
    : 'Loading...';
  // 判断 三个字段是不是一样
  return (
    <PageHeaderWrapper>
      <h1>power by @niko </h1>
      <Spin
        spinning={
          !Object.keys(gameDetail || {})?.length ||
          secondAwardData.loading ||
          firstAwardData.loading ||
          startGameData.loading ||
          changeGameStatusData.loading ||
          !!gameDetail.first_two_second ||
          !!gameDetail.game_end_second
        }
        tip={
          <h1
            style={{
              padding: '10px',
              width: '400px',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%)',
              fontWeight: 'bold',
              fontSize: '28px',
            }}
          >
            {tips}
          </h1>

          // gameDetail?.first_two_second
          //   ? `${formatMessage({ id: 'common.enter.secondDraw' })} ${gameDetail?.first_two_second}s`
          //   : gameDetail?.game_end_second
          //   ? `${formatMessage({ id: 'common.enter.prizesing' })} ${gameDetail?.first_two_second}s`
          //   : 'Loading...'
        }
      >
        <ProCard>
          <div style={{ display: 'flex', gap: '20px', lineHeight: '40px' }}>
            <Paragraph copyable={{ text: gameDetail?.seq }}>
              {FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' })}：
              {gameDetail?.seq}
            </Paragraph>
            <Paragraph copyable={{ text: gameDetail?.game_name }}>
              {FormattedMessage({ id: 'record.order.game_name', defaultMessage: '游戏名称' })}：
              {gameDetail?.game_name}
            </Paragraph>
            <Paragraph copyable={{ text: gameDetail?.game_code }}>
              {FormattedMessage({ id: 'colorLottery.gameSeq', defaultMessage: '游戏编号' })}：
              {gameDetail?.game_code}
            </Paragraph>
            {/* <span>
              <FormattedMessage id="game.info.status" />:{gameStatus[gameDetail?.status || 0]}
            </span> */}

            <Button
              style={{
                width: '80px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              disabled={gameDetail?.game_status === 1}
              onClick={async () => {
                await changeGameStatusData.run({
                  game_code: gameDetail.game_code,
                  game_status: 1,
                });
              }}
            >
              <FormattedMessage id="common.open" />
            </Button>
            <Button
              style={{
                width: '80px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              disabled={gameDetail?.game_status === 2}
              onClick={async () => {
                await changeGameStatusData.run({
                  game_code: gameDetail.game_code,
                  game_status: 2,
                });
              }}
            >
              <FormattedMessage id="common.close" />
            </Button>
            <Button
              style={{
                width: '80px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              disabled={gameDetail?.game_status === 3}
              onClick={async () => {
                await changeGameStatusData.run({
                  game_code: gameDetail.game_code,
                  game_status: 3,
                });
              }}
            >
              <FormattedMessage id="common.maintain" />
            </Button>

            <h1>
              {gameDetail.live_status == 10
                ? formatMessage({ id: 'common.first_draw_time' }) +
                  gameDetail.first_bet_time_rem +
                  formatMessage({ id: 'common.second' })
                : gameDetail.live_status == 90
                ? formatMessage({ id: 'common.second_draw_time' }) +
                  gameDetail.second_bet_time_rem +
                  formatMessage({ id: 'common.second' })
                : gameDetail.live_status == 31 || gameDetail.live_status == 100
                ? formatMessage({ id: 'common.in_second_draw' })
                : gameDetail.live_status == 0
                ? formatMessage({ id: 'common.wait_next_game' })
                : formatMessage({ id: 'common.in_game_ing' })}
            </h1>
          </div>

          <div style={{ height: '40px' }} />
          <div
            style={{
              display: 'flex',
              gap: '80px',
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormattedMessage id="common.first_draw" />
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  background: '#f2f3f3',
                  padding: '20px',
                  borderRadius: '8px',
                  minHeight: gameDetail?.game_type === 1 ? '120px' : '156px',
                }}
              >
                {/* // 填充到至少三位 */}
                {Object.assign(
                  ['', '', ''],
                  gameDetail?.first_draw_content ? gameDetail?.first_draw_content.split('') : color,
                )?.map((item, index: number) => {
                  return <GameBetItem val={item} key={index} game_type={gameDetail?.game_type} />;
                  return (
                    <div
                      key={index}
                      style={{
                        width: 100,
                        height: 80,
                        marginBottom: 10,
                        backgroundColor: colorGameColors[(item as any) - 1],
                        border: '1px solid rgba(0, 0, 0, 0.45)',
                      }}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
                {FormattedMessage({
                  id: 'common.second_draw_result',
                  defaultMessage: '二次开奖结果录入',
                })}
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  background: '#f2f3f3',
                  padding: '20px',
                  borderRadius: '8px',
                  minHeight: gameDetail?.game_type === 1 ? '120px' : '156px',
                }}
              >
                {gameDetail?.game_code_type === 'SG' ? (
                  <GameBetItem
                    hidden={!gameDetail?.second_draw_content && !color_SG}
                    val={gameDetail?.second_draw_content || color_SG}
                    game_type={gameDetail?.game_type}
                  />
                ) : (
                  // <div
                  //   hidden={!gameDetail?.second_draw_content && !color_SG}
                  //   style={{
                  //     width: 100,
                  //     height: 80,
                  //     marginBottom: 10,
                  //     backgroundColor:
                  //       colorGameColors[
                  //         ((gameDetail?.second_draw_content || color_SG) as any as number) - 1
                  //       ],
                  //     border: '1px solid rgba(0, 0, 0, 0.45)',
                  //   }}
                  // />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {gameDetail?.second_draw_content || color_JP
                      ? find(jackpotOptions, {
                          value: gameDetail?.second_draw_content || color_JP,
                        })?.label
                      : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ height: '40px' }} />

          {render()}
          <div style={{ height: '40px' }} />
          <div
            style={{
              display: 'grid',
              justifyContent: 'space-between',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            <Button
              style={{ width: '300px', height: '60px' }}
              disabled={!(gameDetail?.live_status === 20 || gameDetail?.live_status === 100)}
              data-key="9,Enter"
              onClick={() => {
                if (isFirstDraw) {
                  if (color.length < 3) {
                    message.error(formatMessage({ id: 'common.please.Lottery entry results' }));
                    return;
                  }
                  setVisible(true);
                } else if (isSg) {
                  if (color_SG.length < 1) {
                    message.error(formatMessage({ id: 'common.please.Lottery entry results' }));
                    return;
                  }
                  setVisible_SG(true);
                } else {
                  if (!color_JP) {
                    message.error(formatMessage({ id: 'common.please.Lottery entry results' }));
                    return;
                  }
                  setVisible_JP(true);
                }
              }}
            >
              <FormattedMessage id="common.submit.result" /> (9)
            </Button>
            <Button
              style={{ width: '300px', height: '60px' }}
              loading={startGameData.loading}
              disabled={
                startGameData.loading ||
                gameDetail?.live_status !== 0 ||
                gameDetail?.game_end_second
              }
              data-key="0"
              onClick={() => {
                startGameData.run();
              }}
            >
              <FormattedMessage id="game.nextGame" /> (0)
            </Button>
          </div>
        </ProCard>
      </Spin>
      <Modal
        title={formatMessage({ id: 'common.Submit results (one draw)' })}
        width={'500px'}
        keyboard
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={async () => {
          if (secondAwardData.loading) return;
          setVisible(false);
          await firstAwardData
            .run({
              seq: gameDetail?.seq ?? '',
              game_code,
              result: color.join(''),
            })
            .finally(() => {
              setColor([]);
              setVisible(false);
            });
        }}
      >
        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ flex: '1' }}>
            <div>
              <FormattedMessage id="common.The submitted result is, please confirm it is correct before submitting." />
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                gap: '20px',
                background: '#f2f3f3',
                padding: '20px',
                borderRadius: '8px',
                height: '120px',
                justifyContent: 'center',
              }}
            >
              {color?.map((item, index: number) => {
                return <GameBetItem val={item} key={index} game_type={gameDetail?.game_type} />;
                return (
                  <div
                    key={index}
                    style={{
                      width: 100,
                      height: 80,
                      marginBottom: 10,
                      backgroundColor: colorGameColors[(item as any) - 1],
                      border: '1px solid rgba(0, 0, 0, 0.45)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={formatMessage({ id: 'common.Submit results (secondary lottery draw) SG' })}
        width={'500px'}
        visible={visible_SG}
        keyboard
        onCancel={() => setVisible_SG(false)}
        onOk={async () => {
          if (secondAwardData.loading) return;
          await secondAwardData
            .run({
              seq: gameDetail?.seq ?? '',
              game_code,
              result_second: color_SG,
            })
            .finally(() => {
              setVisible_SG(false);
              setColor_SG('');
            });
        }}
      >
        <div>
          <FormattedMessage id="record.order.seq" />:{gameDetail?.seq}
        </div>

        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ flex: '1' }}>
            <div>
              <FormattedMessage id="common.Lottery entry results" />
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                gap: '20px',
                background: '#f2f3f3',
                padding: '20px',
                borderRadius: '8px',
                justifyContent: 'center',
              }}
            >
              <GameBetItem val={color_SG} game_type={gameDetail?.game_type} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={formatMessage({ id: 'common.Submit results (secondary lottery draw) JP11' })}
        width={'400px'}
        visible={visible_JP}
        keyboard={true}
        onCancel={() => setVisible_JP(false)}
        onOk={() => {
          if (secondAwardData.loading) return;
          secondAwardData
            .run({
              seq: gameDetail?.seq ?? '',
              game_code,
              result_second: color_JP,
            })
            .finally(() => {
              setVisible_JP(false);
              setColor_JP('');
            });
        }}
      >
        <div>
          <FormattedMessage id="record.order.seq" />
          {gameDetail?.seq}
        </div>

        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ flex: '1' }}>
            <div>
              <FormattedMessage id="common.Lottery entry results" />
            </div>

            <Select
              disabled
              style={{ width: '100%' }}
              options={jackpotOptions}
              value={color_JP}
              labelInValue
              key={color_JP}
              onChange={(e) => {
                console.log(e, 'e');
                setColor_JP(e);
              }}
              placeholder={FormattedMessage({
                id: 'colorResult.placeholder',
                defaultMessage: '请选择二次开奖结果',
              })}
              size="large"
            />
          </div>
        </div>
      </Modal>
    </PageHeaderWrapper>
  );
};
