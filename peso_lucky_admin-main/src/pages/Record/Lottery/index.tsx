import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import React, { useEffect, useRef, useState } from 'react';
import {
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
  ProFormDateTimePicker,
  ProFormGroup,
  ProCard,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Modal, Space, message } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { gamenoCancel, gameroundCancel, getTotal, query, secSettle, getSum } from './service';
import ColorGameResult from '@/components/ColorGameResult';
import { getGameType } from '@/pages/Game/Content/service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import promiseConfirmModal from '@/utils/promiseModal';
import { DownOutlined } from '@ant-design/icons';
import { keys } from 'lodash';

import { colorGameColors, dropGameBgs, getJackpotOptions } from '@/utils/color';

const RenderSecPrize = ({ code_type, game_type = '' }: any) => {
  // 奖池玩法
  if (code_type === 'JP' || game_type === 'JP') {
    return code_type == 88801
      ? 'minor jackpot'
      : code_type == 88802
      ? 'major jackpot'
      : code_type == 88803
      ? 'grand jackpot'
      : code_type
      ? `${code_type} ${FormattedMessage({ id: 'record.order.multiple' })}`
      : '-';
  }
  // if (record.code_type === 'SG') {
  return <ColorGameResult colors={code_type as string} game_type={game_type} />;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const form = useBetaSchemaForm();
  const searchFormRef = useRef<ProFormInstance>();
  const secForm = useBetaSchemaForm();

  const [initVals, setinitVals] = useState({} as any);

  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [first, setfirst] = useState<any[]>([]);
  const [second, setsecond] = useState(null as any);
  const formatAmout = (v: number) => {
    if (v == null) return 0;
    // 格式化成 11,234,567.45形式
    if (typeof v !== 'number') {
      return v;
    }
    try {
      const formattedValue = (v / 100).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return formattedValue;
    } catch (error) {
      return v / 100;
    }
  };
  const format = (v: number) => {
    return formatAmout(v ? v * 100 : 0);
  };
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

    {
      title: FormattedMessage({ id: 'record.lottery.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      request: async () => {
        // 'dict.lottery_status.4': '一次开奖',
        // 'dict.lottery_status.5': '二次开奖',
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
          {
            label: formatMessage({ id: 'dict.lottery_status.7', defaultMessage: '二次结算' }),
            value: 7,
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
          action={async () => {
            const res = await getSum({ seq: record.seq });
            Modal.info({
              width: '800px',
              // title: formatMessage({ id: 'common.draw.result' }),
              content: (
                <ProCard
                  bordered
                  headerBordered
                  title={formatMessage({ id: 'common.draw.result', defaultMessage: '开奖结果' })}
                  extra={formatMessage({ id: 'trAdd.periodNum' }) + `：${record.seq}`}
                  split="horizontal"
                >
                  <ProCard
                    title={formatMessage({
                      id: 'common.first_draw_result',
                      defaultMessage: '第一次开奖结果',
                    })}
                  >
                    <ProDescriptions
                      layout="horizontal"
                      dataSource={record}
                      column={2}
                      columns={[
                        {
                          title: formatMessage({ id: 'common.first_draw_result' }),
                          dataIndex: 'first_draw_result',
                          render(v) {
                            console.log(record, 'record.code_type');
                            return (
                              <ColorGameResult colors={v as string} game_type={record.game_type} />
                            );
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
                            return (
                              <ColorGameResult
                                colors={value as string}
                                game_type={record.game_type}
                              />
                            );
                          },
                        },
                        {
                          title: formatMessage({ id: 'common.second_draw_time' }),
                          dataIndex: 'second_draw_time',
                          valueType: 'dateTime',
                        },
                      ]}
                    />
                  </ProCard>
                  {record.status === 7 && (
                    <ProCard
                      title={formatMessage({ id: 'common.order', defaultMessage: '二次开奖结果' })}
                    >
                      <ProDescriptions
                        layout="horizontal"
                        dataSource={record}
                        column={2}
                        columns={[
                          // 二次结算

                          {
                            title: formatMessage({ id: 'common.first_draw_result' }),
                            dataIndex: 'second_settlement_result',
                            render(v) {
                              console.log(record, 'record.code_type');
                              return (
                                <ColorGameResult
                                  colors={v as string}
                                  game_type={record.game_type}
                                />
                              );
                            },
                          },
                          {
                            title: formatMessage({ id: 'common.second_draw_result' }),
                            dataIndex: 'second_settlement_tow_result',
                            render(v) {
                              // 奖池玩法
                              const value = record.second_settlement_tow_result;
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
                              return (
                                <ColorGameResult
                                  colors={value as string}
                                  game_type={record.game_type}
                                />
                              );
                            },
                          },
                          {
                            title: formatMessage({
                              id: 'trAdd.optionTime',
                              defaultMessage: '操作时间',
                            }),
                            dataIndex: 'second_settlement_time',
                            valueType: 'dateTime',
                          },
                        ]}
                      />
                    </ProCard>
                  )}
                  <ProCard>
                    <ProDescriptions
                      columns={[
                        {
                          title: formatMessage({
                            id: 'record.lottery.total_orders',
                            defaultMessage: '总注单数',
                          }),
                          render() {
                            return format(res?.data?.[0]?.bet_count);
                          },
                        },
                        {
                          title: formatMessage({
                            id: 'record.lottery.total_users',
                            defaultMessage: '总投注用户数',
                          }),
                          render() {
                            return format(res?.data?.[0]?.bet_users);
                          },
                        },
                        {
                          title: formatMessage({
                            id: 'record.lottery.total_bet_amount',
                            defaultMessage: '总投注金额',
                          }),
                          render() {
                            return formatAmout(res?.data?.[0]?.amount);
                          },
                        },
                        {
                          title: formatMessage({
                            id: 'record.lottery.total_win_loss',
                            defaultMessage: '总输赢金额',
                          }),
                          render() {
                            return formatAmout(res?.data?.[0]?.win_lose_amount);
                          },
                        },
                        {
                          title: formatMessage({
                            id: 'record.lottery.total_prize_amount',
                            defaultMessage: '总派彩金额',
                          }),
                          render() {
                            return formatAmout(res?.data?.[0]?.prize_amount);
                          },
                        },
                      ]}
                    />
                  </ProCard>
                </ProCard>
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

        // disabledSecDrawLottery   只有一次开奖 二次开奖的才能二次开奖
        const disabledSecDrawLottery = record.status !== 4 && record.status !== 5;

        return [
          // 二次结算
          <ActionAnchor
            key="edit"
            access="/record/lottery_reSettlement"
            disabled={disabledSecDrawLottery}
            action={() => {
              // 手动设置值
              secForm.formRef.current?.resetFields();
              secForm.setData({ ...record });
              setinitVals({ ...record });
              secForm.setShow(true);
            }}
          >
            {/* 库里面的是6 给前端重新映射是3 */}
            <FormattedMessage id="record.lottery.reSettlement" defaultMessage="二次结算" />
          </ActionAnchor>,

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
              const res = await gameroundCancel({ ...record, seq: record.issue_number });
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
        toolBarRender={() => [
          <ActionBtn
            access="/record/lottery_export"
            key="out"
            type="primary"
            onClick={() => {
              // 下载导出数据

              //  获取当前页码
              const current = actionRef.current?.pageInfo?.current || 1;
              const pageSize = actionRef.current?.pageInfo?.pageSize || 20;

              const Platform = localStorage.getItem('Platform') || '';
              const token = localStorage.getItem('token');

              const { dateTimeRange } = searchFormRef.current?.getFieldsValue();

              const values = {
                ...objValTrim(omitEmpty(searchFormRef.current?.getFieldsValue())),
                open_time_start: dateTimeRange?.[0]?.valueOf(),
                open_time_end: dateTimeRange?.[1]?.valueOf(),
                current,
                pageSize,
                dateTimeRange: undefined,
              };

              const url: string = '/api/v1/record/round/excel';
              const queryParams = objValTrim(omitEmpty(values)) || {};

              const queryStr = keys(queryParams)
                .map((key) => `${key}=${queryParams[key]}`)
                .join('&');

              fetch(`${url}?${queryStr}`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}` || '',
                  Platform,
                },
              }).then((response) => {
                response.blob().then((blob) => {
                  const a = document.createElement('a');
                  const DownloadURl = window.URL.createObjectURL(blob);
                  const contentDisposition = response.headers.get('Content-Disposition');
                  let filename = '奖期列表.xls';
                  if (contentDisposition) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                      filename = matches[1].replace(/['"]/g, '');
                    }
                  }
                  a.href = DownloadURl;
                  a.download = filename;
                  a.click();
                  window.URL.revokeObjectURL(DownloadURl);
                });
              });
            }}
          >
            <FormattedMessage id="pages.export" defaultMessage="导出" />
            <DownOutlined />
          </ActionBtn>,
        ]}
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
        <div style={{ height: '30px' }} />
        <ProFormText
          style={{ marginTop: '60px' }}
          name="remark"
          labelAlign={'left'}
          label={FormattedMessage({ id: 'common.remark' })}
          rules={[{ required: true }]}
        />
      </ModalForm>
      {/* 二次结算Modal */}
      <ModalForm<any>
        modalProps={{
          destroyOnClose: true,
          afterClose: () => {
            secForm.formRef.current?.resetFields();
            setfirst([]);
            setsecond(null);
            setinitVals({});
          },
        }}
        onVisibleChange={secForm.setShow}
        formRef={secForm.formRef}
        visible={secForm.show}
        initialValues={initVals}
        syncToInitialValues
        rowProps={{
          gutter: [16, 16],
        }}
        submitter={{
          // 定制提交按钮文字
          searchConfig: {
            submitText: <FormattedMessage id="colorLottery.submit" />,
          },
        }}
        colProps={{
          span: 12,
        }}
        title={<FormattedMessage id="record.lottery.reSettlement" defaultMessage="二次结算" />}
        onFinish={async ({ remark, ...rest }) => {
          if (!remark) {
            message.error(FormattedMessage({ id: 'record.lottery.reSettlement.remark' }));
            return false;
          }

          const second_settle_first_result = first.join('');
          const second_settle_second_result = second;

          if (!second_settle_first_result) {
            message.error(
              FormattedMessage({ id: 'record.lottery.reSettlement.select.result.tip' }),
            );
            return false;
          }

          // 如果第一次开奖结果 和 第二次开奖结果一样  则不允许提交
          if (
            second_settle_first_result === rest.first_draw_result &&
            second_settle_second_result === rest.second_draw_result
          ) {
            message.error(FormattedMessage({ id: 'record.lottery.reSettlement.repeat.tip' }));
            return false;
          }

          const params = {
            remark,
            second_settle_first_result,
            second_settle_second_result,
            seq: secForm.data.seq,
          };

          Modal.confirm({
            title: '确认二次结算',
            content: (
              <ProCard.Group direction={'column'}>
                <ProCard title={FormattedMessage({ id: 'record.lottery.reSettlement.1.result' })}>
                  <p>
                    <FormattedMessage id="record.lottery.reSettlement.prize1.result" />:{' '}
                    <ColorGameResult
                      colors={initVals.first_draw_result}
                      game_type={initVals.game_type}
                    />
                  </p>
                  <p>
                    <FormattedMessage id="record.lottery.reSettlement.prize2.result" />: :{' '}
                    {RenderSecPrize(initVals)}
                  </p>
                </ProCard>

                <ProCard title={FormattedMessage({ id: 'record.lottery.reSettlement.2.result' })}>
                  <p>
                    <FormattedMessage id="common.first_draw_result" /> :
                    <ColorGameResult
                      colors={second_settle_first_result}
                      game_type={initVals.game_type}
                    />
                  </p>
                  <p>
                    <FormattedMessage id="common.second_draw_result" /> :
                    <span
                      style={{
                        color: 'red',
                        fontSize: '20px',
                        fontWeight: 'bold',
                      }}
                    >
                      {
                        getJackpotOptions(secForm?.data?.game_type)?.find(
                          (item) => item.value === second_settle_second_result,
                        )?.label
                      }
                    </span>
                  </p>
                </ProCard>

                <p>
                  <FormattedMessage id="record.lottery.reSettlement.remark" />：{' '}
                  <span
                    style={{
                      color: 'red',
                      fontSize: '20px',
                      fontWeight: 'bold',
                    }}
                  >
                    {remark}
                  </span>
                </p>
              </ProCard.Group>
            ),
            onOk: async () => {
              const res = await secSettle(params);

              if (res.success) {
                secForm.formRef.current?.resetFields();
                setfirst([]);
                setsecond(null);
                setinitVals({});
                actionRef.current?.reload();
                secForm.setShow(false);

                // 给出操作成功提示
                message.success('Success');

                return true;
              } else {
                // 给出操作失败提示
                // message.error('操作失败');

                return false;
              }
            },
          });

          // const res = await secSettle(params);

          // if (res.success) {
          //   secForm.formRef.current?.resetFields();
          //   setfirst([]);
          //   setsecond(null);
          //   setinitVals({});
          //   actionRef.current?.reload();
          //   return true;
          // } else {
          //   return false;
          // }
        }}
      >
        <ProFormGroup>
          <ProFormText
            readonly
            width="md"
            name="operator"
            label={FormattedMessage({ id: 'record.draw_person' })}
          />
          <ProFormSelect
            readonly
            width="md"
            name="status"
            label={formatMessage({ id: 'record.lottery.status', defaultMessage: '开奖状态' })}
            options={[
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
              {
                label: formatMessage({ id: 'dict.lottery_status.7', defaultMessage: '二次结算' }),
                value: 7,
              },
            ]}
          />
          <ProFormDateTimePicker
            readonly
            width="md"
            name="first_draw_time"
            label={formatMessage({
              id: 'common.first_draw_time',
              defaultMessage: '第一次开奖时间',
            })}
          />
          <ProFormDateTimePicker
            readonly
            width="md"
            name="second_draw_time"
            label={formatMessage({
              id: 'common.second_draw_time',
              defaultMessage: '第二次开奖时间',
            })}
          />
          {/* <ProFormText readonly width="md" name="first_draw_result" label="第一次开奖结果" /> */}
          <ProDescriptions
            layout="horizontal"
            dataSource={initVals}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage id="common.first_draw_result" defaultMessage="第一次开奖结果" />
                ),
                dataIndex: 'first_draw_result',
                render: (v) => {
                  return <ColorGameResult colors={v as string} game_type={initVals.game_type} />;
                },
              },
              {
                label: (
                  <FormattedMessage
                    id="common.second_draw_result"
                    defaultMessage="第二次开奖结果"
                  />
                ),
                dataIndex: 'second_draw_result',
                render: (v) => {
                  // 奖池玩法
                  if (initVals.code_type === 'JP' || initVals.game_code_type === 'JP') {
                    const value = initVals.second_draw_result;
                    return value == 88801
                      ? 'minor jackpot'
                      : value == 88802
                      ? 'major jackpot'
                      : value == 88803
                      ? 'grand jackpot'
                      : value
                      ? `${value} ${FormattedMessage({ id: 'record.order.multiple' })}`
                      : initVals.award_amount || '-';
                  }
                  // if (initVals.code_type === 'SG') {

                  // const value = initVals.second_draw_result;
                  return initVals?.prize_type < 88801 && initVals?.prize_type > 0
                    ? `${initVals?.prize_type} ${FormattedMessage({ id: 'record.order.multiple' })}`
                    : '-';
                },
              },
            ]}
          />

          {/* <ProFormText readonly width="md" name="second_draw_result" label="第二次开奖结果" /> */}

          <ProFormSelect
            readonly
            width="md"
            name="game_type"
            label={FormattedMessage({ id: 'record.lottery.game_type', defaultMessage: '游戏类型' })}
            options={[
              { label: 'Color Game', value: 1 },
              { label: 'DROP BALL GAME', value: 2 },
            ]}
          />
          <ProFormSelect
            readonly
            width="md"
            name="game_code_type"
            label={FormattedMessage({ id: 'record.play_type', defaultMessage: '玩法类型' })}
            options={[
              { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
              { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
            ]}
          />
          <ProFormText
            readonly
            width="md"
            name="seq"
            label={FormattedMessage({ id: 'record.order.seq', defaultMessage: '游戏期号' })}
          />
          <ProFormDateTimePicker
            readonly
            name="created_at"
            label={FormattedMessage({ id: 'record.lottery.open_time', defaultMessage: '开始时间' })}
          />
          {/* <ProFormText readonly width="md" name="device_type" label="终端" />
          <ProFormText readonly width="md" name="ip" label="IP" />
          <ProFormText readonly width="md" name="currency" label="币种" /> */}
        </ProFormGroup>

        <ProCard.Group
          title={FormattedMessage({ id: 'record.second_settlement_entry' })}
          direction={'column'}
          style={{
            userSelect: 'none',
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '10px',
          }}
        >
          <h1
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              // justifyContent: 'center',
            }}
          >
            <p>{FormattedMessage({ id: 'common.first_draw_result' })}</p>

            <Button
              danger
              onClick={() => {
                setfirst([]);
                setsecond(null);
              }}
            >
              {FormattedMessage({ id: 'colorLottery.clear', defaultMessage: '清除' })}
            </Button>

            <ul
              style={{
                border: '1px #ccc dashed',
                display: first.length ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                margin: '0 10px',
                borderRadius: '5px',
              }}
            >
              {first.map((item: any, index) => {
                const itemStyles: React.CSSProperties =
                  secForm?.data?.game_type == 1
                    ? {
                        width: '80px',
                        height: '50px',
                        backgroundColor: colorGameColors[item - 1],
                        boxShadow: '0 0 5px #ccc',
                        cursor: 'pointer',
                        borderRadius: '5px',
                      }
                    : {
                        width: '60px',
                        height: '60px',
                        backgroundImage: `url(${dropGameBgs[item - 1]})`,
                        backgroundSize: '100% 100%',
                        boxShadow: '0 0 5px #ccc',
                        cursor: 'pointer',
                        borderRadius: '5px',
                      };
                return (
                  <li key={item} style={{ display: 'inline-block', margin: '0 10px' }}>
                    <div style={itemStyles} />
                  </li>
                );
              })}
            </ul>
          </h1>
          <ul
            style={{
              // 每行三个
              width: '300px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              paddingLeft: '0',
            }}
          >
            {new Array(6).fill('').map((item, index) => {
              const itemStyles: React.CSSProperties =
                secForm?.data?.game_type == 1
                  ? {
                      width: '80px',
                      height: '50px',
                      backgroundColor: colorGameColors[index],
                      boxShadow: '0 0 5px #ccc',
                      cursor: 'pointer',
                      borderRadius: '5px',
                    }
                  : {
                      width: '60px',
                      height: '60px',
                      backgroundImage: `url(${dropGameBgs[index]})`,
                      backgroundSize: '100% 100%',
                      boxShadow: '0 0 5px #ccc',
                      cursor: 'pointer',
                      borderRadius: '5px',
                    };
              return (
                <li key={index} style={{ display: 'inline-block', margin: '0 10px' }}>
                  <div
                    style={itemStyles}
                    onClick={() => {
                      // 最多选中三个
                      if (first.length >= 3) {
                        return;
                      }

                      setfirst([...first, index + 1]);
                    }}
                  />
                </li>
              );
            })}
          </ul>

          <div
            style={{
              // 如果第一次开奖结果有三个且都一样 显示二次开奖结果
              display: first.length === 3 && new Set(first).size === 1 ? 'block' : 'none',
            }}
          >
            <h1>
              {FormattedMessage({
                id: 'common.second_draw_result',
                defaultMessage: '二次开奖结果',
              })}
            </h1>

            <ProCard>
              {/* 每行四个 间距30px */}
              <ul
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '30px',
                  paddingLeft: '0',
                }}
              >
                {getJackpotOptions(secForm?.data?.game_type).map((item) => (
                  <li key={item.value} style={{ margin: '0 10px' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '70px',
                        boxShadow: '0 0 5px #ccc',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: second === item.value ? '10px solid #f00' : '',
                        borderRadius: '5px',
                      }}
                      onClick={
                        // 最多选中一个
                        () => setsecond(item.value)
                      }
                    >
                      {item.value}
                    </div>
                  </li>
                ))}
              </ul>
            </ProCard>
          </div>

          <ProFormText
            width="md"
            name="remark"
            label={FormattedMessage({ id: 'record.second_settlement_remarks' })}
          />
        </ProCard.Group>
      </ModalForm>
    </PageHeaderWrapper>
  );
};
