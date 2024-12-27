import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest } from 'umi';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
} from '@ant-design/pro-components';
import { Button, DatePicker, Descriptions, Modal, Row } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne } from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({
        id: 'reprot.bill.BillTime',
        defaultMessage: '账单时间',
      }),
      dataIndex: 'BillTime',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'merchant.merchant_name',
        defaultMessage: 'merchant_code',
      }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
      // hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'reprot.bill.plan_name',
        defaultMessage: '费率方案',
      }),
      dataIndex: 'plan_name',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'common.dateTimeRange', defaultMessage: '$2' }),
      dataIndex: 'dateTimeRange',
      // valueType: 'dateRange',
      fieldProps: {
        // ranges: {
        //   今天: [moment().subtract(0, 'days'), moment()],
        //   昨天: [moment().subtract(1, 'days'), moment()],
        //   近七天: [moment().subtract(7, 'days'), moment()],
        //   近三十天: [moment().subtract(30, 'days'), moment()],
        //   '近三个月（90天）': [moment().subtract(90, 'days'), moment()],
        // },
      },
      search: {
        transform: (value: any) => {
          const bill_time_start = moment(value[0]).format('YYYY-MM');
          const bill_time_end = moment(value[1]).format('YYYY-MM');
          return {
            bill_time_start,
            bill_time_end,
          };
        },
      },
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        return <DatePicker.RangePicker picker="month" />;
      },
      hideInTable: true,
      hideInForm: true,
    },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.id',
    //     defaultMessage: 'id',
    //   }),
    //   dataIndex: 'id',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.merchant_id',
    //     defaultMessage: 'merchant_id',
    //   }),
    //   dataIndex: 'merchant_id',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({
        id: 'merchant.plan_name',
        defaultMessage: '佣金方式',
      }),
      dataIndex: 'commission_type',
      hideInSearch: true,
      valueType: 'select',
      async request() {
        return [
          // 暂时只支持固定金额
          {
            label: FormattedMessage({ id: 'dict.plan_name.0' }),
            value: 1,
          },
          {
            label: FormattedMessage({ id: 'dict.plan_name.1' }),
            value: 2,
          },
        ];
      },
    },
    {
      title: FormattedMessage({
        id: 'reprot.bill.flow_amount',
        defaultMessage: '流水金额',
      }),
      dataIndex: 'flow_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // {
    //   title: FormattedMessage({ id: 'reprot.bill.pool_amount', defaultMessage: 'pool_amount' }),
    //   dataIndex: 'pool_amount',
    // },
    {
      title: FormattedMessage({
        id: 'reprot.bill.profit_amount',
        defaultMessage: '盈利金额',
      }),
      dataIndex: 'profit_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    {
      // 礼物金额
      title: FormattedMessage({ id: 'record.host.tip', defaultMessage: '小费' }),
      dataIndex: 'gift_price',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    {
      title: FormattedMessage({
        id: 'bill.reBack',
        defaultMessage: '奖池抽成',
      }),
      dataIndex: 'pool_amount',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({
        id: 'reprot.bill.commission_amount',
        defaultMessage: '抽成金额',
      }),
      dataIndex: 'Commission_money',
      hideInSearch: true,
      // valueType: 'okAmount' as any,
      render: (v: any) => (v > 0 ? v : 0),
    },
    {
      title: FormattedMessage({
        id: 'ratePlan.pool_rate_new',
        defaultMessage: '抽成费率',
      }),
      dataIndex: 'tiered_rate',
      hideInSearch: true,
      render: (v: any) => (v / 10000).toFixed(2) + '%',
    },

    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.bill_amount1',
    //     defaultMessage: '佣金费用',
    //   }),
    //   dataIndex: 'bill_money',
    //   hideInSearch: true,
    //   // render: (v: any, record) => (record?.Commission_money > 0 ? record?.Commission_money : 0),
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.bill_amount2',
    //     defaultMessage: '奖池抽成金额',
    //   }),
    //   dataIndex: 'bill_money',
    //   hideInSearch: true,
    //   // render: (v: any, record) => (record?.Commission_money > 0 ? record?.Commission_money : 0),
    // },
    {
      title: FormattedMessage({
        id: 'reprot.bill.other_amount',
        defaultMessage: '其他费用',
      }),
      dataIndex: 'other_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },

    {
      title: FormattedMessage({
        id: 'reprot.bill.bill_amount',
        defaultMessage: '账单金额',
      }),
      dataIndex: 'bill_money',
      hideInSearch: true,
      // render: (v: any, record) => (record?.Commission_money > 0 ? record?.Commission_money : 0),
    },
    {
      title: FormattedMessage({
        id: 'record.order.prize_amount',
        defaultMessage: '派奖金额',
      }),
      dataIndex: 'prize_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // {
    //   title: FormattedMessage({
    //     id: 'ratePlan.other_fee',
    //     defaultMessage: 'other_fee',
    //   }),
    //   dataIndex: 'other_fee',
    //   hideInSearch: true,
    //   valueType: 'winLoseRate',
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.rate_plan_id',
    //     defaultMessage: 'rate_plan_id',
    //   }),
    //   dataIndex: 'rate_plan_id',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.updated_at',
    //     defaultMessage: 'updated_at',
    //   }),
    //   dataIndex: 'updated_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.created_by',
    //     defaultMessage: 'created_by',
    //   }),
    //   dataIndex: 'created_by',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.updated_by',
    //     defaultMessage: 'updated_by',
    //   }),
    //   dataIndex: 'updated_by',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'reprot.bill.site_id',
    //     defaultMessage: 'site_id',
    //   }),
    //   dataIndex: 'site_id',
    //   hideInSearch: true,
    // },

    {
      title: FormattedMessage({ id: 'bill.listDetail', defaultMessage: '账单明细' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        <ActionAnchor
          key="edit"
          access="/report/bill_view"
          onClick={() => {
            Modal.info({
              title: FormattedMessage({
                id: 'trAdd.billDetail',
                defaultMessage: '账单详情',
              }),
              width: 1000,
              content: (
                <>
                  {/* <Descriptions>
                    <DescriptionsItem label="账单金额">{record.bill_amount}</DescriptionsItem>
                  </Descriptions> */}
                  <ProDescriptions
                    dataSource={record}
                    column={4}
                    columns={[
                      {
                        title: FormattedMessage({
                          id: 'merchant.merchant_name',
                          defaultMessage: 'merchant_name',
                        }),
                        dataIndex: 'merchant_code',
                      },
                      {
                        title: FormattedMessage({
                          id: 'reprot.bill.plan_name',
                          defaultMessage: '费率方案',
                        }),
                        dataIndex: 'plan_name',
                      },
                      {
                        title: FormattedMessage({
                          id: 'reprot.bill.BillTime',
                          defaultMessage: '账单周期',
                        }),
                        dataIndex: 'BillTime',
                      },
                      {
                        title: '',
                        render: () => '',
                      },
                      {
                        title: FormattedMessage({
                          id: 'reprot.bill.minimum_charge',
                          defaultMessage: '保底费用',
                        }),
                        dataIndex: 'minimum_charge',
                        render: () => <span>{Number(record.minimum_charge) / 100}</span>,
                      },
                      {
                        title: FormattedMessage({
                          id: 'ratePlan.commission_type',
                          defaultMessage: '佣金方式',
                        }),
                        dataIndex: 'commission_type',
                        async request() {
                          return [
                            // 暂时只支持固定金额
                            {
                              label: FormattedMessage({ id: 'dict.plan_name.0' }),
                              value: 1,
                            },
                            {
                              label: FormattedMessage({ id: 'dict.plan_name.1' }),
                              value: 2,
                            },
                          ];
                        },
                      },
                      {
                        title: FormattedMessage({
                          id: 'ratePlan.pool_rate',
                          defaultMessage: '佣金方式',
                        }),
                        dataIndex: '__',
                        render: () => (
                          <span>{`${Number((record as any)?.pool_rate) / 10000}%`}</span>
                        ),
                      },

                      {
                        title: FormattedMessage({
                          id: 'reprot.bill.other_amount',
                          defaultMessage: '其他费用',
                        }),
                        dataIndex: 'other_amount',
                        render: () => <span>{Number(record.other_amount) / 100}</span>,
                        // valueType: 'okAmount' as any, 用okAmount 不行
                      },

                      // {
                      //   title: FormattedMessage({
                      //     id: 'reprot.bill.tiered_rate',
                      //     defaultMessage: '抽成费率',
                      //   }),
                      //   dataIndex: 'tiered_rate',
                      // },
                      // {
                      //   title: FormattedMessage({
                      //     id: 'reprot.bill.flow_amount',
                      //     defaultMessage: '流水金额',
                      //   }),
                      //   dataIndex: 'flow_amount',
                      // },
                    ]}
                  />

                  <Row style={{ gap: '80px' }}>
                    <div className="left" style={{ display: 'flex' }}>
                      {/* {FormattedMessage({
                        id: 'reprot.bill.tiered_rate',
                        defaultMessage: '抽成费率',
                      })}
                      : */}
                      <ul>
                        {record?.rate_plan_res?.tired_rate_res?.map((item: any) => {
                          return (
                            <Row key={item.id} justify={'space-between'} style={{ width: '160px' }}>
                              <span>{item.target_performance}</span>
                              <span>{item.tiered_rate / 10000}%</span>
                            </Row>
                          );
                        })}
                      </ul>
                    </div>
                    <div className="right" style={{ flex: '1', lineHeight: '1.5' }}>
                      <div>
                        {FormattedMessage({ id: 'trAdd.amount', defaultMessage: '本期流水' })}：
                        {Number(record.flow_amount) / 100}
                      </div>
                      <Row
                        justify={'space-between'}
                        style={{ background: '#0000001a', lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>{FormattedMessage({ id: 'ratePlan.project' })}</span>
                        <span>{FormattedMessage({ id: 'ratePlan.rate' })}</span>
                      </Row>
                      <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({
                            id: 'reprot.bill.minimum_charge',
                            defaultMessage: '保底费用',
                          })}
                        </span>
                        <span>-</span>
                        <span>{Number(record.minimum_charge) / 100}</span>
                      </Row>
                      <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>{FormattedMessage({ id: 'ratePlan.tiered_rate' })}</span>
                        <span>{record.commission_detail}</span>
                        <span>{record.Commission_money} </span>
                      </Row>
                      <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({
                            id: 'reprot.bill.pool_amount',
                            defaultMessage: 'pool_amount',
                          })}
                        </span>
                        <span>-</span>

                        <span>{record.pool_amount}</span>
                      </Row>
                      <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({
                            id: 'reprot.bill.other_amount',
                            defaultMessage: '其他费用',
                          })}
                        </span>
                        <span>-</span>
                        <span>{Number(record.other_amount) / 100}</span>
                      </Row>
                      {/* <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({
                            id: 'record.host.tip',
                            defaultMessage: '小费',
                          })}
                        </span>
                        <span>-</span>
                        <span>{Number(record.merchant_gift_price) / 100}</span>
                      </Row> */}
                      <Row
                        justify={'space-between'}
                        style={{ lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({
                            id: 'record.host.tip',
                            defaultMessage: '小费',
                          })}
                        </span>
                        <span>{record.gift_price_detail}</span>
                        <span>{record.merchant_gift_price as any}</span>
                      </Row>
                      <Row
                        justify={'space-between'}
                        style={{ background: '#0000001a', lineHeight: '2', padding: '4px 10px ' }}
                      >
                        <span>
                          {FormattedMessage({ id: 'trAdd.total', defaultMessage: '汇总' })}
                        </span>
                        <span>{record.bill_money}</span>
                      </Row>
                    </div>
                  </Row>
                </>
              ),
            });
          }}
        >
          {FormattedMessage({ id: 'common.daily.detail.view', defaultMessage: '查看明细' })}
        </ActionAnchor>,
      ],
    },
  ];

  useEffect(() => {
    formRef?.current?.resetFields?.();
  }, [show]);

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        // manualRequest={true}
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
        // toolBarRender={() => [
        //   <ActionBtn
        //     access="can__Insert"
        //     type="primary"
        //     onClick={() => {
        //       setShow(true);
        //       setIsEdit(false);
        //     }}
        //     key="add"
        //   >
        //     <FormattedMessage id="pages.new" />
        //   </ActionBtn>,
        // ]}
      />
      {/* <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={setShow}
        formRef={formRef}
        visible={show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        title={isEdit ? FormattedMessage({id:'common.edit'}) : FormattedMessage({ id:'pages.new'})}
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {

          if (isEdit) {
            await edit({ ...editData, ...values });
          } else {
            await create(values);
          }
          return true;
        }}
        columns={columns as any}
      /> */}
    </PageHeaderWrapper>
  );
};
