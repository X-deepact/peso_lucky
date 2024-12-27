import { PlusOutlined } from '@ant-design/icons';
import { Button, message, notification, Select, Tag } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, useModel } from 'umi';
import { PageContainer, FooterToolbar, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import * as menuApi from '@/services/ant-design-pro/menu';
import * as merchantMenuApi from '@/services/ant-design-pro/merchantMenu';
import { sleep } from '@/utils/sleep';
import FormattedMessage from '@/components/FormattedMessage';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { showHideSelectOption } from '@/utils/options';

const MenuList: React.FC<{ isMerchant: boolean }> = (props) => {
  const isMerchant = props.isMerchant || localStorage.getItem('Platform');
  const api = isMerchant ? merchantMenuApi : menuApi;
  const { menu, getMenu, addMenu, updateMenu, removeMenu } = api;
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  /**
   * @en-US The pop-up window of update window
   * @zh-CN 更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.MenuListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.MenuListItem[]>([]);
  const [treeOptionData, setTreeOptionData] = useState<{}[] | undefined>([]);

  const { initialState } = useModel('@@initialState');

  /**
   * @en-US Add Menu
   * @zh-CN 添加菜单
   * @param fields
   */
  const handleMenuAdd = async (fields: API.Menu) => {
    const hide = message.loading('Configuring');
    try {
      await addMenu({ ...fields });
      hide();
      message.success('Added successfully');
      return true;
    } catch (error) {
      hide();
      message.error('Adding failed, please try again!');
      return false;
    }
  };

  /**
   * @en-US Update Menu
   * @zh-CN 更新菜单
   *
   * @param fields
   */
  const handleMenuUpdate = async (fields: FormValueType) => {
    const hide = message.loading('Configuring');
    try {
      const result = await updateMenu({ ...fields });
      if (result.success) {
        hide();
        message.success('update completed!');
        return true;
      } else {
        hide();
        return false;
      }
    } catch (error) {
      hide();
      message.error('更新失败,请重试!');
      return false;
    }
  };

  /**
   * @en-US Delete Menu
   * @zh-CN 删除岗位
   *
   * @param selectedRows
   */
  const handleMenuRemove = async (selectedRows: API.MenuListItem[]) => {
    const hide = message.loading('Configuring');
    if (!selectedRows) return true;
    try {
      const resp = await removeMenu({
        ids: selectedRows.map((row) => row.menuId),
      });
      hide();
      if (resp.code === 500) {
        message.error(resp.msg);
      } else {
        message.success('Deleted successfully and will refresh soon');
      }
      return true;
    } catch (error) {
      hide();
      message.error('Delete failed, please try again');
      return false;
    }
  };

  const fetchMenuSelect = async () => {
    const res: {}[] = [];
    try {
      const deptSelectOption = await menu({});
      deptSelectOption.data?.map((item) => {
        const temp = {};
        temp.label = item.title;
        temp.path = item.path;
        temp.value = item.menuId;
        temp.children = menuCall(item.children);
        res.push(temp);
      });
    } catch (error) {
      console.log('UpdateForm.tsx:75', error);
    }
    const all: {}[] = [];
    const temp = {};
    temp.label = '根目录';
    temp.value = 0;
    temp.children = res;
    all.push(temp);
    return all;
  };

  const menuCall = (list?: API.MenuListItem[]) => {
    const res: {}[] = [];
    list?.map((item) => {
      const temp = {};
      temp.label = item.title;
      temp.value = item.menuId;
      temp.path = item.path;
      temp.children = menuCall(item.children);
      res.push(temp);
    });
    return res;
  };
  useEffect(() => {
    fetchMenuSelect().then(setTreeOptionData);
  }, []);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.MenuListItem>[] = [
    {
      title: FormattedMessage({ id: 'pages.menuManage.menuName', defaultMessage: 'title' }),
      dataIndex: 'menuName',
      valueType: 'text',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.title', defaultMessage: 'title' }),
      dataIndex: 'title',
      valueType: 'text',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.permission', defaultMessage: 'permission' }),
      dataIndex: 'permission',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.sort', defaultMessage: 'sort' }),
      dataIndex: 'sort',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.visible', defaultMessage: 'visible' }),
      dataIndex: 'visible',
      hideInSearch: true,
      render: (text, record, index) => {
        if (text == '0') return <Tag color="success">显示</Tag>;
        return <Tag color="red">隐藏</Tag>;
      },
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.visible', defaultMessage: 'visible' }),
      dataIndex: 'visible',
      hideInTable: true,
      valueType: 'select',
      renderFormItem: (item, { type, defaultRender, ...rest }, form) => {
        return (
          <Select
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            options={showHideSelectOption}
          />
        );
      },
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.menuType', defaultMessage: 'menuType' }),
      dataIndex: 'menuType',
      hideInSearch: true,
      valueType: 'select',
      render: (text, record, index) => {
        if (record.menuType == 'M') {
          return (
            <Tag color="purple">
              {FormattedMessage({ id: 'trAdd.menu', defaultMessage: '目录' })}
            </Tag>
          );
        }
        if (record.menuType == 'C') {
          return (
            <Tag color="warning">
              {FormattedMessage({ id: 'trAdd.list', defaultMessage: '菜单' })}
            </Tag>
          );
        }
        return (
          <Tag color="blue">{FormattedMessage({ id: 'trAdd.button', defaultMessage: '按钮' })}</Tag>
        );
      },
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.createdAt', defaultMessage: 'createdAt' }),
      key: 'createdAt',
      dataIndex: 'createdAt',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'pages.menuManage.createdAt', defaultMessage: 'createdAt' }),
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: 'Operating' }),
      dataIndex: 'menuId',
      valueType: 'option',
      width: 280,
      // 商户端不许<FormattedMessage id="common.edit" />这些菜单与角色
      hideInTable: process.env.PLATFORM === 'MERCHANT',
      render: (_, record) => [
        <ActionAnchor
          access="can_SysMenu_Update"
          key="new children"
          onClick={() => {
            const item: API.MenuListItem = {
              children: [],
              component: '',
              createdAt: undefined,
              dataScope: '',
              icon: '',
              isFrame: '',
              visible: false,
              menuId: 0,
              menuName: '',
              menuType: '',
              parentId: record.menuId,
              path: '',
              paths: '',
              permission: '',
              sort: 999,
              sysApi: [],
              title: '',
            };
            setCurrentRow(item);
            handleUpdateModalVisible(true);
          }}
        >
          <FormattedMessage id="pages.menuManage.newChildren" defaultMessage="New Children" />
        </ActionAnchor>,
        record.menuType !== 'F' && (
          <a
            key="copy"
            onClick={() => {
              record.menuId = 0;
              setCurrentRow(record);
              handleUpdateModalVisible(true);
            }}
          >
            <FormattedMessage id="pages.copy" defaultMessage="Copy" />
          </a>
        ),
        process.env.NODE_ENV === 'development' && (
          <a
            key="copy json"
            onClick={() => {
              record.menuId = 0;
              setCurrentRow(record);
              navigator.clipboard.writeText(JSON.stringify(record));
            }}
          >
            <FormattedMessage id="pages.copyJson" defaultMessage="Copy JSON" />
          </a>
        ),
        <a
          key="update"
          onClick={() => {
            getMenu(record.menuId).then((resData) => {
              if (resData?.success) {
                setCurrentRow(resData.data);
                handleUpdateModalVisible(true);
              }
            });
          }}
        >
          <FormattedMessage id="pages.update" defaultMessage="update" />
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.MenuListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.menuManage.table.title',
          defaultMessage: 'Menu Manage',
        })}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        actionRef={actionRef}
        rowKey={(record) => {
          return String(record.menuId); // 在这里加上一个时间戳就可以了
        }}
        toolBarRender={() => [
          <ActionBtn
            access="can_SysMenu_Insert"
            type="primary"
            key="primary"
            onClick={async () => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined />
            <FormattedMessage id="pages.new" defaultMessage="New" />
          </ActionBtn>,

          process.env.NODE_ENV === 'development' && (
            <Button
              type="primary"
              key="primary"
              onClick={async () => {
                try {
                  const str = await navigator.clipboard.readText();
                  const newdata = JSON.parse(str);
                  setCurrentRow(newdata);
                  await sleep(100);
                  handleUpdateModalVisible(true);
                } catch (error) {
                  notification.error({
                    message: '解析失败',
                    description: '请检查剪切板中的数据是否正确',
                  });
                }
              }}
            >
              <PlusOutlined />
              <FormattedMessage id="pages.new.formjson" defaultMessage="从json中复制" />
            </Button>
          ),
          selectedRowsState?.length > 0 && (
            <ActionBtn
              access="can_SysMenu_Delete"
              key="remove"
              type={'danger' as any}
              action={async () => {
                await handleMenuRemove(selectedRowsState);
                setSelectedRows([]);
                actionRef.current?.reloadAndRest?.();
                fetchMenuSelect().then(setTreeOptionData);
              }}
            >
              <FormattedMessage id="pages.batchDeletion" defaultMessage="Batch deletion" />
            </ActionBtn>
          ),
        ]}
        request={menu}
        columns={columns}
        rowSelection={
          // 商户端没有这个功能
          process.env.PLATFORM === 'MERCHANT'
            ? undefined
            : {
                onChange: (_, selectedRows) => {
                  setSelectedRows(selectedRows);
                },
              }
        }
      />
      <UpdateForm
        isMerchant={isMerchant}
        treeData={treeOptionData}
        onSubmit={async (value) => {
          const success = await handleMenuAdd(value as API.MenuListItem);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
            fetchMenuSelect().then(setTreeOptionData);
          }
        }}
        onCancel={() => {
          handleModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={createModalVisible}
        values={{}}
        title={intl.formatMessage({
          id: 'pages.menuManage.createForm.newMenu',
          defaultMessage: 'New Menu',
        })}
      />
      <UpdateForm
        isMerchant={isMerchant}
        treeData={treeOptionData}
        onSubmit={async (value) => {
          const model = value as API.MenuListItem;
          if (model.menuId == undefined) {
            const success = await handleMenuAdd(model);
            if (success) {
              handleUpdateModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
              fetchMenuSelect().then(setTreeOptionData);
            }
          } else {
            handleMenuUpdate(value).then((resp) => {
              if (resp) {
                handleUpdateModalVisible(false);
                setCurrentRow(undefined);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
                fetchMenuSelect().then(setTreeOptionData);
              }
            });
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
        title={intl.formatMessage({
          id: 'pages.menuManage.updateForm.updateMenu',
          defaultMessage: 'Update Menu',
        })}
      />
    </PageContainer>
  );
};

export default MenuList;
