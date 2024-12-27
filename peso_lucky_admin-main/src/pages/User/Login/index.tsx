import CaptchaInput from './components/CaptchaInput';
import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, Form, message, Tabs } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { history, SelectLang, useIntl, useModel } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import styles from './index.less';
import { isEmpty } from '@/utils/string';
import logo from './logo.png';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({} as API.LoginResult);
  const [type, setType] = useState<string>('account');
  const [imgCode, setImgCode] = useState<string>('');
  const { initialState, setInitialState } = useModel('@@initialState');

  const ref = useRef<any>(null);

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const refushImgCode = () => {
    ref?.current?.refresh?.();
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      values.code = values.captchaComp?.captchaCode;
      values.type = 'antd';
      values.uuid = values.captchaComp?.captchaKey;
      values.username = values.username?.trim();
      values.password = values.password?.trim();
      if (process.env.PLATFORM === 'MERCHANT') {
        localStorage.setItem('Platform', values.username?.split('_')?.[0] ?? '');
      } else {
        localStorage.setItem('Platform', '');
      }
      const msg = await login({ ...values, type });
      if (msg.success === true) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        localStorage.setItem('token', msg.token);
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
      refushImgCode();
      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
      refushImgCode();
    }
  };
  const { status, type: loginType } = userLoginState;

  const items = [
    {
      label: intl.formatMessage({
        id: 'pages.login.accountLogin.tab',
        defaultMessage: '账户密码登录',
      }),
      key: 'account',
    }, // 务必填写 key
    // {
    //   label: intl.formatMessage({
    //     id: 'pages.login.phoneLogin.tab',
    //     defaultMessage: '手机号登录',
    //   }),
    //   key: 'mobile'
    // },
  ];
  let appConfig;
  try {
    appConfig = JSON.parse(localStorage.getItem('appConfig')!);
  } catch (error) {
    appConfig = {};
  }

  const sysAppName =
    process.env.PLATFORM === 'MERCHANT'
      ? intl.formatMessage({
          id: 'trAdd.admin.merchant',
          defaultMessage: '商户后台',
        })
      : intl.formatMessage({
          id: 'trAdd.admin',
          defaultMessage: '总控（运营）后台',
        });
  const sysSiteLogo = logo;
  // appConfig?.sys_site_logo ?? 'http://doc-image.zhangwj.com/img/mini game .png';
  const sysSiteDesc = intl.formatMessage({
    id: 'trAdd.title',
    defaultMessage: '欢迎使用Color Game Admin',
  });

  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src={sysSiteLogo} />}
          title={sysAppName}
          subTitle={sysSiteDesc}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,
            <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.icon} />,
            <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.icon} />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs activeKey={type} onChange={setType} items={items} />
          {status === 'error' && loginType === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误(admin/ant.design)',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                // placeholder={intl.formatMessage({
                //   id: 'pages.login.username.placeholder',
                //   defaultMessage: '用户名: admin',
                // })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                  {
                    validator(rule, value) {
                      if (process.env.PLATFORM === 'MERCHANT' && value.indexOf('_') === -1) {
                        return Promise.reject(
                          FormattedMessage(
                            { id: 'pages.login.username.merchant.required' },
                            { name: localStorage.getItem('Platform') },
                          ),
                        );
                        // return Promise.reject('商户用户名必须包含下划线!');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                // placeholder={intl.formatMessage({
                //   id: 'pages.login.password.placeholder',
                //   defaultMessage: '密码: 123456',
                // })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <Form.Item
                name="captchaComp"
                rules={[
                  {
                    validateTrigger: 'onBlur',
                    validator: async (rule, value) => {
                      console.log(rule, value);
                      if (isEmpty(value.captchaCode)) {
                        throw new Error('验证码是必填项!');
                      }
                    },
                  },
                ]}
              >
                <CaptchaInput cRef={ref} />
              </Form.Item>
            </>
          )}

          {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (result === false) {
                    return;
                  }
                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
