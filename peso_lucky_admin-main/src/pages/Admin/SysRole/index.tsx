import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Select, Tag } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { formatMessage, useIntl, useModel } from 'umi';
import { PageContainer, FooterToolbar, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import type { FormValueType } from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import { role, getRole, addRole, updateRole, removeRole } from '@/services/ant-design-pro/role';
import { dept } from '@/services/ant-design-pro/dept';
import { getMenuTree } from '@/services/ant-design-pro/menu';
import FormattedMessage from '@/components/FormattedMessage';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { normalDisableSelectOption } from '@/utils/options';

/**
 *  Select Role
 * @zh-CN 查询角色
 *
 * @param id
 */
const handleRoleGet = async (id: number) => {
  try {
    const resData = await getRole(id);
    return resData;
  } catch (error) {
    return undefined;
  }
};

/**
 * @en-US Add Role
 * @zh-CN 添加角色
 * @param fields
 */
const handleRoleAdd = async (fields: API.Role) => {
  const hide = message.loading('Configuring');
  try {
    const result = await addRole({ ...fields });
    hide();
    if (result.success) {
      message.success('Added successfully');
      return true;
    } else {
      hide();
      return false;
    }
  } catch (error) {
    hide();
    message.error('Adding failed, please try again!');
    return false;
  }
};

/**
 * @en-US Update Role
 * @zh-CN 更新角色
 *
 * @param fields
 */
const handleRoleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configuring');
  try {
    const result = await updateRole({ ...fields });
    hide();
    if (result.success) {
      message.success('Update User is successful');
      return true;
    } else {
      hide();
      return false;
    }
  } catch (error) {
    hide();
    message.error('Update User failed, please try again!');
    return false;
  }
};

/**
 * @en-US Delete Role
 * @zh-CN 删除角色
 *
 * @param selectedRows
 */
const handleRoleRemove = async (selectedRows: API.RoleListItem[]) => {
  const hide = message.loading('Configuring');
  if (!selectedRows) return true;
  try {
    const resp = await removeRole({
      ids: selectedRows.map((row) => row.roleId),
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

const fetchDeptSelect = async (e: { (value: React.SetStateAction<{}[] | undefined>): void }) => {
  const res: {}[] = [];
  try {
    const deptSelectOption = await dept({});
    deptSelectOption.data?.map((item) => {
      const temp = {};
      temp.title = item.deptName;
      temp.key = item.deptId;
      temp.children = deptCall(item.children);
      res.push(temp);
    });
  } catch (error) {
    console.log('UpdateForm.tsx:75', error);
  }
  e(res);
};

const deptCall = (list?: API.DeptListItem[]) => {
  const res: {}[] = [];
  list?.map((item) => {
    const temp = {};
    temp.title = item.deptName;
    temp.key = item.deptId;
    temp.children = deptCall(item.children);
    res.push(temp);
  });
  return res;
};

const RoleList: React.FC = () => {
  /**
   * @en-US Pop-up window of new/update window
   * @zh-CN 新建/更新窗口的弹窗
   *  */
  const [modalVisible, handleModalVisible] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();

  const formRef = useRef<any>();

  const [currentRow, setCurrentRow] = useState<API.RoleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RoleListItem[]>([]);
  const [deptTreeOptionData, setDeptTreeOptionData] = useState<{}[] | undefined>([]);
  const [menuTreeOptionData, setMenuTreeOptionData] = useState<any[] | undefined>([]);
  const [current, setCurrent] = useState<number>(0);
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    fetchDeptSelect(setDeptTreeOptionData);

    getMenuTree().then((res) => {
      const menus = res.data?.menus;
      // add key 递归
      const i18nTitle = (data: any, prefix?: string) => {
        data.map((item: any) => {
          item.i18nkey = prefix + '.' + item.title;
          item.title = formatMessage({
            id: item.i18nkey,
            defaultMessage: item.menu_name ?? item.menuName ?? item.title,
          });
          if (item.children) {
            i18nTitle(item.children, item.i18nkey);
          }
        });
      };
      i18nTitle(menus, 'menu');
      setMenuTreeOptionData(res.data?.menus);
    });
  }, [modalVisible]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RoleListItem>[] = [
    {
      title: FormattedMessage({ id: 'pages.roleManage.roleId', defaultMessage: 'Id' }),
      dataIndex: 'roleId',
      sorter: true,
      search: false,
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.roleName', defaultMessage: 'roleName' }),
      dataIndex: 'roleName',
      sorter: true,
      tooltip: 'roleName',
      render: (dom, entity) => {
        if (process.env.PLATFORM === 'CNONTROL') {
          return dom;
        }
        return entity.roleName?.replace(localStorage.getItem('Platform') + '_', '');
      },
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.sort', defaultMessage: 'sort' }),
      dataIndex: 'sort',
      valueType: 'text',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInSearch: true,
      sorter: true,
      render: (text) => {
        if (text == '2') return <Tag color="success">正常</Tag>;
        return <Tag color="red">停用</Tag>;
      },
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInTable: true,
      valueType: 'select',
      renderFormItem: () => {
        return (
          <Select
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            options={normalDisableSelectOption}
          />
        );
      },
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.createdAt', defaultMessage: 'createdAt' }),
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: FormattedMessage({ id: 'pages.roleManage.createdAt', defaultMessage: 'createdAt' }),
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
      dataIndex: 'roleId',
      valueType: 'option',
      width: 'md',
      render: (_, record) => [
        !record.admin && (
          <ActionAnchor
            access="can_SysRole_Update"
            key="update"
            onClick={() => {
              handleRoleGet(record.roleId).then((resData) => {
                if (resData?.success) {
                  console.log(resData.data);
                  setCurrentRow({
                    ...(resData.data || {}),
                    fakeRoleName:
                      record.roleName.replace(localStorage.getItem('Platform') + '_', '') || '',
                  } as any);
                  handleModalVisible(true);
                }
              });
            }}
          >
            <FormattedMessage id="pages.update" defaultMessage="update" />
          </ActionAnchor>
        ),
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RoleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.roleManage.title',
          defaultMessage: 'role Manage',
        })}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        actionRef={actionRef}
        rowKey={(record) => {
          return String(record.roleId) + record.updatedAt; // 在这里加上一个时间戳就可以了
        }}
        toolBarRender={() => [
          <ActionBtn
            access="can_SysRole_Insert"
            type="primary"
            key="primary"
            onClick={() => {
              handleModalVisible(true);
            }}
          >
            <PlusOutlined />
            <FormattedMessage id="pages.new" defaultMessage="New" />
          </ActionBtn>,
        ]}
        request={async (params) => {
          return role(params);
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.chosen" defaultMessage="Chosen" />
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>
              <FormattedMessage id="pages.item" defaultMessage="项" />
            </div>
          }
        >
          <ActionBtn
            access="can_SysRole_Delete"
            onClick={async () => {
              await handleRoleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.batchDeletion" defaultMessage="Batch deletion" />
          </ActionBtn>
        </FooterToolbar>
      )}

      {modalVisible && (
        <UpdateForm
          formRef={formRef}
          onSubmit={async (value) => {
            value.roleName = localStorage.getItem('Platform')
              ? localStorage.getItem('Platform') + '_' + value.fakeRoleName
              : value.fakeRoleName;
            value.dataScope = '5';
            if (value.roleId !== undefined && value.roleId != 0) {
              handleRoleUpdate(value).then((resp) => {
                if (resp) {
                  formRef.current?.resetStep();
                  handleModalVisible(false);
                  setCurrentRow(undefined);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              });
            } else {
              const success = await handleRoleAdd(value as API.RoleListItem);
              if (success) {
                handleModalVisible(false);
                setCurrentRow(undefined);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }
            }
          }}
          onCancel={() => {
            handleModalVisible(false);
            setCurrentRow(undefined);
          }}
          updateModalVisible={modalVisible}
          values={currentRow || {}}
          menuTreeData={menuTreeOptionData}
          deptTreeData={deptTreeOptionData}
          title={intl.formatMessage({
            id: 'pages.roleManage.updateForm.updateRole',
            defaultMessage: 'Update Role',
          })}
        />
      )}
    </PageContainer>
  );
};

export default RoleList;
