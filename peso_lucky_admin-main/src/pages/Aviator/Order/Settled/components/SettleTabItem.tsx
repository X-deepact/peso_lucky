import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from '../data';
import { useIntl, useModel, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import {
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
  ProFormGroup,
  ProCard,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormDependency,
} from '@ant-design/pro-components';
import { Divider, Modal } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { querysettle, getDetail } from '../service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import ColorGameResult from '@/components/ColorGameResult';
import ActionAnchor from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { history, useLocation } from 'umi';
import { currencySelectOption } from '@/utils/options';

export default () => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const form = useBetaSchemaForm();

  const [initVals, setinitVals] = useState({} as any);

  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="record.order.dateTimeRange" />,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const bet_at_begin = moment(value[0]).valueOf();
          const bet_at_end = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            bet_at_begin,
            bet_at_end,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    // 注单用户
    {
      title: <FormattedMessage id="record.order.bettingUser" />,
      dataIndex: 'id',
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage id="record.order.order_number" defaultMessage="order_number" />
                ),
                dataIndex: 'order_number',
                valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="record.order.username" defaultMessage="username" />,
                dataIndex: 'nickname',
                render(_, record) {
                  return record.username || record.nickname;
                },
              },
              {
                label: <FormattedMessage id="record.order.user_id" defaultMessage="user_id" />,
                dataIndex: 'user_id',
              },
            ]}
          />
        );
      },
      width: '300px',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.bettingInfo', defaultMessage: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: <FormattedMessage id="record.order.seq" defaultMessage="seq" />,
                // 游戏期号
                dataIndex: 'seq',
              },
              {
                label: <FormattedMessage id="game.info.game_name" />,
                dataIndex: 'game_name',
              },
              {
                label: (
                  <FormattedMessage id="record.order.created_at" defaultMessage="created_at" />
                ),
                dataIndex: 'created_at',
                valueType: 'dateTime',
              },
            ]}
          />
        );
      },
      width: '300px',
    },
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
    },

    {
      title: FormattedMessage({ id: 'record.order.amount', defaultMessage: 'amount' }),
      dataIndex: 'bet_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    //@结算倍数
    {
      // title: '结算倍数',
      title: FormattedMessage({ id: 'record.order.bet_odds', defaultMessage: 'bet_odds' }),
      dataIndex: 'bet_odds',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    //@派彩金额
    {
      title: FormattedMessage({ id: 'record.order.prize_amount', defaultMessage: 'prize_amount' }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    //@输赢金额/GGR
    {
      title: (
        <FormattedMessage id="record.order.win_lose_amount" defaultMessage="win_lose_amount" />
      ),
      dataIndex: 'win_lose_amount',
      hideInSearch: true,
      valueType: 'winLoseAmount' as any,
    },
    //@注单状态
    {
      title: FormattedMessage({
        id: 'record.order.background_status',
        defaultMessage: 'background_status',
      }),
      dataIndex: 'background_status',
      hideInSearch: true, // 只展示
      // request: async () => await optionDictDataSelect({ dictType: 'background_status' }, true),
      render(_: any, record: any) {
        return formatMessage({
          id: record.win_lose_amount > 0 ? `dict.win_lose.win` : `dict.win_lose.lose`,
          defaultMessage: '',
        });
      },
    } as any,
    //@有效投注
    {
      title: FormattedMessage({ id: 'record.order.amount_valid', defaultMessage: 'amount_valid' }),
      dataIndex: 'amount_valid',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    //@派彩时间/兑现时间
    {
      title: FormattedMessage({ id: 'record.order.cashing_time', defaultMessage: 'cashing_time' }),
      dataIndex: 'settle_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // {
    //   title: formatMessage({ id: 'record.order.order_number' }),
    //   dataIndex: 'order_number',
    //   hideInTable: true,
    //   formItemProps: {
    //     rules: [{ max: 50 }],
    //   },
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.amount_valid', defaultMessage: 'amount_valid' }),
    //   dataIndex: 'amount_valid',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.award_amount', defaultMessage: 'award_amount' }),
    //   dataIndex: 'award_amount',
    //   hideInSearch: true,
    //   valueType: 'okAmount' as any,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
    //   dataIndex: 'status1',
    //   hideInSearch: true, // 只展示
    //   render: (_dom: any, record: any) =>
    //     // 【脏活】后端订单有一定情况 已结算处理中会给未结算的状态 这边做一下处理
    //     formatMessage({ id: `dict.order_status.${record.status}` }),
    // } as any,
    {
      title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInTable: true,
      hideInSearch: true, // 只展示
      // request: async () => await optionDictDataSelect({ dictType: 'order_status' }, true),
      // 订单状态: 1 - 未结算，2 - 已结算(中奖)，3 - 已结算(未中奖)
      request: async () => {
        return [
          // {
          //   label: formatMessage({ id: 'dict.order_status.1' }),
          //   value: 1,
          // },
          {
            label: formatMessage({ id: 'dict.order_status.2' }),
            value: 2,
          },
        ];
      },
      valueType: 'select',
    },
    // {
    //   title: FormattedMessage({ id: 'record.order.settle_time', defaultMessage: 'settle_time' }),
    //   dataIndex: 'settle_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    {
      title: FormattedMessage({ id: 'record.order.device_type', defaultMessage: 'device_type' }),
      dataIndex: 'device_type',
      hideInSearch: true,
      valueEnum: {
        1: 'PC-WEB',
        2: 'H5',
        3: 'APP(iOS)',
        4: 'APP(Android)',
        0: 'OTHER',
      },
    },
    //@详情
    {
      title: FormattedMessage({ id: 'record.order.desc', defaultMessage: 'desc' }),
      dataIndex: 'bet_desc',
      hideInTable: true,
      valueType: 'text',
    },
    {
      title: formatMessage({ id: 'record.order.merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      render: (dom, record) => record.merchant_name || record.merchant_code,
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      title: formatMessage({ id: 'record.order.user_id' }),
      dataIndex: 'user_id',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'record.order.username' }),
      dataIndex: 'username',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.order.seq', defaultMessage: 'seq' }),
      dataIndex: 'seq',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'game.info.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'game_name',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'record.order.order_number', defaultMessage: 'order_number' }),
      dataIndex: 'order_number',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
  ];

  const location = useLocation() as any;

  // 初始化参数
  useEffect(() => {
    searchFormRef.current?.setFieldsValue({
      ...(location.query || {}),
      dateTimeRange: dateOptions[5].value,
    });
    // history.replace(window.location.pathname + window.location.hash);
    searchFormRef.current?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        manualRequest={true}
        formRef={searchFormRef}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params) => {
          const res = await querysettle(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
      <ModalForm<any>
        modalProps={{
          destroyOnClose: true,
        }}
        onVisibleChange={form.setShow}
        formRef={form.formRef}
        visible={form.show}
        readonly
        initialValues={initVals}
        syncToInitialValues
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 24,
        }}
        title={FormattedMessage({ id: 'common.order.detail', defaultMessage: '注单详情' })}
        onFinish={async () => {
          return true;
        }}
      >
        <ProFormGroup>
          <ProFormText
            width="md"
            name="username"
            label={FormattedMessage({ id: 'player.nickname' })}
          />
          <ProFormText width="md" name="user_id" label={FormattedMessage({ id: 'player.id' })} />
          <ProFormText
            width="md"
            name="merchant_name"
            label={FormattedMessage({ id: 'chat.merchant_name', defaultMessage: '商户名称' })}
          />
          <ProFormText
            width="md"
            name="merchant_code"
            label={FormattedMessage({ id: 'record.merchant_code' })}
          />
          <ProFormText
            width="md"
            name="game_name"
            label={FormattedMessage({ id: 'record.order.game_name', defaultMessage: '游戏名称' })}
          />
          <ProFormText
            width="md"
            name="game_code"
            label={FormattedMessage({ id: 'record.game_code' })}
          />
          <ProFormSelect
            width="md"
            name="game_type"
            label={FormattedMessage({ id: 'record.lottery.game_type', defaultMessage: '游戏类型' })}
            options={[
              { label: 'Color Game', value: 1 },
              { label: 'DROP BALL GAME', value: 2 },
            ]}
          />
          <ProFormSelect
            width="md"
            name="code_type"
            label={FormattedMessage({ id: 'record.play_type', defaultMessage: '玩法类型' })}
            options={[
              { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
              { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
            ]}
          />
          <ProFormText
            width="md"
            name="seq"
            label={FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' })}
          />
          <ProFormDateTimePicker
            name="created_at"
            label={FormattedMessage({ id: 'record.lottery.open_time', defaultMessage: '开始时间' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />
          <ProFormSelect
            width="md"
            name="device_type"
            label={FormattedMessage({ id: 'record.order.device_type', defaultMessage: '设备类型' })}
            valueEnum={{ 1: 'PC-WEB', 2: 'H5', 3: 'APP(iOS)', 4: 'APP(Android)', 0: 'OTHER' }}
          />
          <ProFormText width="md" name="ip" label="IP" />
          <ProFormText
            width="md"
            name="currency"
            label={FormattedMessage({ id: 'record.deal.currency' })}
          />
        </ProFormGroup>
        <Divider />
        <ProFormGroup>
          <ProFormText
            width="md"
            name="anchor_name"
            label={FormattedMessage({ id: 'record.draw_person' })}
          />
          <ProFormSelect
            width="md"
            name="status"
            label={FormattedMessage({ id: 'record.order.status' })}
            options={[
              {
                label: formatMessage({ id: 'dict.order_status.2' }),
                value: 2,
              },
              {
                label: formatMessage({ id: 'dict.order_status.3' }),
                value: 3,
              },
              {
                label: formatMessage({ id: 'dict.order_status.4' }),
                value: 4,
              },
            ]}
          />
          <ProFormDateTimePicker
            name="first_draw_time"
            label={formatMessage({ id: 'record.first_bet_time' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />
          <ProFormDateTimePicker
            name="second_draw_time"
            label={formatMessage({ id: 'record.second_bet_time' })}
            fieldProps={{
              format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
            }}
          />

          <ProDescriptions
            layout="horizontal"
            dataSource={initVals}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage
                    id="record.order.bet_content"
                    defaultMessage="bet_content_summary"
                  />
                ),
                dataIndex: 'bet_content',
                render: (v) => {
                  return <ColorGameResult moneys={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.bet_content1"
                    defaultMessage="第一次开奖结果"
                  />
                ),
                dataIndex: 'first_draw_result',
                render: (v) => {
                  return <ColorGameResult colors={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.second_bet_content"
                    defaultMessage="第二次下注内容"
                  />
                ),
                dataIndex: 'second_bet_content',
                render: (v) => {
                  if (initVals.code_type === 'JP' || initVals.game_code_type === 'JP') return null;
                  return <ColorGameResult colors={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="record.order.bet_content1"
                    defaultMessage="第二次开奖结果"
                  />
                ),
                dataIndex: 'second_prize_content',
                render: () => {
                  // 奖池玩法
                  if (initVals.code_type === 'JP' || initVals.game_code_type === 'JP') {
                    const value = initVals.second_prize_content;
                    return value == 88801
                      ? 'minor jackpot'
                      : value == 88802
                      ? 'major jackpot'
                      : value == 88803
                      ? 'grand jackpot'
                      : value
                      ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                      : '-';
                  }
                  // if (initVals.code_type === 'SG') {

                  // const value = initVals.second_prize_content;
                  return initVals?.prize_type < 88801 && initVals?.prize_type > 0
                    ? `${initVals?.prize_type} ${FormattedMessage({ id: 'record.order.multiple' })}`
                    : '-';
                },
              },
            ]}
          />
        </ProFormGroup>
        <Divider />
        <ProFormGroup>
          <ProFormText
            width="md"
            name="amount"
            label={FormattedMessage({ id: 'record.lottery.total_bet_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="amount_valid"
            label={FormattedMessage({ id: 'record.order.award_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="prize_amount"
            label={FormattedMessage({ id: 'record.lottery.total_prize_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="win_lose_amount"
            label={FormattedMessage({ id: 'record.order.win_lose_amount' })}
            convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="jackpot_type"
            label="触发奖池90909"
            // convertValue={(value) => String(value / 100)}
          />
          <ProFormText
            width="md"
            name="jackpot_prize_amount"
            label="奖池派奖金额"
            convertValue={(value) => String(value / 100)}
          />
        </ProFormGroup>
        {initVals?.status === 4 && (
          <ProCard.Group title="二次结算信息" direction={'row'}>
            <ProCard.Group direction={'row'}>
              <ProCard>
                <ProFormText
                  width="md"
                  name="amount"
                  label={FormattedMessage({ id: 'record.lottery.total_bet_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_amount_valid"
                  label={FormattedMessage({ id: 'record.order.award_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_adjust_amount"
                  label="派彩调整"
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_prize_amount"
                  label={FormattedMessage({ id: 'record.lottery.total_prize_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
            </ProCard.Group>

            <ProCard.Group direction={'row'}>
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_win_lose_amount"
                  label={FormattedMessage({ id: 'record.order.win_lose_amount' })}
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_win_lose_adjust"
                  label="输赢调整"
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_jackpot_type"
                  label="触发奖池"
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
              <Divider type={'vertical'} />
              <ProCard>
                <ProFormText
                  width="md"
                  name="ss_jackpot_prize_amount"
                  label="奖池派奖金额"
                  convertValue={(value) => String(value / 100)}
                />
              </ProCard>
            </ProCard.Group>

            <ProCard.Group direction={'row'}>
              <ProFormGroup>
                <ProCard>
                  <ProFormDateTimePicker
                    name="ss_settle_time"
                    label={FormattedMessage({ id: 'secondSettlement.created_at' })}
                    fieldProps={{
                      format: (value) => value.format('YYYY-MM-DD HH:mm:ss'),
                    }}
                  />
                </ProCard>
                <ProCard>
                  <ProFormText width="md" name="ss_updated_by" label="二次结算操作人" />
                </ProCard>
                <ProCard>
                  <ProFormText width="md" name="ss_remark" label="操作原因" />
                </ProCard>
              </ProFormGroup>
            </ProCard.Group>
          </ProCard.Group>
        )}
      </ModalForm>
    </div>
  );
};
