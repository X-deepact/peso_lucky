import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { useIntl, useModel, useRequest } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import { BetaSchemaForm, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { Button } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne } from './service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
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
      title: <FormattedMessage id="common.dateTimeRange" />,
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
    // {
    //   title: FormattedMessage({ id: 'maintainLog.id', defaultMessage: 'id' }),
    //   dataIndex: 'id',
    // },
    {
      title: FormattedMessage({ id: 'maintainLog.operate_type', defaultMessage: 'operate_type' }),
      dataIndex: 'operate_type',
      request: () => optionDictDataSelect({ dictType: 'operate_type' }, true),
      valueType: 'select',
    },
    // {
    //   title: FormattedMessage({ id: 'maintainLog.game_code', defaultMessage: 'game_code' }),
    //   dataIndex: 'game_code',
    // },
    {
      title: FormattedMessage({ id: 'maintainLog.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'game_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // {
    //   title: FormattedMessage({ id: 'maintainLog.operate_type', defaultMessage: 'operate_type' }),
    //   dataIndex: 'operate_type',
    // },
    // {
    //   title: FormattedMessage({ id: 'maintainLog.created_at', defaultMessage: 'created_at' }),
    //   dataIndex: 'created_at',

    //   valueType: 'dateTime',
    // },
    {
      title: FormattedMessage({ id: 'maintainLog.updated_at', defaultMessage: 'updated_at' }),
      dataIndex: 'updated_at',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    // {
    //   title: FormattedMessage({ id: 'maintainLog.created_by', defaultMessage: 'created_by' }),
    //   dataIndex: 'created_by',
    // },
    {
      title: FormattedMessage({ id: 'maintainLog.updated_by', defaultMessage: 'updated_by' }),
      dataIndex: 'updated_by',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'maintainLog.remark', defaultMessage: 'remark' }),
      dataIndex: 'remark',
      hideInSearch: true,
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
    </PageHeaderWrapper>
  );
};
