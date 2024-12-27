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
export default () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
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
          const created_at_begin = moment(value[0]).valueOf();
          const created_at_end = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            created_at_begin,
            created_at_end,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: FormattedMessage({
        id: 'maintainLog.operate_type',
        defaultMessage: '操作类型',
      }),
      dataIndex: 'operation_type',
      hideInSearch: true,
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'common.maintain' }),
            value: 1,
          },
          {
            label: FormattedMessage({ id: 'common.removeMaintenance' }),
            value: 2,
          },
        ];
      },
      valueType: 'select',
    },
    {
      title: FormattedMessage({
        id: 'maintainLog.maintain_type',
        defaultMessage: '维护类型',
      }),
      dataIndex: 'maintain_type',
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'dict.maintain_type.1' }),
            value: 1,
          },
          {
            label: FormattedMessage({ id: 'dict.maintain_type.2' }),
            value: 2,
          },
        ];
      },
      valueType: 'select',
      // hideInSearch: true,
    },

    {
      title: FormattedMessage({
        id: 'ame.info.game_name',
        defaultMessage: '游戏名称',
      }),
      dataIndex: 'game_name',
      // hideInTable: true,
    },
    {
      title: FormattedMessage({
        id: 'pages.sysRequestLogManage.operTime',
        defaultMessage: '操作时间',
      }),
      dataIndex: 'updated_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({
        id: 'maintainLog.updated_by',
        defaultMessage: '操作用户',
      }),
      dataIndex: 'updated_by',
      hideInSearch: true,
    },

    {
      title: FormattedMessage({
        id: 'maintainLog.remark',
        defaultMessage: '操作原因',
      }),
      dataIndex: 'remark',
      hideInSearch: true,
    },
  ];

  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      dateTimeRange: dateOptions[6].value,
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
    </PageHeaderWrapper>
  );
};
