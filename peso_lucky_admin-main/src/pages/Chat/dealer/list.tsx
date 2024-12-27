import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  BetaSchemaForm,
  PageContainer,
  ProTable,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Button, message, Modal, Upload, GetProp, UploadProps, Flex } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';

import { getAnchorList, deleteAnchor, addAnchor, editAnchor, uploadAvatar } from './service';

import {
  ExclamationCircleFilled,
  LoadingOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import './list.less';
import { ActionBtn } from '@/components/ActionAnchor';
import { trim } from 'lodash';

const { confirm } = Modal;

const trimString_Keys = ['name', 'address', 'birthday', 'facebook', 'hobby', 'remark'];

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<any>();

  const [showModal, setshowModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const res = info.file.response;
      formRef.current?.setFieldsValue({ avatar: res.data.url });
      setImageUrl(res.data.url);
      setLoading(false);
    }
  };

  // const handleChange: UploadProps['onChange'] = (info) => {
  //   if (info.file.status === 'uploading') {
  //     // setLoading(true);s
  //     return;
  //   }
  //   if (info.file.status === 'done') {
  //     console.log(info.file, '上传成功');
  //     uploadAvatar({ file: info.file.originFileObj }).then((res) => {
  //       if (res.success) {
  //         console.log(res.data, '上传成功');
  //         setImageUrl(res.data.url);
  //         formRef.current?.setFieldsValue({ avatar: [{ url: res.data.url }] });
  //       } else {
  //         message.error(res.data);
  //       }
  //     });
  //   }
  // };

  const showConfirm = (record: any) => {
    const { id } = record;

    confirm({
      title: '删除主播信息',
      icon: <ExclamationCircleFilled />,
      content: '确定删除该主播信息吗？',
      onOk() {
        deleteAnchor({ id }).then((res) => {
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

  // placeholder: '请输入0-50位数字/字母/汉字',
  // 去除文本前后空格
  const addColumns = [
    {
      title: FormattedMessage({ id: 'record.host.name', defaultMessage: '主播名称' }),
      dataIndex: 'name',
      width: 'md',
      fieldProps: {
        placeholder: '请输入0-50位字符',
        maxLength: 50,
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
    {
      title: FormattedMessage({ id: 'record.host.address', defaultMessage: '地址' }),
      dataIndex: 'address',
      width: 'md',
      fieldProps: {
        placeholder: '请输入0-50位字符',
        maxLength: 50,
      },
    },
    {
      title: FormattedMessage({ id: 'record.host.birthday', defaultMessage: '生日' }),
      dataIndex: 'birthday',
      width: 'md',
      fieldProps: {
        placeholder: '请输入0-50位字符',
        maxLength: 50,
      },
    },
    {
      title: FormattedMessage({ id: 'chat.mute_reason1', defaultMessage: 'Facebook' }),
      dataIndex: 'facebook',
      width: 'md',
      fieldProps: {
        placeholder: '请输入0-50位字符',
        maxLength: 50,
      },
    },
    {
      title: FormattedMessage({ id: 'record.host.hobby', defaultMessage: '爱好' }),
      dataIndex: 'hobby',
      width: 'md',
      fieldProps: {
        placeholder: '请输入0-50位字符',
        maxLength: 50,
      },
    },
    {
      // 上传照片
      title: FormattedMessage({ id: 'app.settings.basic.avatar', defaultMessage: '头像' }),
      dataIndex: 'avatar',
      width: 'md',
      valueType: 'upload',
      render: (text: any) => {
        return <img src={text} alt="avatar" style={{ width: 100, height: 100 }} />;
      },
      renderFormItem: () => {
        const avatar = formRef.current?.getFieldValue('avatar');
        setImageUrl(avatar);

        return (
          <Upload
            // name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            action={'/api/v1/upload/file'}
            headers={{
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
            ) : (
              uploadButton
            )}
          </Upload>
        );
      },
    },
    {
      title: FormattedMessage({ id: 'common.remark', defaultMessage: '备注' }),
      dataIndex: 'remark',
      width: 'md',
      valueType: 'textarea',
      fieldProps: {
        autoSize: { minRows: 3, maxRows: 5 },
        maxLength: 30,
        showCount: true,
      },
    },
  ];

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'record.host.name', defaultMessage: '主播名称' }),
      dataIndex: 'name',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'record.host.address', defaultMessage: '地址' }),
      dataIndex: 'address',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'record.host.birthday', defaultMessage: '生日' }),
      dataIndex: 'birthday',
    },
    {
      title: FormattedMessage({ id: 'chat.mute_reason1', defaultMessage: 'Facebook' }),
      key: 'showTime',
      dataIndex: 'facebook',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'record.host.hobby', defaultMessage: '爱好' }),
      key: 'showTime',
      dataIndex: 'hobby',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'common.remark', defaultMessage: '备注' }),
      dataIndex: 'remark',
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
            //
            // formRef.current?.setFieldsValue(record);
            setshowModal(true);
            setisEdit(true);
            setTimeout(() => {
              formRef.current?.setFieldsValue({
                ...record,
                // avatar: [{ url: record.avatar || '' }],
              });
            }, 300);
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
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        toolBarRender={() => [
          <ActionBtn
            access="dealer_insert"
            key="add"
            type="primary"
            onClick={() => {
              setshowModal(true);
              setisEdit(false);
            }}
          >
            <FormattedMessage id="common.add" defaultMessage="添加" />
          </ActionBtn>,
        ]}
        columns={columns}
        actionRef={actionRef}
        request={async (params = {}) => {
          const res = await getAnchorList(params);
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
          isEdit
            ? FormattedMessage({ id: 'record.host.edit_host', defaultMessage: '编辑主播' })
            : FormattedMessage({ id: 'record.host.add_host', defaultMessage: '添加主播' })
        }
        formRef={formRef}
        layoutType={'ModalForm'}
        visible={showModal}
        columns={addColumns}
        onFinishFailed={(errorInfo: any) => {
          console.log('Failed:', errorInfo);
        }}
        onFinish={async (values: any) => {
          const newValues = {};

          for (const key in values) {
            if (values[key] !== undefined) {
              newValues[key] = trim(values[key]);
            }
          }

          if (isEdit) {
            const id = formRef.current?.getFieldValue('id');
            editAnchor({
              ...newValues,
              id,
              avatar: imageUrl,
            }).then((res) => {
              // ;
              if (res.success) {
                message.success('编辑成功');
                setshowModal(false);
                formRef.current?.resetFields();
                actionRef.current?.reload();
                return true;
              } else {
                message.error(res.data);
                return false;
              }
            });
          } else {
            addAnchor({
              ...newValues,
              avatar: imageUrl,
            }).then((res) => {
              if (res.success) {
                message.success('添加成功');
                setshowModal(false);
                formRef.current?.resetFields();
                actionRef.current?.reload();

                return true;
              } else {
                message.error(res.data);
                return false;
              }
            });
          }
        }}
        onVisibleChange={(visible) => {
          setshowModal(visible);
          if (!visible) {
            formRef.current?.resetFields();
            setImageUrl('');
            setisEdit(false);
          }
        }}
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
