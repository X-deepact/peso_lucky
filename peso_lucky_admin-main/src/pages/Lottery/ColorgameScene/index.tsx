/* eslint-disable react/no-array-index-key */
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Spin, Tag, Select, Typography, message, Statistic, Modal } from 'antd';
import { useRequest } from 'umi';
import { ProCard } from '@ant-design/pro-components';
import { Card, Row, Col, Button } from 'antd';
import { useEffect, useState } from 'react';
import { colorGameColors, isCanSecond } from '@/utils/color';
import FormattedMessage from '@/components/FormattedMessage';
import {
  firstAward,
  gameStatus,
  queryDetail,
  secondAward,
  startGame,
  firstDraw,
  secondDraw,
  startGameSecond,
  startLive,
  jackpotOptions,
} from '../Colorgame/service';
import qs from 'qs';
import { useRef } from 'react';

// const game_code = qs.parse(location.search, { ignoreQueryPrefix: true }).game_code as string;

export default () => {
  const { Countdown } = Statistic;
  const game_code = qs.parse(location.search, { ignoreQueryPrefix: true }).game_code as string;
  const { data } = useRequest(() => queryDetail({ game_code }), {
    pollingInterval: 500,
  });
  const [colorArr, setColorArr] = useState<string[]>([]);
  const [secondColorArr, setSecondColorArr] = useState<string[]>([]);

  const [currentStatus, setCurrentStatus] = useState<number | undefined>(-1);
  const valueStatus = useRef<number | undefined>(0);
  // const colorData = ['yellow', 'white', 'pink', 'blue', 'red', 'green'];
  const [secondStartIsAvailable, setSecondStartIsAvailable] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setCurrentStatus(data?.list.status);
  }, [data?.list.status]);

  useEffect(() => {
    if (currentStatus !== valueStatus.current) {
      if (valueStatus.current === 2 && currentStatus === 3) {
        if (new Set(data?.list.first_draw_tmp_content).size === 1) {
          setSecondStartIsAvailable(false);
          message.open({
            type: 'success',
            // content: `(${time})`,
            content: (
              <p style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                进入二次开奖(
                <Countdown value={Date.now() + 6 * 1000} format="s" />
                秒)
              </p>
            ),
            duration: 5,
          });
          setTimeout(() => {
            setSecondStartIsAvailable(true);
          }, 5000);
        } else {
          message.open({
            type: 'success',
            // content: `(${time})`,
            content: (
              <p style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                派奖中倒计时(
                <Countdown value={Date.now() + 6 * 1000} format="s" />
                秒)
              </p>
            ),
            duration: 5,
          });
        }
      }
      // 二次开奖结束提示
      if (valueStatus.current === 10 && currentStatus === 12) {
        message.open({
          type: 'success',
          // content: `(${time})`,
          content: (
            <p style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
              派奖中倒计时(
              <Countdown value={Date.now() + 6 * 1000} format="s" />
              秒)
            </p>
          ),
          duration: 5,
        });
      }

      valueStatus.current = currentStatus;
    }
  }, [currentStatus]);

  const {
    data: dataFirstAward,
    loading: dataFirstAwardLoading,
    run: dataFirstAwardRun,
  } = useRequest(firstAward, {
    manual: true,
  });

  const {
    data: dataFirstDraw,
    loading: dataFirstDrawLoading,
    run: dataFirstDrawRun,
  } = useRequest(firstDraw, {
    manual: true,
  });

  //
  const {
    data: dataSecondAward,
    loading: dataSecondAwardLoading,
    run: dataSecondAwardRun,
  } = useRequest(secondAward, {
    manual: true,
  });

  const {
    data: dataSecondDraw,
    loading: dataSecondDrawLoading,
    run: dataSecondDrawRun,
  } = useRequest(secondDraw, {
    manual: true,
  });
  //
  const {
    data: startGameData,
    loading: startGameLoading,
    run: startGameRun,
  } = useRequest(startGame, {
    manual: true,
  });

  const { Paragraph } = Typography;

  useEffect(() => {
    setColorArr([]);
    setSecondColorArr([]);
  }, [data?.list.first_draw_tmp_content, data?.list.second_draw_content]);
  const isInSecond =
    data?.list?.status !== 1 &&
    data?.list.status !== 2 &&
    isCanSecond(data?.list?.first_draw_content);
  // 是不是可以开启二次开奖投注
  const isCanStartSecond = data?.list?.status === 3 && isCanSecond(data?.list?.first_draw_content);
  const startLiveData = useRequest(
    () =>
      startLive({
        game_code: data?.list?.game_code ?? '',
        // game_id: data?.list?.game_id ?? '',
        game_status: data?.list?.game_status === 2 ? 1 : 2,
      }),
    {
      manual: true,
      ready: !!data?.list?.seq,
    },
  );
  // const isCanStartSecond = data?.list?.status === 3 ;

  const [jpValue, setJpValue] = useState('3');

  const firstInput = () => {
    return (
      <Row style={{ marginTop: '20px' }}>
        <Col xl={8} sm={24} style={{ marginBottom: '60px' }}>
          <h2>
            {FormattedMessage({
              id: 'colorLottery.firstInput',
              defaultMessage: '一次开奖结果录入',
            })}
          </h2>
          <Row gutter={12} style={{ position: 'relative' }}>
            <Row gutter={12} style={{ position: 'absolute' }}>
              {['', '', ''].map((item, index) => {
                return (
                  <Col key={index}>
                    <Card
                      style={{
                        width: 100,
                        height: 80,
                        marginBottom: 10,
                        borderWidth: '1px',
                        borderStyle: 'dashed',
                        borderColor: colorArr.length === index ? 'pink' : '',
                      }}
                      hoverable={true}
                    />
                  </Col>
                );
              })}
            </Row>

            {/* <div style={{ position: 'absolute' }}> */}
            <Row gutter={12} style={{ position: 'absolute' }}>
              {(data?.list.first_draw_content
                ? data?.list.first_draw_content?.split('')
                : data?.list?.first_draw_tmp_content
                ? data?.list.first_draw_tmp_content?.split('')
                : colorArr
              ).map((item, index) => {
                return (
                  <Col key={index}>
                    <Card
                      style={{
                        width: 100,
                        height: 80,
                        marginBottom: 10,
                        backgroundColor: colorGameColors[Number(item) - 1],
                      }}
                      hoverable={true}
                    />
                  </Col>
                );
              })}
            </Row>
            {/* </div> */}
          </Row>
        </Col>
        <Col xl={10} sm={12} style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {colorGameColors.map((item, index) => {
              return (
                <Card
                  key={item}
                  style={{
                    width: 100,
                    height: 80,
                    backgroundColor: item,
                    marginLeft: 20,
                    marginTop: 20,
                  }}
                  hoverable={true}
                  onClick={() => {
                    if (data?.list?.first_draw_tmp_content) return;
                    if (colorArr.length === 3) return;

                    setColorArr([...colorArr, (index + 1).toString()]);
                  }}
                />
              );
            })}
          </div>
        </Col>
        <Col xl={6} sm={12} style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Button
              size="large"
              type="primary"
              disabled={data?.list?.status !== 1 || data?.list?.first_bet_time_rem < 1}
              style={{
                marginLeft: 10,
                marginTop: 10,
              }}
              onClick={() => {
                dataFirstAwardRun({
                  game_code: data?.list.game_code || '',
                  seq: data?.list.seq || '',
                });
              }}
            >
              {FormattedMessage({
                id: 'colorLottery.result',
                defaultMessage: '进入开奖',
              })}

              {data?.list?.status === 1 && data?.list?.first_bet_time_rem
                ? `${data?.list?.first_bet_time_rem}(s)`
                : ''}
            </Button>
            <Button
              size="large"
              type="primary"
              disabled={data?.list?.status !== 2 || colorArr.length !== 3}
              style={{
                marginLeft: 10,
                marginTop: 10,
              }}
              onClick={() => {
                dataFirstDrawRun({
                  game_code: data?.list.game_code || '',
                  seq: data?.list.seq || '',
                  result: colorArr.join(''),
                  remark: '',
                });
                setColorArr([]);
              }}
            >
              {FormattedMessage({
                id: 'colorLottery.submit',
                defaultMessage: '确认',
              })}
            </Button>
            <Button
              size="large"
              type="primary"
              style={{
                marginLeft: 10,
                marginTop: 10,
              }}
              disabled={colorArr.length === 0}
              onClick={() => {
                setColorArr([]);
              }}
            >
              {FormattedMessage({
                id: 'colorLottery.clear',
                defaultMessage: '清除',
              })}
            </Button>
          </div>
        </Col>
      </Row>
    );
  };
  const secondInput = () => {
    if (data?.list.game_code_type === 'SG') {
      return (
        <Row style={{ marginTop: '20px' }}>
          <Col xl={8} sm={24} style={{ marginBottom: '60px' }}>
            <h2>
              {FormattedMessage({
                id: 'colorLottery.secondInput',
                defaultMessage: '二次开奖结果录入',
              })}
            </h2>
            <Row gutter={12} style={{ position: 'relative' }}>
              {/* <div style={{ position: 'absolute' }}> */}
              <Row gutter={12} style={{ position: 'absolute' }}>
                <Col>
                  <Card
                    style={{
                      width: 100,
                      height: 80,
                      marginBottom: 10,
                      backgroundColor:
                        colorGameColors[
                          ((data?.list?.second_draw_tmp_content?.[0] ?? secondColorArr[0]) as any) -
                            1
                        ],
                    }}
                    hoverable={true}
                  />
                </Col>
              </Row>
              {/* </div> */}
            </Row>
          </Col>
          <Col xl={10} sm={12} style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {colorGameColors.map((item, index) => {
                return (
                  <Card
                    key={item}
                    style={{
                      width: 100,
                      height: 80,
                      backgroundColor: item,
                      marginLeft: 20,
                      marginTop: 20,
                    }}
                    hoverable={true}
                    onClick={() => {
                      if (secondColorArr.length === 1) return;
                      if (data?.list?.second_draw_tmp_content) return;
                      setSecondColorArr([index + 1 + '']);
                    }}
                  />
                );
              })}
            </div>
          </Col>
          <Col xl={6} sm={12} style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Button
                size="large"
                type="primary"
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                }}
                disabled={!isCanStartSecond || !secondStartIsAvailable}
                onClick={() => {
                  startGameSecond({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                  });
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.start',
                  defaultMessage: '开启投注',
                })}
              </Button>
              <Button
                size="large"
                type="primary"
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                }}
                disabled={data?.list?.status !== 9}
                onClick={() => {
                  dataSecondAwardRun({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                  });
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.result',
                  defaultMessage: '进入开奖',
                })}

                {data?.list?.status === 9 && data?.list?.second_bet_time_rem
                  ? `${data?.list?.second_bet_time_rem}(s)`
                  : ''}
              </Button>
              <Button
                size="large"
                type="primary"
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                }}
                disabled={data?.list?.status !== 10 || !!data?.list?.second_draw_tmp_content}
                onClick={() => {
                  if (!secondColorArr?.length) return;
                  dataSecondDrawRun({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                    result: secondColorArr.join(''),
                    remark: '',
                  });
                  setSecondColorArr([]);
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.submit',
                  defaultMessage: '确认',
                })}
              </Button>
              <Button
                size="large"
                type="primary"
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                }}
                disabled={secondColorArr.length === 0}
                onClick={() => {
                  setSecondColorArr([]);
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.clear',
                  defaultMessage: '清除',
                })}
              </Button>
            </div>
          </Col>
        </Row>
      );
    }

    if (data?.list.game_code_type === 'JP') {
      return (
        <Row style={{ marginTop: '20px' }}>
          <Col xl={8} sm={24} style={{ marginBottom: '60px' }}>
            <h2>
              {FormattedMessage({
                id: 'colorLottery.secondInput',
                defaultMessage: '二次开奖结果录入',
              })}
            </h2>
            <Select
              // defaultValue=""
              style={{ width: '100%' }}
              // onChange={handleChange}
              options={jackpotOptions}
              value={data?.list?.second_draw_tmp_content || jpValue}
              disabled={!!data?.list?.second_draw_tmp_content}
              onChange={(e) => setJpValue(e)}
              placeholder={FormattedMessage({
                id: 'colorResult.placeholder',
                defaultMessage: '请选择二次开奖结果',
              })}
              size="large"
            />
          </Col>
          <Col xl={10} sm={12} style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                marginTop: '23px',
                marginLeft: '20px',
                gap: '20px',
              }}
            >
              {/* <Button
                size="large"
                type="primary"
                disabled={!isCanStartSecond}
                onClick={() => {
                  startGameSecond({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                  });
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.start',
                  defaultMessage: '开启投注',
                })}
              </Button> */}
              <Button
                size="large"
                type="primary"
                disabled={data?.list?.status !== 3 || !isCanSecond(data?.list?.first_draw_content)}
                onClick={() => {
                  dataSecondAwardRun({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                  });
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.result',
                  defaultMessage: '进入开奖',
                })}

                {data?.list?.status === 2 && data?.list?.first_bet_time_rem
                  ? `${data?.list?.first_bet_time_rem}(s)`
                  : ''}
              </Button>
              <Button
                size="large"
                type="primary"
                style={{
                  marginLeft: 10,
                }}
                disabled={data?.list?.status !== 10 || !!data?.list?.second_draw_tmp_content}
                onClick={() => {
                  if (!jpValue) return;
                  dataSecondDrawRun({
                    game_code: data?.list.game_code || '',
                    seq: data?.list.seq || '',
                    result: jpValue,
                    remark: '',
                  });
                  setJpValue('');
                }}
              >
                {FormattedMessage({
                  id: 'colorLottery.submit',
                  defaultMessage: '确认',
                })}
              </Button>
            </div>
          </Col>
        </Row>
      );
    }
    return null;
  };

  return (
    <PageHeaderWrapper>
      <h1>power by @niko </h1>
      <ProCard>
        <Spin
          spinning={
            dataFirstAwardLoading ||
            dataFirstDrawLoading ||
            dataSecondAwardLoading ||
            dataSecondDrawLoading ||
            startGameLoading ||
            startLiveData.loading
          }
        >
          <div style={{ display: 'flex', gap: '20px' }}>
            <Paragraph copyable={{ text: data?.list?.seq }}>
              {FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' })}：
              {data?.list?.seq}
            </Paragraph>
            <Paragraph copyable={{ text: data?.list?.game_name }}>
              {FormattedMessage({ id: 'record.order.game_name', defaultMessage: '游戏名称' })}：
              {data?.list?.game_name}
            </Paragraph>
            <Paragraph copyable={{ text: data?.list?.game_code }}>
              {FormattedMessage({ id: 'colorLottery.gameSeq', defaultMessage: '游戏编号' })}：
              {data?.list?.game_code}
            </Paragraph>

            {/* <span>
              <FormattedMessage id="game.info.status" />:{gameStatus[data?.list?.status || 0]}
            </span> */}
            <Tag
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (data?.list.game_status === 1) {
                  setIsModalOpen(true);
                } else {
                  startLiveData.run();
                }
                // startLiveData.run();
              }}
            >
              {data?.list?.game_status === 1
                ? FormattedMessage({ id: 'game.open' })
                : FormattedMessage({ id: 'game.close' })}
            </Tag>
          </div>
          {isInSecond ? secondInput() : firstInput()}
          {/* {firstInput()}
          {secondInput()} */}
        </Spin>
        {/* 开启关闭弹框 */}
        <Modal
          open={isModalOpen}
          onOk={() => {
            setIsModalOpen(false);
            if (data?.list.status === 12) {
              startLiveData.run();
            } else {
              message.error('等待下局开启的时候 才可关闭');
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
          }}
        >
          <p>是否确认关闭</p>
        </Modal>
      </ProCard>
    </PageHeaderWrapper>
  );
};
