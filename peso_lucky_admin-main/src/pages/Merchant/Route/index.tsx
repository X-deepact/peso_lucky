import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage, useAccess } from 'umi';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProFormColumnsType,
  ProFormCascader,
} from '@ant-design/pro-components';
import { Button, Switch } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import {
  query,
  create,
  edit,
  changeStatus,
  deleteOne,
  queryGameAddInfo,
  queryGameUdpInfo,
} from './service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { sleep } from '@/utils/sleep';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';
import { entries, find, groupBy, isNumber } from 'lodash';
import { Cascader } from 'antd';
import { flatten } from '@antv/util';
import { ratePlanQuery } from '../RatePlan/service';
import { currencySelectOption } from '@/utils/options';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const [gameInfos, setGameInfos] = useState<any>();
  const [merchant_id, setMerchant_id] = useState<any>();
  const access = useAccess();
  const intl = useIntl();
  const tabelColumns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'merchant.merchant_name', defaultMessage: 'merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      title: FormattedMessage({ id: 'merchant.merchant_agent', defaultMessage: 'merchant_agent' }),
      dataIndex: 'merchant_agent',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.domain_url', defaultMessage: 'domain_url' }),
      dataIndex: 'domain_url',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.enable_status', defaultMessage: 'enable_status' }),
      dataIndex: 'enable_status',
      request: () => optionDictDataSelect({ dictType: 'enable_status' }, true),
      hideInTable: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.enable_status', defaultMessage: 'enable_status' }),
      dataIndex: 'enable_status',
      request: () => optionDictDataSelect({ dictType: 'enable_status' }, true),
      hideInSearch: true,
      render(dom, record) {
        return (
          <Switch
            checked={record.enable_status === 1}
            checkedChildren={formatMessage({ id: 'dict.enable_status.1' })}
            unCheckedChildren={formatMessage({ id: 'dict.enable_status.2' })}
            onClick={async () => {
              await changeStatus({
                id: String(record.id),
                enable_status: record.enable_status === 1 ? 2 : 1,
              });
              console.log(record);
              actionRef.current?.reload();
            }}
          />
        );
      },
      fieldProps: {
        disabled: access.checkAccess('/merchant/route-manage_update_status'),
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.platform_fee', defaultMessage: 'platform_fee' }),
      dataIndex: 'plan_name',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.account_type', defaultMessage: 'account_type' }),
      dataIndex: 'account_type',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.created_at', defaultMessage: 'created_at' }),
      dataIndex: 'created_at',
      hideInSearch: true,

      valueType: 'dateTime',
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
          access="/merchant/route-manage_update"
          action={async () => {
            // const res = await queryGameUdpInfo({
            //   current: 1,
            //   pageSize: 10000,
            //   merchant_id: record.merchant_id,
            // });
            setMerchant_id(record.id);
            setShow(true);
            setIsEdit(true);
            setEditData({ ...record, account_type: Number(record.account_type) || 1 });
            await sleep(300);
            formRef?.current?.setFieldsValue?.({
              ...record,
              account_type: Number(record.account_type) || 1,
            });
          }}
        >
          <FormattedMessage id="common.edit" />
        </ActionAnchor>,
      ],
    },
  ];
  const columns: (ProColumns<ListItem> & ProFormColumnsType<ListItem>)[] = [
    {
      renderFormItem() {
        return (
          <h1>
            {intl.formatMessage({
              id: 'trAdd.lineInfo',
              defaultMessage: '线路信息',
            })}
          </h1>
        );
      },
    },
    {
      renderFormItem() {
        return <h1 />;
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.id', defaultMessage: 'id' }),
      dataIndex: 'id',
      hideInForm: true,
    },
    {
      title: FormattedMessage({ id: 'merchant.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
      hideInTable: true,
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: <FormattedMessage id="merchant.rate_plan_name" defaultMessage="费率方案" />,
      dataIndex: 'rate_plan_id',
      hideInSearch: true,
      async request() {
        const res = await ratePlanQuery({ current: 1, pageSize: 10000 });
        return res.data.map((v) => ({
          label: `${v.plan_name} ${
            v.enable_status === 2
              ? `【${FormattedMessage({
                  id: 'dict.game_status.' + v.enable_status,
                })}中】`
              : ''
          }`,
          value: v.id,
          disabled: v.enable_status === 2,
        }));
      },
      // formItemProps: {
      //   rules: [
      //     {
      //       required: true,
      //     },
      //   ],
      // },
    },
    {
      title: FormattedMessage({ id: 'merchant.merchant_name', defaultMessage: 'merchant_name' }),
      dataIndex: 'merchant_name',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.contact_no', defaultMessage: 'contact_no' }),
      dataIndex: 'contact_no',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({
        id: 'merchant.business_connect',
        defaultMessage: 'business_connect',
      }),
      dataIndex: 'business_connect',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },

    {
      title: FormattedMessage({
        id: 'merchant.account_type',
        defaultMessage: 'account_type',
      }),
      dataIndex: 'account_type',
      hideInSearch: true,
      async request() {
        return [
          { label: FormattedMessage({ id: 'dict.account_type.1' }), value: 1 },
          { label: FormattedMessage({ id: 'dict.account_type.2' }), value: 2 },
        ];
      },
      fieldProps: {
        disabled: isEdit,
      },
      formItemProps: {
        initialValue: 1,
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.remark', defaultMessage: 'remark' }),
      dataIndex: 'remark',
      hideInSearch: true,
    },
    {
      renderFormItem() {
        return <h1 />;
      },
    },
    {
      renderFormItem() {
        return (
          <h1>
            {intl.formatMessage({
              id: 'trAdd.lineInfoT',
              defaultMessage: '技术信息',
            })}
          </h1>
        );
      },
    },
    {
      renderFormItem() {
        return <h1 />;
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.aes_secret', defaultMessage: 'aes_secret' }),
      dataIndex: 'aes_secret',
      hideInSearch: true,
      readonly: isEdit,
      disable: isEdit,
      copyable: true,
      hideInForm: !isEdit,
    },
    {
      title: FormattedMessage({ id: 'merchant.merchant_agent', defaultMessage: 'merchant_agent' }),
      dataIndex: 'merchant_agent',
      hideInSearch: true,
      hideInTable: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.ip', defaultMessage: 'ip' }),
      dataIndex: 'ip',
      valueType: 'textarea',

      proFieldProps: {
        rows: 1,
      },
      formItemProps: {
        rules: [{ required: false }],
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.domain_url', defaultMessage: 'domain_url' }),
      dataIndex: 'domain_url',
      hideInSearch: true,
      hideInTable: true,
      formItemProps: {
        rules: [{ required: true }],
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.bet_api', defaultMessage: '下注API' }),
      dataIndex: 'place_bet_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    {
      title: FormattedMessage({ id: 'merchant.cancelbet_api', defaultMessage: '取消下注API' }),
      dataIndex: 'cancel_bet_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    {
      title: FormattedMessage({ id: 'merchant.balance_api', defaultMessage: '余额API' }),
      dataIndex: 'balance_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },

    {
      title: FormattedMessage({ id: 'merchant.settle_api1', defaultMessage: '结算API' }),
      dataIndex: 'payout_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    {
      title: FormattedMessage({ id: 'merchant.settle_api1', defaultMessage: '撤单API' }),
      dataIndex: 'cancel_order_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    {
      title: FormattedMessage({ id: 'merchant.resettle_api1', defaultMessage: '重新结算API' }),
      dataIndex: 're_settle_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },

    {
      title: FormattedMessage({ id: 'merchant.tip_api1', defaultMessage: '健康检查API' }),
      dataIndex: 'health_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },

    {
      title: FormattedMessage({ id: 'merchant.tip_api1', defaultMessage: '主播打赏API' }),
      dataIndex: 'dealer_reward_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    {
      title: FormattedMessage({ id: 'merchant.tip_api1', defaultMessage: '取消打赏API' }),
      dataIndex: 'cancel_reward_api',
      hideInSearch: true,
      hideInTable: true,
      width: 'm',
    },
    // {
    //   renderFormItem() {
    //     return <h1 />;
    //   },
    // },
    {
      renderFormItem() {
        return (
          <h1>
            {intl.formatMessage({
              id: 'menu.merchant.game',
              defaultMessage: '游戏管理',
            })}
          </h1>
        );
      },
    },
    {
      renderFormItem() {
        return <h1 />;
      },
    },
    {
      title: FormattedMessage({ id: 'merchant.game_infos', defaultMessage: 'game_infos' }),
      dataIndex: 'game_infos',
      hideInSearch: true,
      hideInTable: true,
      formItemProps: {
        rules: [{ required: true }],
      },
      renderFormItem(dom, record) {
        return (
          <ProFormCascader
            fieldProps={{
              multiple: true,
              showCheckedStrategy: Cascader.SHOW_CHILD,
              showSearch: (inputValue: string, path: DefaultOptionType[]) =>
                path.some(
                  (option) =>
                    (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
                ),
            }}
            request={async () => {
              const res = await (isEdit ? queryGameUdpInfo : queryGameAddInfo)({
                merchant_id: merchant_id,
              });
              // id为0是脏数据
              const __gameInfos = res?.data?.list?.filter((v) => v.id !== 0);
              setGameInfos(res.data.list);
              const choose: any[] = [];
              const options = Object.entries(groupBy(__gameInfos, 'game_type_name')).map(
                ([k, v]) => {
                  v?.filter((v) => v.status === 1).forEach((item) => {
                    choose.push([k, item.id]);
                  });
                  return {
                    label: k,
                    value: k,
                    // ...find(res.data, {}),
                    children: v.map((item) => ({
                      label: `${item.game_name}【${FormattedMessage({
                        id: 'dict.game_status.' + item.status,
                      })}中】`,
                      value: item.id,
                    })),
                  };
                },
              );

              if (isEdit) {
                setTimeout(() => {
                  formRef?.current?.setFieldsValue?.({
                    // gameInfos: ['测试游戏g'],
                    game_infos: choose,
                  });
                }, 300);
              }
              return options;
            }}
          />
        );
      },
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
        columns={tabelColumns}
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
            access="/merchant/route-manage_insert"
            type="primary"
            onClick={() => {
              setShow(true);
              setIsEdit(false);
              setMerchant_id(undefined);
            }}
            key="add"
          >
            <FormattedMessage id="pages.new" />
          </ActionBtn>,
        ]}
      />
      <BetaSchemaForm<any>
        // readonly
        // layoutType="Form"
        layoutType="ModalForm"
        onVisibleChange={setShow}
        formRef={formRef}
        visible={show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        grid={true}
        columns={columns as any}
        onFinish={async (values) => {
          // merchant_code merchant_agent 暂时传递一样的
          values.merchant_code = values.merchant_agent;
          const ids = flatten(values.game_infos).filter((v) => isNumber(v));
          const game_infos = gameInfos.map((v) => ({
            id: v.id,
            status: ids.includes(v.id) ? 1 : 2,
          }));
          // const game_infos = ids.map((v) => ({ id: v, status: 1 }));
          if (isEdit) {
            const res = await edit({ ...editData, ...values, game_infos });
            if (!res.success) return false;
          } else {
            const res = await create({ ...values, game_infos });
            if (!res.success) return false;
          }
          actionRef.current?.reload();
          return true;
        }}
      />
    </PageHeaderWrapper>
  );
};
