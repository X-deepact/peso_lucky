import React, { useEffect } from 'react';
import { TreeSelect, Form, message } from 'antd';
import {
  ProForm,
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormRadio,
  WaterMark,
} from '@ant-design/pro-components';
import { useIntl, useModel } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { normalDisableSelectOption } from '@/utils/options';

export type FormValueType = {} & Partial<API.UserListItem>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<API.UserListItem>;
  deptData: {}[] | undefined;
  roleSelectOption: {}[] | undefined;
  postSelectOption: {}[] | undefined;
  title: string;
  readonly: boolean;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(props.values);
  }, [props.updateModalVisible]);
  // ;
  return (
    <DrawerForm<API.UserListItem>
      title={props.title}
      drawerProps={{
        forceRender: true,
        destroyOnClose: true,
        onClose: () => props.onCancel(),
      }}
      form={form}
      width={740}
      initialValues={{
        ...(props.values || {}),
        ...{ deptId: 1, email: 'default@email.com', phone: 88888888 },
      }}
      visible={props.updateModalVisible}
      onFinishFailed={(error) => {
        error.errorFields.forEach((s) => {
          s.errors?.forEach((err) => {
            message.error(err);
          });
        });
      }}
      onFinish={async (values) => {
        if (!props.readonly) {
          if (props.values.userId) {
            values.userId = props.values.userId;
          }
          values.avatar =
            'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
          await props.onSubmit(values);
        } else {
          props.onCancel();
        }
      }}
    >
      <WaterMark content={initialState?.currentUser?.name} gapY={150} gapX={100}>
        <ProForm.Group>
          <ProFormText
            name="username"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.username.nameLabel',
            })}
            width="md"
            rules={[
              {
                required: true,
                message: <FormattedMessage id="pages.searchTable.updateForm.username.nameRules" />,
              },
              {
                validator: async (rule, value) => {
                  const Platform = localStorage.getItem('Platform');
                  if (
                    value &&
                    Platform &&
                    value?.split('_')?.[0] !== localStorage.getItem('Platform')
                  ) {
                    return Promise.reject(
                      FormattedMessage(
                        { id: 'pages.login.username.merchant.required' },
                        { name: Platform },
                      ),
                    );
                  }
                },
              },
            ]}
          />
          <Form.Item
            hidden
            name="deptId"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.deptId.nameLabel',
              defaultMessage: '归属部门',
            })}
            className="pro-field-md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.deptId.nameRules"
                    defaultMessage="请输入归属部门！"
                  />
                ),
              },
            ]}
          >
            <TreeSelect
              value={1}
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={props.deptData}
              treeDefaultExpandAll
            />
          </Form.Item>
        </ProForm.Group>
        {/* <ProForm.Group> */}
        <ProFormText
          name="phone"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.phone.nameLabel',
            defaultMessage: '手机号码',
          })}
          fieldProps={{
            maxLength: 11,
          }}
          hidden
          width="md"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.phone.nameRules"
                  defaultMessage="请输入手机号码！"
                />
              ),
            },
          ]}
        />
        <ProFormText
          name="email"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.email.nameLabel',
            defaultMessage: '邮箱',
          })}
          hidden
          width="md"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.email.nameRules"
                  defaultMessage="请输入邮箱！"
                />
              ),
            },
          ]}
        />
        {/* </ProForm.Group> */}
        <ProForm.Group>
          <ProFormText
            name="nickName"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.nickName.nameLabel',
              defaultMessage: '用户昵称',
            })}
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.nickName.nameRules"
                    defaultMessage="请输入用户昵称！"
                  />
                ),
              },
            ]}
          />
          <ProFormSelect
            name="sex"
            key={'value'}
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.sexType.nameLabel',
              defaultMessage: '性别',
            })}
            width="md"
            options={initialState?.sexSelectOption}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            name="postId"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.post.nameLabel',
              defaultMessage: '岗位',
            })}
            width="md"
            options={props.postSelectOption}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.searchTable.updateForm.post.nameRules"
                    defaultMessage="请输入岗位！"
                  />
                ),
              },
            ]}
          />
          <>
            {props.values.roleId != 1 ? (
              <ProFormSelect
                name="roleId"
                label={intl.formatMessage({
                  id: 'pages.searchTable.updateForm.roleId.nameLabel',
                  defaultMessage: '角色',
                })}
                width="md"
                options={props.roleSelectOption}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.searchTable.updateForm.roleId.nameRules"
                        defaultMessage="请选择角色！"
                      />
                    ),
                  },
                ]}
              />
            ) : (
              ''
            )}
          </>
        </ProForm.Group>
        <ProForm.Group>
          <ProFormRadio.Group
            name="status"
            label={intl.formatMessage({
              id: 'pages.searchTable.updateForm.status.nameLabel',
              defaultMessage: '状态',
            })}
            width="md"
            options={normalDisableSelectOption}
          />
        </ProForm.Group>
        <ProFormTextArea
          name="remark"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.remark.nameLabel',
            defaultMessage: '备注',
          })}
          placeholder="请输入备注"
        />
      </WaterMark>
    </DrawerForm>
  );
};

export default UpdateForm;
