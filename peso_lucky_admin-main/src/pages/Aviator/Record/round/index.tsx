import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest } from 'umi';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne } from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
import { history } from 'umi';
import { getGameType } from '@/pages/Game/Content/service';
import { divide } from 'mathjs';

export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<ListItem>();
  const searchFormRef = useRef<ProFormInstance>();
  const columns: ProColumns<ListItem>[] = [
    {
      title: FormattedMessage({ id: 'common.dateTimeRange', defaultMessage: '$2' }),
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const created_start_at = moment(value[0]).valueOf();
          const created_end_at = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            created_start_at,
            created_end_at,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({ id: 'record.order.seq', defaultMessage: 'record.order.seq' }),
      dataIndex: 'seq',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({
        id: 'record.cancel.game_name',
        defaultMessage: 'record.cancel.game_name',
      }),
      dataIndex: 'game_name',
      hideInSearch: false,
    },
    {
      title: FormattedMessage({
        id: 'record.lottery.game_type',
        defaultMessage: 'game_type',
      }),
      dataIndex: 'game_type',
      valueType: 'select',
      hideInSearch: true,
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: FormattedMessage({
        id: 'record.lottery.open_time',
        defaultMessage: 'record.lottery.open_time',
      }),
      dataIndex: 'start_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({
        id: 'record.lottery.close_time',
        defaultMessage: 'record.lottery.close_time',
      }),
      dataIndex: 'end_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: FormattedMessage({
        id: '最高倍数',
        defaultMessage: '最高倍数',
      }),
      dataIndex: 'max_odds',
      hideInSearch: true,
      render(_, record) {
        return divide(Number(record.max_odds ?? 0), 100);
      },
    },
    {
      title: FormattedMessage({
        id: 'record.back_round_status',
        defaultMessage: 'status',
      }),
      dataIndex: 'back_round_status',
      // hideInSearch: false,
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'dict.back_round_status.1' }),
            value: 1,
          },
          {
            label: FormattedMessage({ id: 'dict.back_round_status.2' }),
            value: 2,
          },
          {
            label: FormattedMessage({ id: 'dict.back_round_status.3' }),
            value: 3,
          },
        ];
      },
      valueType: 'select',
    },

    {
      title: FormattedMessage({ id: '开奖结果', defaultMessage: '开奖结果' }),
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        // <ActionAnchor
        //   key="edit"
        //   access="can__Update"
        //   onClick={() => {
        //     setShow(true);
        //     setIsEdit(true);
        //     setEditData(record);
        //   }}
        // >
        //   <FormattedMessage id="pages.view" />
        // </ActionAnchor>,
        <ActionAnchor
          onClick={() => {
            history.push(`/record/aviator-order-settled?seq=${record.seq}&tab=settle`);
          }}
        >
          <FormattedMessage id="pages.view" />
        </ActionAnchor>,
        // <ActionAnchor access="can__Delete" key="delete" onClick={() => setShow(true)}>
        //   删除
        // </ActionAnchor>,
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
        toolBarRender={() => [
          <ActionBtn
            access="can__Insert"
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
          if (isEdit) {
            await edit({ ...editData, ...values });
          } else {
            await create(values);
          }
          return true;
        }}
        columns={columns as any}
      />
    </PageHeaderWrapper>
  );
};
