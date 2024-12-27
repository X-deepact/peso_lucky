import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { BetaSchemaForm, PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Modal, Tag } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';

import { getGiftList, deleteGift, addGift, editGift, switchGift } from './service';

import { ExclamationCircleFilled } from '@ant-design/icons';

import './list.less';

const { confirm } = Modal;

const valueEnum = {
  USD: { text: 'USD' },
  CNY: { text: 'CNY' },
  JPY: { text: 'JPY' },
  PHP: { text: 'PHP' },
  VND: { text: 'VND' },
};

enum CurrencyColor {
  USD = 'magenta',
  CNY = '#f50',
  JPY = 'volcano',
  PHP = '#2db7f5',
  VND = 'gold',
}

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<any>();

  const [showModal, setshowModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);

  const showConfirm = (record: any) => {
    const { id } = record;

    confirm({
      title: '删除礼物信息',
      icon: <ExclamationCircleFilled />,
      content: '确定删除该礼物信息吗？',
      onOk() {
        deleteGift({ id }).then((res) => {
          if (res.success) {
            message.success('删除成功');
            actionRef.current?.reload();
          } else {
            message.error(res.data);
          }
        });
      },
    });
  };

  const addColumns = [
    {
      title: FormattedMessage({ id: 'gift.name', defaultMessage: '礼物' }),
      dataIndex: 'name',
      width: 'md',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'require',
          },
        ],
      },
    },
    {
      title: FormattedMessage({ id: 'gift.icon', defaultMessage: '图标' }),
      dataIndex: 'icon',
      width: 'md',
      valueType: 'image',
      formItemProps: {
        initialValue: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg',
      },
      fieldProps: {
        disabled: true,
      },
    },
    {
      title: FormattedMessage({ id: 'gift.ani_image', defaultMessage: '动效' }),
      dataIndex: 'ani_image',
      width: 'md',
      valueType: 'image',
      formItemProps: {
        initialValue: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg',
      },
      fieldProps: {
        disabled: true,
      },
    },
    {
      title: FormattedMessage({ id: 'gift.gift_price', defaultMessage: '定价' }),
      dataIndex: 'gift_price',
      width: 'md',
      valueType: 'formList',
      initialValue: [{ currency: 'PHP' }, { currency: 'VND' }, { currency: 'CNY' }],

      fieldProps: {
        max: 3,
        deleteIconProps: false,
      },
      columns: [
        {
          valueType: 'group',
          columns: [
            {
              title: FormattedMessage({
                id: 'merchant.currency',
                defaultMessage: '币种',
              }),
              dataIndex: 'currency',
              valueType: 'select',
              colProps: {
                xs: 24,
                sm: 12,
              },
              width: 'xs',
              fieldProps: {
                disabled: true,
              },
              // initialValue: ['USD', 'CNY', 'JPY'],
              valueEnum,
            },
            {
              title: FormattedMessage({ id: 'gift.amount', defaultMessage: '金额' }),
              dataIndex: 'price',
              width: 'md',
              valueType: 'digit',

              convertValue: (value: any) => value / 100,
              transform: (value: any) => value / 100,
              fieldProps: {
                // formatter: (value) => {
                //   return value / 100;
                // },
                parser: (value) => {
                  return value * 100;
                },
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: 'require',
                  },
                ],
              },
              colProps: {
                xs: 24,
                sm: 12,
              },
            },
          ],
        },
      ],
    },
  ];

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'gift.name', defaultMessage: '礼物' }),
      dataIndex: 'name',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'gift.icon', defaultMessage: '图标' }),
      dataIndex: 'icon',
      valueType: 'image',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'gift.gift_price', defaultMessage: '定价' }),
      dataIndex: 'gift_price',
      render: (text) => {
        // text = [{currency: 'USD', price: 100}, {currency: 'CNY', price: 100}]
        // return 'USD: 100 /n CNY: 100'
        return text.map((item: any) => {
          return (
            <>
              <Tag color={CurrencyColor[item.currency]}>{`${item.currency}: ${
                item.price / 100
              }`}</Tag>
            </>
          );
        });
      },
    },
    {
      title: FormattedMessage({
        id: 'pages.deptManage.updateForm.status.nameLabel',
        defaultMessage: '状态',
      }),
      dataIndex: 'status',
      // hideInSearch: true,
      valueType: 'select',
      // 开启 关闭
      valueEnum: {
        1: { text: FormattedMessage({ id: 'common.open' }), status: 'Success' },
        0: { text: FormattedMessage({ id: 'common.close' }), status: 'Error' },
      },
      // 请求数据类型为数字
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'common.open' }),
            value: 1,
          },
          {
            label: FormattedMessage({ id: 'common.close' }),
            value: 0,
          },
        ];
      },
    },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: '操作' }),
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            //
            formRef.current?.setFieldsValue(record);
            setshowModal(true);
            setisEdit(true);
          }}
        >
          {<FormattedMessage id="common.edit" defaultMessage="编辑" />}
        </a>,
        <a
          key="delete"
          onClick={() => {
            showConfirm(record);
          }}
        >
          {<FormattedMessage id="common.delete" defaultMessage="删除" />}
        </a>,
        // 开启 关闭
        <Tag
          style={{ cursor: 'pointer' }}
          key="switch"
          color={record.status === 0 ? 'success' : 'error'}
          onClick={() => {
            switchGift({ id: record.id, status: record.status === 1 ? 0 : 1 }).then((res) => {
              if (res.success) {
                message.success('success');
                actionRef.current?.reload();
              } else {
                message.error(res.data);
              }
            });
          }}
        >
          {record.status === 1
            ? FormattedMessage({
                id: 'common.close',
              })
            : FormattedMessage({
                id: 'common.open',
              })}
        </Tag>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        // toolBarRender={() => [
        //   <Button
        //     key="add"
        //     type="primary"
        //     onClick={() => {
        //       //

        //       setisEdit(false);
        //       setshowModal(true);
        //     }}
        //   >
        //     <FormattedMessage id="common.add" defaultMessage="添加" />
        //   </Button>,
        // ]}
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}) => {
          const res = await getGiftList(params);
          return {
            total: res.total,
            data: res.data,
          };
        }}
        editable={{
          type: 'multiple',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{ showSizeChanger: true }}
        dateFormatter="string"
      />

      <BetaSchemaForm
        title={
          isEdit ? FormattedMessage({ id: 'common.edit' }) : FormattedMessage({ id: 'pages.new' })
        }
        formRef={formRef}
        layoutType={'ModalForm'}
        visible={showModal}
        onFinish={(values) => {
          console.log(values);

          if (isEdit) {
            const id = formRef.current?.getFieldValue('id');
            editGift({
              ...values,
              id,
            }).then((res) => {
              // ;
              if (res.success) {
                message.success('success');
                setshowModal(false);
                formRef.current?.resetFields();
                actionRef.current?.reload();
              } else {
                message.error(res.data);
              }
            });
          } else {
            addGift(values).then((res) => {
              if (res.success) {
                message.success('success');
                setshowModal(false);
                formRef.current?.resetFields();
                actionRef.current?.reload();
              } else {
                message.error(res.data);
              }
            });
          }
        }}
        onVisibleChange={(visible) => {
          setshowModal(visible);
          if (!visible) {
            setisEdit(false);
            formRef.current?.resetFields();
          }
        }}
        columns={addColumns}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
      />
    </PageContainer>
  );
};

export default FlowEditer;
