import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { formatMessage, useIntl, useModel, useRequest } from 'umi';
import { useEffect, useRef, useState } from 'react';
import FormattedMessage from '@/components/FormattedMessage';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProFormList,
  ProFormColumnsType,
  ProFormGroup,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Table } from 'antd';
import moment from 'moment';
import math from '@/utils/math';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { ratePlanQuery, create, edit, getOne, deleteOne, editStatus } from './service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { omit, pick } from 'lodash';
import type { BigNumber } from 'mathjs';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'ratePlan.plan_name', defaultMessage: 'plan_name' }),
      dataIndex: 'plan_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({
        id: 'ratePlan.commission_type',
        defaultMessage: 'commission_type',
      }),
      dataIndex: 'commission_type',
      valueType: 'select',
      async request() {
        return [
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
      title: FormattedMessage({ id: 'ratePlan.enable_status', defaultMessage: 'enable_status' }),
      dataIndex: 'enable_status',
      request: () => optionDictDataSelect({ dictType: 'enable_status' }, true),
      valueType: 'select',
    },
    {
      title: FormattedMessage({ id: 'ratePlan.created_at', defaultMessage: 'created_at' }),
      dataIndex: 'created_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({ id: 'ratePlan.updated_at', defaultMessage: 'updated_at' }),
      dataIndex: 'updated_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // {
    //   title: FormattedMessage({ id: 'ratePlan.id', defaultMessage: 'id' }),
    //   dataIndex: 'id',
    //   hideInSearch: true,
    // },

    {
      title: FormattedMessage({ id: 'ratePlan.remark', defaultMessage: 'remark' }),
      dataIndex: 'remark',
      hideInSearch: true,
    },

    {
      title: <FormattedMessage id="common.option" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        <ActionAnchor
          key="edit"
          access="/merchant/rate-plan_update"
          onClick={() => {
            setShow(true);
            setIsEdit(true);
            setEditData(record);
            setTimeout(() => {
              formRef?.current?.setFieldsValue?.({
                ...record,
                minimum_charge: math.divide(math.number(record.minimum_charge), 100),
                other_fee: math.divide(math.number(record.other_fee), 100),
                // tiered_rate: math.divide(math.number(record.tiered_rate), 100),
                tiered_rates: record.tired_rate_res,
              });
            }, 300);
          }}
        >
          <FormattedMessage id="common.edit" />
        </ActionAnchor>,
        <ActionAnchor
          key="edit"
          access="/merchant/rate-plan_update"
          action={async () => {
            await editStatus({
              ...record,
              commission_type: record.commission_type || 2,
              enable_status: record.enable_status === 1 ? 2 : 1,
            });
            actionRef?.current?.reload();
          }}
        >
          {record.enable_status === 2 ? (
            <FormattedMessage id="common.open" />
          ) : (
            <FormattedMessage id="common.close" />
          )}
        </ActionAnchor>,
      ],
    },
  ];

  useEffect(() => {
    formRef?.current?.resetFields?.();
  }, [show]);
  const formColumns: ProFormColumnsType<any>[] = [
    // {
    //   valueType: 'group',
    //   columns: [
    {
      title: FormattedMessage({ id: 'ratePlan.plan_name', defaultMessage: 'plan_name' }),
      dataIndex: 'plan_name',
      width: '100%',
      colProps: {
        xs: 12,
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },

    //   ],
    // },
    {
      title: FormattedMessage({
        id: 'ratePlan.commission_type',
        defaultMessage: 'commission_type',
      }),
      dataIndex: 'commission_type',
      hideInSearch: true,
      valueType: 'select',
      async request() {
        return [
          {
            label: formatMessage({ id: 'dict.plan_name.0' }),
            value: 1,
          },
          {
            label: formatMessage({ id: 'dict.plan_name.1' }),
            value: 2,
          },
        ];
      },
      fieldProps: {
        // value: 2,
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'ratePlan.minimum_charge', defaultMessage: 'minimum_charge' }),
      dataIndex: 'minimum_charge',
      hideInSearch: true,
      width: '100%',
      valueType: 'digit',
      fieldProps: {
        // addonAfter: '%',
        precision: 0,
        min: 0,
        // max: 100,
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },

    {
      title: FormattedMessage({ id: 'ratePlan.pool_rate', defaultMessage: 'pool_rate' }),
      // dataIndex: 'pool_rate',
      // initialValue: [{ pool_rate1: 1.5 }, { pool_rate: 1.48 }, { pool_rate: 1.0 }],
      hideInSearch: true,
      width: '100%',
      // valueType: 'digit',
      valueType: 'group',

      columns: [
        {
          title: FormattedMessage({ id: 'ratePlan.pool_rate1', defaultMessage: 'Color Game' }),
          dataIndex: 'pool_rate1',
          valueType: 'digit',
          width: 'xs',
          fieldProps: {
            addonAfter: '%',
            precision: 2,
            min: 0,
            max: 100,
            disabled: true,
          },
          initialValue: 1.5,

          formItemProps: {
            rules: [
              {
                required: true,
              },
            ],
          },
        },
        {
          title: FormattedMessage({ id: 'ratePlan.pool_rate2', defaultMessage: 'DropBallGame' }),
          dataIndex: 'pool_rate2',
          valueType: 'digit',
          width: 'xs',
          fieldProps: {
            addonAfter: '%',
            precision: 2,
            min: 0,
            max: 100,
            disabled: true,
          },
          initialValue: 1.48,
          formItemProps: {
            rules: [
              {
                required: true,
              },
            ],
          },
        },
        {
          title: FormattedMessage({ id: 'ratePlan.pool_rate3', defaultMessage: 'DragonGate' }),
          dataIndex: 'pool_rate3',
          valueType: 'digit',
          width: 'xs',
          fieldProps: {
            addonAfter: '%',
            precision: 2,
            min: 0,
            max: 100,
            disabled: true,
          },
          initialValue: 1.49,
          formItemProps: {
            rules: [
              {
                required: true,
              },
            ],
          },
        },
      ],
      // fieldProps: {
      //   // value: FormattedMessage({ id: 'trAdd.countTip', defaultMessage: '以实际概率计算' }),
      //   // Color Game   1.50%
      //   // DropBallGame  1.48%
      //   // DragonGate   1.0%

      //   value: (
      //     <div>
      //       <p>1</p>
      //       <p>2</p>
      //       <p>3</p>
      //     </div>
      //   ),
      //   disabled: true,
      // },
      // formItemProps: {
      //   rules: [
      //     {
      //       required: true,
      //     },
      //   ],
      // },
    },

    // {
    //   title: FormattedMessage({ id: 'ratePlan.pool_rate', defaultMessage: 'pool_rate' }),
    //   dataIndex: 'pool_rate',
    //   hideInSearch: true,
    //   width: '100%',
    //   valueType: 'digit',
    //   fieldProps: {
    //     addonAfter: '%',
    //     precision: 2,
    //     min: 0,
    //     max: 100,
    //   },
    //   formItemProps: {
    //     rules: [
    //       {
    //         required: true,
    //       },
    //     ],
    //   },
    // },
    {
      title: FormattedMessage({ id: 'ratePlan.other_fee', defaultMessage: 'other_fee' }),
      dataIndex: 'other_fee',
      valueType: 'digit',
      width: '100%',
      hideInSearch: true,
      fieldProps: {
        // addonAfter: '%',
        precision: 0,
        min: 0,
        // max: 100,
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'ratePlan.tiered_rate', defaultMessage: 'tiered_rate' }),
      dataIndex: 'tired_rate_res',
      valueType: 'formList',
      width: '100%',
      hideInSearch: true,
      // initialValue: [{ target_performance: 50000, tiered_rate: 6000 }],
      initialValue: [{ performance_rate: '50000-0.9%, 60000-0.5%, 70000-0.4%' }],

      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: FormattedMessage({ id: 'trAddPerformance', defaultMessage: '所需业绩' }),
              dataIndex: 'target_performance',
              valueType: 'digit',
              width: 'xs',
            },
            {
              title: FormattedMessage({ id: 'risk.comm_ratio', defaultMessage: '抽成比例' }),
              dataIndex: 'tiered_rate',
              width: 'md',
              valueType: 'digit',
              fieldProps: {
                formatter: (value = 0) =>
                  `${math.divide(math.number(isNaN(+value) ? 0 : value), 10000)}%`,
                parser: (value) =>
                  // 乘以 100
                  {
                    try {
                      return (
                        math.multiply(
                          math.bignumber(
                            isNaN(Number(value!.replace('%', ''))) ? 0 : value!.replace('%', ''),
                          ),
                          10000,
                        ) as BigNumber
                      ).toNumber();
                    } catch (error) {
                      return 0;
                    }
                  },
                min: 0,
                max: 1000000,
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: '此项为必填项',
                  },
                ],
              },
            },
          ],
        },
      ],
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    // {
    //   title: FormattedMessage({ id: 'ratePlan.pool_rate', defaultMessage: 'pool_rate' }),
    //   dataIndex: 'pool_rate',
    //   hideInSearch: true,
    // },
  ];

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
          const res = await ratePlanQuery(objValTrim(omitEmpty(params)));

          res.data.map(({ tired_rate_res }: any) => {
            const { performance_rate } = tired_rate_res[0];
            if (performance_rate) {
              performance_rate.split(', ').map((item: any, idx: number) => {
                const [target_performance, tiered_rate] = item.split('-');
                tired_rate_res[idx] = {
                  ...tired_rate_res[idx],
                  target_performance,
                  tiered_rate: Number(tiered_rate.replace('%', '')),
                };
              });
            }
          });

          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
        toolBarRender={() => [
          <ActionBtn
            access="/merchant/rate-plan_insert"
            type="primary"
            onClick={() => {
              setShow(true);
              setIsEdit(false);
            }}
            key="add"
          >
            <FormattedMessage id="pages.new" />
          </ActionBtn>,
        ]}
      />
      <BetaSchemaForm<any>
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
        title={
          isEdit ? FormattedMessage({ id: 'common.edit' }) : FormattedMessage({ id: 'pages.new' })
        }
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {
          values.pool_rate = 14900;
          values.commission_type = values.commission_type || 2;

          // debugger;

          if (isEdit) {
            const performance_rate = values.tired_rate_res
              .map((item: any) => `${item.target_performance}-${item.tiered_rate}%`)
              .join(', ');

            const tiered_rates = [
              {
                currency: 'php',
                performance_rate,
              },
            ];

            await edit({
              ...omit(editData, 'tired_rate_res'),
              ...values,
              tiered_rates,
              other_fee: values.other_fee * 100,
              minimum_charge: values.minimum_charge * 100,
              // other_fee: values.other_fee * 100,
              // tiered_rate: values.tiered_rate * 100,
            });
          } else {
            const performance_rate = (values.tiered_rates || values.tired_rate_res)
              .map((item: any) => `${item.target_performance}-${item.tiered_rate}%`)
              .join(', ');

            const tiered_rates = [
              {
                currency: 'php',
                performance_rate,
              },
            ];
            await create({
              ...values,
              tiered_rates,
              other_fee: values.other_fee * 100,
              minimum_charge: values.minimum_charge * 100,
              // pool_rate: values.pool_rate * 100,
              // tiered_rate: values.tiered_rate * 100,
            });
          }
          actionRef?.current?.reload();
          return true;
        }}
        columns={formColumns as any}
      />
    </PageHeaderWrapper>
  );
};
