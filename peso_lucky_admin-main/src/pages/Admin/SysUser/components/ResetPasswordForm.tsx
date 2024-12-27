import React from 'react';
import { message } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { useIntl, useModel } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';

export type FormValueType = {} & Partial<API.UserListItem>;

export type ResetPasswordFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  resetPasswordVisible: boolean;
  values: Partial<API.UserListItem>;
  title: string;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = (props) => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  return (
    <ModalForm
      title={props.title}
      width={300}
      visible={props.resetPasswordVisible}
      modalProps={{
        onCancel: () => props.onCancel(),
        destroyOnClose: true,
      }}
      onFinishFailed={(error) => {
        error.errorFields.forEach((s) => {
          s.errors?.forEach((err) => {
            message.error(err);
          });
        });
      }}
      onFinish={async (values) => {
        if (props.values.userId) {
          values.userId = props.values.userId;
        }
        await props.onSubmit(values);
        return true;
      }}
    >
      <ProFormText
        width="md"
        name="password"
        tooltip="最长为 24 位"
        placeholder={intl.formatMessage({
          id: 'trAdd.passwordErrorMsg',
          defaultMessage: '请输入密码',
        })}
        rules={[
          {
            required: true,
            message: <FormattedMessage id="trAdd.passwordErrorMsg" defaultMessage="请输入密码" />,
          },
        ]}
      />
    </ModalForm>
  );
};

export default ResetPasswordForm;
