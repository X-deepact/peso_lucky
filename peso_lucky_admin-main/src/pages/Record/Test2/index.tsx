import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Modal, Space, message } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { gamenoCancel, gameroundCancel, getTotal, query } from './service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import ColorGameResult from '@/components/ColorGameResult';
import { getGameType } from '@/pages/Game/Content/service';
import ActionAnchor from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import promiseConfirmModal from '@/utils/promiseModal';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const form = useBetaSchemaForm();
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="common.startDateTimeRange" />,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const open_time_start = moment(value[0]).valueOf();
          const open_time_end = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            open_time_start,
            open_time_end,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      // title: FormattedMessage({ id: 'record.lottery.seq', defaultMessage: 'seq' }),
      title: formatMessage({ id: 'record.lottery.seq' }),
      dataIndex: 'seq',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      // title: FormattedMessage({ id: 'record.lottery.game_name', defaultMessage: 'game_name' }),
      title: formatMessage({ id: 'record.lottery.game_name' }),
      dataIndex: 'game_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'record.lottery.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      valueType: 'select',
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.round_type', defaultMessage: 'round_type' }),
    //   dataIndex: 'round_type',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.operator', defaultMessage: 'operator' }),
    //   dataIndex: 'operator',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.canceled_at', defaultMessage: 'canceled_at' }),
    //   dataIndex: 'canceled_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.open_time', defaultMessage: 'open_time' }),
    //   dataIndex: 'open_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.close_time', defaultMessage: 'close_time' }),
    //   dataIndex: 'close_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.end_time', defaultMessage: 'end_time' }),
    //   dataIndex: 'end_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.prize_content', defaultMessage: 'prize_content' }),
    //   dataIndex: 'prize_content',
    //   valueType: 'password',
    //   hideInSearch: true,
    // },
    // {
    //   title: (
    //     <FormattedMessage id="record.lottery.second_content" defaultMessage="second_content" />
    //   ),
    //   dataIndex: 'second_content',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'record.lottery.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      // request: () => optionDictDataSelect({ dictType: 'lottery_status' }, true),
      request: async () => {
        return [
          {
            label: formatMessage({ id: 'dict.lottery_status.1' }),
            value: 1,
          },
          {
            label: formatMessage({ id: 'dict.lottery_status.2' }),
            value: 2,
          },
          {
            label: formatMessage({ id: 'dict.lottery_status.3' }),
            value: 3,
          },
          {
            label: formatMessage({ id: 'dict.lottery_status.4' }),
            value: 4,
          },
          {
            label: formatMessage({ id: 'dict.lottery_status.5' }),
            value: 5,
          },
          {
            label: formatMessage({ id: 'dict.lottery_status.6' }),
            value: 6,
          },
        ];
      },
      valueType: 'select',
    },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.next_seq', defaultMessage: 'next_seq' }),
    //   dataIndex: 'next_seq',
    // },
    // {
    //   title: (
    //     <FormattedMessage id="record.lottery.cancel_operator" defaultMessage="cancel_operator" />
    //   ),
    //   dataIndex: 'cancel_operator',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.remark', defaultMessage: 'remark' }),
    //   dataIndex: 'remark',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.seq', defaultMessage: 'seq' }),
    //   dataIndex: 'issue_number',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'record.lottery.open_time', defaultMessage: 'open_time' }),
      dataIndex: 'open_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'record.lottery.draw_time', defaultMessage: 'draw_time' }),
      dataIndex: 'first_draw_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: (
        <FormattedMessage id="record.lottery.second_draw_time" defaultMessage="second_draw_time" />
      ),
      dataIndex: 'second_draw_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // {
    //   title: FormattedMessage({ id: 'record.lottery.prize_time', defaultMessage: 'prize_time' }),
    //   dataIndex: 'prize_time',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    {
      // title: <FormattedMessage id="common.option" />,
      title: formatMessage({ id: 'common.draw.result' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        <ActionAnchor
          access="/record/lottery_view"
          key="edit"
          action={() => {
            Modal.info({
              width: '800px',
              title: formatMessage({ id: 'common.draw.result' }),
              content: (
                <ProDescriptions
                  title={
                    <Space>
                      期号 <span>{record.seq}</span>
                    </Space>
                  }
                  layout="horizontal"
                  dataSource={record}
                  column={2}
                  columns={[
                    {
                      title: formatMessage({ id: 'common.first_draw_result' }),
                      dataIndex: 'first_draw_result',
                      render(v) {
                        return <ColorGameResult colors={v as string} />;
                      },
                    },
                    {
                      title: formatMessage({ id: 'common.first_draw_time' }),
                      dataIndex: 'first_draw_time',
                      valueType: 'dateTime',
                    },
                    {
                      title: formatMessage({ id: 'common.second_draw_result' }),
                      dataIndex: 'second_draw_result',
                      render(v) {
                        // 奖池玩法
                        const value = record.second_draw_result;
                        if (record.code_type === 'JP' || record.game_code_type === 'JP') {
                          return value == 88801
                            ? 'minor jackpot'
                            : value == 88802
                            ? 'major jackpot'
                            : value == 88803
                            ? 'grand jackpot'
                            : value
                            ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                            : record.award_amount || '-';
                        }
                        // if (record.code_type === 'SG') {
                        return <ColorGameResult colors={value as string} />;
                      },
                    },
                    {
                      title: formatMessage({ id: 'common.second_draw_time' }),
                      dataIndex: 'second_draw_time',
                      valueType: 'dateTime',
                    },
                  ]}
                />
              ),
            });
          }}
        >
          <FormattedMessage id="common.view" />
        </ActionAnchor>,
      ],
    },
    {
      title: <FormattedMessage id="common.option" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      hideInTable: process.env.PLATFORM === 'MERCHANT',
      render: (dom, record) => {
        // 是否取消
        const isCancel = record.status === 3;
        // 是否撤单
        const isOrderCancel = record.status === 6;
        const isCanotCancel = record.status === 1; // 只有1未开奖可以取消
        const isInDraw = record.status === 2;
        // const isCanotCancel = record.status === 2 || record.status === 1;

        // 超过24小时 、已取消 已撤单 不可用

        const disableCancelAll = moment().diff(moment(record.open_time), 'hours') > 24;
        return [
          <ActionAnchor
            key="edit"
            access="/record/lottery_cancel"
            disabled={isOrderCancel || disableCancelAll || isInDraw}
            action={async () => {
              // 只能对24小时内撤单

              if (moment().diff(moment(record.open_time), 'hours') > 24) {
                message.error(
                  formatMessage({
                    id: 'record.lottery.gameroundCancel.canotCancel24',
                    defaultMessage: '只能对24小时内撤单',
                  }),
                );
                return;
              }
              const res = await getTotal({ seq: record.seq });
              form.setShow(true);
              form.setData({ ...record, ...res.data });
            }}
          >
            {/* 库里面的是6 给前端重新映射是3 */}
            <FormattedMessage id="record.lottery.cancel" />
          </ActionAnchor>,
          <ActionAnchor
            key="edit"
            access="/record/lottery_cancel"
            disabled={isCancel || isOrderCancel || isCanotCancel || isInDraw}
            action={async () => {
              if (isCancel || isCanotCancel) return;
              await promiseConfirmModal({
                title: formatMessage({
                  id: 'record.lottery.gameround.cancel.tip',
                  defaultMessage: '是否确认取消该奖期？',
                }),
              });
              const res = await gameroundCancel({ seq: record.issue_number as any, ...record });
              if (res.success) {
                message.open({
                  type: 'success',
                  content: FormattedMessage({
                    id: 'common.gameroundCancel.optionSuccess',
                    defaultMessage: '奖期已取消！',
                  }),
                });
              }
              actionRef.current?.reload();
            }}
          >
            {/* 库里面的是6 给前端重新映射是3 */}
            {isCancel || isOrderCancel ? (
              <FormattedMessage id="record.lottery.gameroundCancel.cancelSuccess" />
            ) : isCanotCancel || isInDraw ? (
              <FormattedMessage id="record.lottery.gameroundCancel.canotCancel" />
            ) : (
              <FormattedMessage id="record.lottery.gameroundCancel.cancel" />
            )}
          </ActionAnchor>,
        ];
      },
    },
  ];

  useEffect(() => {
    formRef?.current?.resetFields?.();
  }, [show]);
  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      dateTimeRange: dateOptions[5].value,
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <PageHeaderWrapper>
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
          const res = await query(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
      <ModalForm<any>
        onVisibleChange={form.setShow}
        formRef={form.formRef}
        visible={form.show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        title={<FormattedMessage id="record.lottery.cancel" />}
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {
          const res = await gamenoCancel({ seq: form.data.issue_number, ...values });
          if (res.success) {
            message.open({
              type: 'success',
              content: FormattedMessage({
                id: 'common.gamenoCancel.optionSuccess',
                defaultMessage: '当前单已取消！',
              }),
            });
          }
          actionRef.current?.reload();
          return true;
        }}
      >
        <Space direction={'vertical'}>
          <div>
            <FormattedMessage id="record.lottery.seq" defaultMessage="seq" /> :
            {form?.data?.issue_number}
          </div>
          <div>
            <FormattedMessage id="record.lottery.total_orders" defaultMessage="total_orders" /> :
            {form?.data?.total_orders}
          </div>
          <div>
            <FormattedMessage
              id="record.lottery.total_bet_amount"
              defaultMessage="total_bet_amount"
            />
            :{form?.data?.total_bet_amount / 100}
          </div>
          <div>
            <FormattedMessage id="record.lottery.total_users" defaultMessage="total_users" /> :
            <div style={{ display: 'inline-flex', width: '400px' }}>:{form?.data?.total_users}</div>
          </div>
          <div>
            <FormattedMessage
              id="record.lottery.total_prize_amount"
              defaultMessage="total_prize_amount"
            />
            :{form?.data?.total_prize_amount / 100}
          </div>
          <div>
            <FormattedMessage
              id="record.lottery.total_merchants"
              defaultMessage="total_merchants"
            />
            :{form?.data?.total_merchants}
          </div>
        </Space>
        <div style={{ height: '30px' }}></div>
        <ProFormText
          style={{ marginTop: '60px' }}
          name="remark"
          labelAlign={'left'}
          label={FormattedMessage({ id: 'common.remark' })}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </PageHeaderWrapper>
  );
};
