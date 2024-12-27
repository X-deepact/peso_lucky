import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import { createFromIconfontCN } from '@ant-design/icons';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, ProProvider, SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import {
  currentUser as queryCurrentUser,
  optionDictDataSelect,
  fetchMenuData,
  currentAppConfig,
} from './services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import type { RequestOptionsInit } from 'umi-request';
import { Tag, Typography, message, notification } from 'antd';
import React from 'react';
import logo from '@/pages/User/Login/logo.png';

console.log(process.env.PLATFORM, 'process.env.PLATFORM');
console.log(process.env.REACT_APP_ENV, 'process.env.REACT_APP_ENV');
const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/font_2713835_daepmvl8rp4.js',
    // '//at.alicdn.com/t/font_3418336_n2fh4bof259.js',
    '//at.alicdn.com/t/c/font_2713835_x7ngtq8folo.js',
  ],
});

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  sexSelectOption?: API.DictDataListItem[];
  showHideSelectOption?: API.DictDataListItem[];
  fetchShowHideSelect?: () => Promise<API.DictDataListItem[] | undefined>;
  normalDisableSelectOption?: API.DictDataListItem[];
  fetchNormalDisableSelect?: () => Promise<API.DictDataListItem[] | undefined>;
  menuTypeSelectOption?: API.DictDataListItem[];
  scopeTypeSelectOption?: API.DictDataListItem[];
  fetchAppConfig?: () => Promise<API.AppConfigItem[] | undefined>;
  appConfigOption?: API.AppConfigItem[];
}> {
  // const fetchNormalDisableSelect = async () => {
  //   try {
  //     const normalDisableSelectOption = await optionDictDataSelect({
  //       dictType: 'sys_normal_disable',
  //     });
  //     return normalDisableSelectOption.data;
  //   } catch (error) {
  //     console.log('app.tsx:49', error);
  //   }
  //   return undefined;
  // };

  // 获取当前用户信息
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  // 获取应用配置信息
  const fetchAppConfig = async () => {
    try {
      const resp = await currentAppConfig();
      localStorage.setItem('appConfig', JSON.stringify(resp.data));
      return resp.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };

  const appConfigOption = await fetchAppConfig();
  defaultSettings.title = appConfigOption?.[0]?.sys_app_name ?? 'mini game -pro';
  defaultSettings.logo = logo;

  // 如果不是登录页面，执行
  if (!history.location.pathname.includes(loginPath)) {
    const currentUser = await fetchUserInfo();
    const sexSelectOption = await optionDictDataSelect({ dictType: 'sys_user_sex' });
    // const normalDisableSelectOption = await fetchNormalDisableSelect();
    const showHideSelectOption = [
      { label: '显示', value: false },
      { label: '隐藏', value: true },
    ];
    const menuTypeSelectOption = [
      { label: '目录', value: 'M' },
      { label: '菜单', value: 'C' },
      { label: '按钮', value: 'F' },
    ];
    const scopeTypeSelectOption = [
      { value: '1', label: '全部数据权限' },
      { value: '2', label: '自定数据权限' },
      { value: '3', label: '本部门数据权限' },
      { value: '4', label: '本部门及以下数据权限' },
      { value: '5', label: '仅本人数据权限' },
    ];
    const normalDisableSelectOption = [
      { value: '2', label: '正常' },
      { value: '1', label: '停用' },
    ];
    return {
      fetchUserInfo,
      currentUser,
      sexSelectOption,
      fetchAppConfig: () => Promise<API.AppConfigItem[] | undefined>, // Fix: Change the return type of fetchAppConfig
      appConfigOption,
      // fetchNormalDisableSelect,
      normalDisableSelectOption,
      showHideSelectOption,
      menuTypeSelectOption,
      scopeTypeSelectOption,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    fetchAppConfig,
    appConfigOption,
    settings: defaultSettings,
  };
}

// 请求拦截
const requestInterceptors = (url: string, options: RequestOptionsInit) => {
  const Platform = localStorage.getItem('Platform') ? localStorage.getItem('Platform') : undefined;
  const token = localStorage.getItem('token');
  if (token) {
    const headers = {
      // 'Content-Type': 'application/json',
      // Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      Platform: localStorage.getItem('Platform'),
    };
    return {
      url,
      options: { ...options, headers },
    };
  }
  if (url.indexOf('login') === -1) {
    history.push(loginPath);
    return {};
  }

  return {
    url,
    options: { ...options, headers: { Platform } },
  };
};

const respMiddleware = (response: Response) => {
  response
    .clone()
    .json()
    .then((resp) => {
      // 这里的 获取 resp。
      if (!resp.success) {
        if (resp.showType == 1)
          message.warning(resp.errorMessage + ', Error Code:' + resp.errorCode);
        else if (resp.showType == 2)
          message.error(resp.errorMessage + ', Error Code:' + resp.errorCode);
        else if (resp.showType == 4)
          notification.error({
            description: resp.errorMessage + ', Error Code:' + resp.errorCode,
            message: '业务异常',
          });
        else if (resp.code == 401) {
        } else message.warning('未知异常消息类型');
      }
    });
  return response;
};

const fixMenuItemIcon = (menus: MenuDataItem[], iconType = 'Outlined'): MenuDataItem[] => {
  menus.forEach((item) => {
    const { icon, children } = item;
    if (typeof icon === 'string') {
      item.icon = React.createElement(() => {
        return <IconFont type={icon} />;
      });
    }

    children && children.length > 0 ? (item.children = fixMenuItemIcon(children)) : null;
  });
  return menus;
};

export const request: RequestConfig = {
  timeout: 30000,
  timeoutMessage: 'Timeout occurred. Try again later.',
  errorHandler: (error: any) => {
    const { response } = error;
    if (error.name == 'RequestError' && error.type == 'Timeout') {
      message.error(error.message);
      return;
    }

    if (!response) {
      notification.error({
        description: 'There seems to be a network issue, unable to connect to the server',
        message: 'Network issue',
      });
      return;
    }

    if (response.status === 401) {
      notification.warn({
        description: 'Login information has expired, please log in again!',
        message: 'Authorization expired',
      });
      localStorage.removeItem('token');
      history.push(loginPath);
      return {};
    }

    if (response && response.status === 403) {
      notification.warn({
        description:
          'You do not have permission to access this interface. If you need access, please contact the administrator to open the permission',
        message: 'Permission exception',
      });
    }

    throw error;
  },
  errorConfig: {
    adaptor: (resData) => {
      return {
        ...resData,
        success: resData.ok,
        errorMessage: resData.message,
      };
    },
  },
  requestInterceptors: [requestInterceptors],
  responseInterceptors: [respMiddleware],
};

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
          // eslint-disable-next-line react/jsx-key
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          // eslint-disable-next-line react/jsx-key
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <ProProvider.Provider
          value={{
            valueTypeMap: {
              copyable: {
                render(v) {
                  return <Typography.Paragraph copyable={{ text: v }}>{v}</Typography.Paragraph>;
                },
              },
              winLoseAmount: {
                render(v) {
                  if (v == 0 || v == null) return v;
                  if (v > 0) return <Tag color="success">{v / 100}</Tag>;
                  return <Tag color="error">{v / 100}</Tag>;
                },
              },
              // 保留两位小数并且加上正负号
              winLoseRate: {
                render(v) {
                  if (v == 0 || v == null) return <>-</>;
                  if (v > 0) return <Tag color="success">+{(v / 100).toFixed(2)}%</Tag>;
                  return <Tag color="error">{(v / 100).toFixed(2)}%</Tag>;
                },
              },
              okAmount: {
                render(v) {
                  if (v == null) return <>-</>;
                  try {
                    const formattedValue = (v / 100).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    });
                    return <>{formattedValue}</>;
                  } catch (error) {}
                  return <>{v / 100}</>;
                },
              },
            },
          }}
        >
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </ProProvider.Provider>
      );
    },
    ...initialState?.settings,
    menu: {
      // 每当 initialState?.currentUser?.userid 发生修改时重新执行 request
      params: {
        userId: initialState?.currentUser?.userid,
      },
      request: async () => {
        // initialState.currentUser 中包含了所有用户信息
        const menuData = await fetchMenuData();
        return menuData.data;
      },
    },
    menuDataRender: (menuData) => {
      return fixMenuItemIcon(menuData);
    },
  };
};
