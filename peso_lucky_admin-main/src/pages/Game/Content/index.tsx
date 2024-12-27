import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from './data';
import { Route, useIntl, useModel, useRequest } from 'umi';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProSchemaValueType,
  ProFormColumnsType,
} from '@ant-design/pro-components';
import { Button, Modal } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { query, create, edit, getOne, deleteOne, getGameType } from './service';
import Editor from '@/components/Editor/Editor';
import { sleep } from '@/utils/sleep';
import Preview from '@/components/Editor/Preview';
import { useBetaSchemaForm } from '@/hooks';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import FormattedMessage from '@/components/FormattedMessage';
export default (props: any) => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const form = useBetaSchemaForm();
  const columns: ProColumns<ListItem>[] = [
    // {
    //   title: FormattedMessage({ id: 'game.content.id', defaultMessage: 'id' }),
    //   dataIndex: 'id',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'game.content.game_code', defaultMessage: 'game_code' }),
    //   dataIndex: 'game_code',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'game.content.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      valueType: 'select',
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: FormattedMessage({ id: 'game.content.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // {
    //   title: FormattedMessage({ id: 'game.content.game_category', defaultMessage: 'game_category' }),
    //   dataIndex: 'game_category',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'game.content.content', defaultMessage: 'content' }),
      dataIndex: 'content',
      hideInSearch: true,
      render: (dom, record) => {
        return (
          <ActionAnchor
            key="edit"
            access="/game/content_view"
            onClick={async () => {
              Modal.info({
                width: '492px',
                title: (
                  <b>
                    <FormattedMessage id="game.content.content" defaultMessage="content" />
                  </b>
                ),
                content: <Preview content={record.content} />,
              });
            }}
          >
            <FormattedMessage id="common.view" defaultMessage="preview" />
          </ActionAnchor>
        );
      },
    },
    // {
    //   title: FormattedMessage({ id: 'game.content.created_at', defaultMessage: 'created_at' }),
    //   dataIndex: 'created_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.content.updated_at', defaultMessage: 'updated_at' }),
    //   dataIndex: 'updated_at',
    //   hideInSearch: true,
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.content.updated_by', defaultMessage: 'updated_by' }),
    //   dataIndex: 'updated_by',
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'game.content.created_by', defaultMessage: 'created_by' }),
    //   dataIndex: 'created_by',
    //   hideInSearch: true,
    // },
    {
      title: <FormattedMessage id="common.option" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 120,
      render: (dom, record) => [
        <ActionAnchor
          access="/game/content_update"
          key="edit"
          onClick={async () => {
            form.setShow(true);
            form.setIsEdit(true);
            form.setData(record);
            await sleep(100);
            form.formRef?.current?.setFieldsValue?.({
              ...record,
            });
          }}
        >
          <FormattedMessage id="common.edit" />
        </ActionAnchor>,
      ],
    },
  ];

  const formColumns: ProFormColumnsType<any, 'text'>[] = [
    {
      title: FormattedMessage({ id: 'game.content.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: FormattedMessage({ id: 'game.content.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'name',
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
      title: FormattedMessage({ id: 'game.content.content', defaultMessage: 'content' }),
      dataIndex: 'content',
      hideInSearch: true,
      renderFormItem: () => {
        // style={{ width: '390px' }}
        return <Editor />;
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
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
          const res = await query(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
        toolBarRender={() => [
          <ActionBtn
            access="/game/content_insert"
            type="primary"
            onClick={() => {
              form.setShow(true);
              form.setIsEdit(false);
            }}
            key="add"
          >
            <FormattedMessage id="pages.new" />
          </ActionBtn>,
        ]}
      />
      <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={form.setShow}
        formRef={form.formRef}
        visible={form.show}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        title={
          form.isEdit
            ? FormattedMessage({ id: 'common.edit' })
            : FormattedMessage({ id: 'pages.new' })
        }
        // grid={layoutType !== 'LightFilter' && layoutType !== 'QueryFilter'}
        onFinish={async (values) => {
          if (form.isEdit) {
            await edit({ ...form.data, ...values });
          } else {
            await create(values);
          }
          actionRef.current?.reload();
          return true;
        }}
        columns={formColumns as any}
      />
    </PageHeaderWrapper>
  );
};
