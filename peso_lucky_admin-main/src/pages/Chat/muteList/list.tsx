import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';

import { getMuteChatList, cancelMuteChat } from './service';

import { ExclamationCircleFilled } from '@ant-design/icons';

import './list.less';

const { confirm } = Modal;

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const showConfirm = (record: any) => {
    const { user_id } = record;

    confirm({
      title: FormattedMessage({ id: 'mute.cancel_mute', defaultMessage: '解除禁言' }),
      icon: <ExclamationCircleFilled />,
      content: FormattedMessage({
        id: 'mute.cancel_mute_content',
        defaultMessage: '解除禁言后，该用户将可继续在聊天室中发言，确定解除禁言吗?',
      }),
      onOk() {
        cancelMuteChat({ user_id }).then((res) => {
          if (res.success) {
            message.success(
              FormattedMessage({ id: 'mute.cancel_mute_success', defaultMessage: '解除禁言成功' }),
            );
            actionRef.current?.reload();
          } else {
            message.error(res.data);
          }
        });
      },
    });
  };

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'player.id', defaultMessage: '用户ID' }),
      dataIndex: 'user_id',
      // copyable: true,
      // ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      disable: true,
      title: FormattedMessage({ id: 'chat.nickname', defaultMessage: '用户昵称' }),
      dataIndex: 'nickname',
    },
    {
      disable: true,
      title: FormattedMessage({ id: 'chat.merchant_name', defaultMessage: '商户名称' }),
      dataIndex: 'merchant_name',
    },
    {
      title: FormattedMessage({ id: 'chat.mute_reason', defaultMessage: '禁言原因' }),
      key: 'showTime',
      dataIndex: 'mute_reason',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'chat.mute_time', defaultMessage: '禁言时间' }),
      key: 'showTime',
      dataIndex: 'mute_time',
      valueType: 'YYYY-MM-DD HH:mm:ss',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'player.login_time', defaultMessage: '最后在线时间' }),
      dataIndex: 'last_online_time',
      valueType: 'YYYY-MM-DD HH:mm:ss',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: '操作' }),
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <a
          key="editable"
          onClick={() => {
            showConfirm(record);
          }}
        >
          {<FormattedMessage id="chat.cancel_mute" defaultMessage="解除禁言" />}
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}) => {
          const res = await getMuteChatList(params);
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
        // headerTitle={FormattedMessage({ id: 'chat.muteList.title', defaultMessage: '禁言列表' })}
      />
    </PageContainer>
  );
};

export default FlowEditer;
