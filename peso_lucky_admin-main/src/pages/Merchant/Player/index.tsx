import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage, Link } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, changeStatus } from './service';
import ActionAnchor from '@/components/ActionAnchor';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import FormattedMessage from '@/components/FormattedMessage';
import promiseConfirmModal from '@/utils/promiseModal';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="player.dateTimeRange" />,
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
    {
      title: FormattedMessage({ id: 'player.id', defaultMessage: 'id' }),
      dataIndex: 'id',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({
        id: 'player.merchant_user_id',
        defaultMessage: 'merchant_user_id',
      }),
      dataIndex: 'merchant_user_id',
      hideInSearch: true,
    },
    // {
    //   title: FormattedMessage({ id: 'player.merchant_id', defaultMessage: 'merchant_id' }),
    //   dataIndex: 'merchant_id',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'player.merchant_code', defaultMessage: 'merchant_code' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      title: FormattedMessage({ id: 'player.nickname', defaultMessage: 'nickname' }),
      dataIndex: 'nickname',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // {
    //   title: FormattedMessage({ id: 'player.password', defaultMessage: 'password' }),
    //   dataIndex: 'password',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'player.avatar', defaultMessage: 'avatar' }),
    //   dataIndex: 'avatar',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'player.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInSearch: true,
      request: () => optionDictDataSelect({ dictType: 'user_status' }),
      valueType: 'select',
    },
    {
      title: FormattedMessage({ id: 'player.balance', defaultMessage: 'balance' }),
      dataIndex: 'balance',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // todo 累计投注 累计盈利 币种 注单数量
    {
      title: FormattedMessage({ id: 'player.login_time', defaultMessage: 'login_time' }),
      dataIndex: 'login_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    // {
    //   title: FormattedMessage({ id: 'player.login_ip', defaultMessage: 'login_ip' }),
    //   dataIndex: 'login_ip',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'player.first_login_ip', defaultMessage: 'first_login_ip' }),
    //   dataIndex: 'first_login_ip',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'player.created_at', defaultMessage: 'created_at' }),
    //   dataIndex: 'created_at',
    //   valueType: 'dateTime',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'player.created_by', defaultMessage: 'created_by' }),
    //   dataIndex: 'created_by',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'player.bet_time', defaultMessage: 'bet_time' }),
      dataIndex: 'bet_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    // {
    //   title: FormattedMessage({ id: 'player.updated_by', defaultMessage: 'updated_by' }),
    //   dataIndex: 'updated_by',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'player.site_id', defaultMessage: 'site_id' }),
    //   dataIndex: 'site_id',
    //   hideInSearch: true,
    // },

    {
      title: <FormattedMessage id="player.bet_detail" defaultMessage="投注详情" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        <Link
          key="Link"
          // access="can_player_edit"
          to={`/record/order?user_id=${record.id}`}
        >
          {formatMessage({ id: 'common.view' })}
        </Link>,
      ],
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
          access="/merchant/palyer-manage_update_status"
          action={async () => {
            if (record.status == 1) {
              await promiseConfirmModal({ title: formatMessage({ id: 'common.freeze.tip' }) });
            }
            await changeStatus({ id: String(record.id), status: record.status === 1 ? 2 : 1 });
            await actionRef.current?.reload();
          }}
        >
          {formatMessage({ id: record.status == 2 ? 'common.unfreeze' : 'common.freeze' })}
        </ActionAnchor>,
      ],
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
        // toolBarRender={() => [
        //   <Button
        //     type="primary"
        //     onClick={() => {
        //       setShow(true);
        //       setIsEdit(false);
        //     }}
        //     key="add"
        //   >
        //     <FormattedMessage id="pages.new" />
        //   </Button>,
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
        onFinish={async (values) => {

          if (isEdit) {
            await edit(values);
          } else {
            await create(values);
          }
        }}
        columns={columns as any}
      /> */}
    </PageHeaderWrapper>
  );
};
