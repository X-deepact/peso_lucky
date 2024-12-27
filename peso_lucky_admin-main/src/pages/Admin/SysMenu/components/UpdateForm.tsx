import React, { useState, useEffect } from 'react';
import { message, TreeSelect, Form, Divider, Tooltip } from 'antd';
import {
  ProForm,
  DrawerForm,
  ProFormDependency,
  ProFormText,
  ProFormRadio,
  ProFormDigit,
  WaterMark,
} from '@ant-design/pro-components';
import {
  BulbOutlined,
  CopyOutlined,
  createFromIconfontCN,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useIntl, useModel } from 'umi';
import IconModal from '../../../../components/IconModal';
import { Transfer, Table, Tag } from 'antd';
import difference from 'lodash/difference';
import { listSysApiNoPage, merchantlistSysApiNoPage } from '../../SysApi/service';
import FormattedMessage from '@/components/FormattedMessage';
import { find } from 'lodash';
import { normalDisableSelectOption, showHideSelectOption } from '@/utils/options';

const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/font_2713835_daepmvl8rp4.js',
    // '//at.alicdn.com/t/font_3418336_n2fh4bof259.js',
    '//at.alicdn.com/t/c/font_2713835_x7ngtq8folo.js',
  ],
});

function tree2list(treeData: any) {
  let list: any[] = [];
  function loop(data: any) {
    data.forEach((item: any) => {
      list.push(item);
      if (item.children) {
        loop(item.children);
      }
    });
  }
  loop(treeData);
  return list;
}
export type FormValueType = {} | Partial<API.MenuListItem>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  // onChange:(allFields:any) => void;
  updateModalVisible: boolean;
  values: Partial<API.MenuListItem>;
  treeData: {}[] | undefined;
  title: string;
  isMerchant?: boolean;
};

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;
      const rowSelection = {
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            // .filter(item => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          onRow={({ key }) => ({
            onClick: () => {
              onItemSelect(key, !listSelectedKeys.includes(key));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const leftTableColumns = [
  {
    dataIndex: 'name',
    title: '名称',
    render: (text, record, index) => {
      if (record.type == 'SYS') {
        return (
          <>
            <Tag color="purple">{record.type}</Tag>
            <Tag color="geekblue">{record.project == '' ? '暂无' : record.project}</Tag>
            <Tag color="lime">{record.bus == '' ? '暂无' : record.bus}</Tag>
            <Tag color="cyan">{record.func == '' ? '暂无' : record.func}</Tag>
            <p>{record.path}</p>
            <p>{text}</p>
          </>
        );
      } else if (record.type == 'BUS') {
        return (
          <>
            <Tag color="blue">{record.type}</Tag>
            <Tag color="geekblue">{record.project == '' ? '暂无' : record.project}</Tag>
            <Tag color="lime">{record.bus == '' ? '暂无' : record.bus}</Tag>
            <Tag color="cyan">{record.func == '' ? '暂无' : record.func}</Tag>
            <p>{record.path}</p>
            <p>{text}</p>
          </>
        );
      } else {
        return (
          <>
            <Tag color="gold">暂无</Tag>
            <Tag color="geekblue">{record.project == '' ? '暂无' : record.project}</Tag>
            <Tag color="lime">{record.bus == '' ? '暂无' : record.bus}</Tag>
            <Tag color="cyan">{record.func == '' ? '暂无' : record.func}</Tag>
            <p>{record.path}</p>
            <p>{text}</p>
          </>
        );
      }
    },
  },
];

type State = {
  targetKeys: any;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  console.log(props, 'props');
  const intl = useIntl();
  const [iconModalVisible, handleIconModalVisible] = useState<boolean>(false);
  let data = props.values;
  const { initialState } = useModel('@@initialState');
  const [menus, setMenus] = useState<Partial<API.MenuListItem>>({});

  const [apis, setApis] = useState<SysApiItem[]>([]);
  const [form] = Form.useForm();
  const [state, setState] = useState<State>({ targetKeys: [] });

  useEffect(() => {
    setMenus(props.values);
    form.setFieldsValue(props.values);
    setState({ targetKeys: props.values.apis });
  }, [props.values]);

  useEffect(() => {
    (async () => {
      const res = props.isMerchant ? await merchantlistSysApiNoPage() : await listSysApiNoPage();
      setApis(res?.data?.list ?? []);
    })();
  }, []);
  return (
    <DrawerForm<API.MenuListItem>
      title={props.title}
      drawerProps={{
        forceRender: true,
        destroyOnClose: true,
        onClose: () => props.onCancel(),
      }}
      width={900}
      form={form}
      initialValues={menus}
      visible={props.updateModalVisible}
      onFinishFailed={(error) => {
        error.errorFields.forEach((s) => {
          s.errors?.forEach((err) => {
            message.error(err);
          });
        });
      }}
      onFinish={async (values) => {
        if (props.values.menuId) {
          values.menuId = props.values.menuId;
        }
        values.apis = state.targetKeys;
        if (data.icon) {
          values.icon = data.icon;
        }
        values.component = props.values.component;
        await props.onSubmit(values);
        return true;
      }}
    >
      <WaterMark content={initialState?.currentUser?.name} gapY={150} gapX={100}>
        <ProForm.Group>
          <Form.Item
            name="parentId"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.parentId.nameLabel',
              defaultMessage: 'parentId',
            })}
            tooltip="指当前菜单停靠的菜单归属"
            className="pro-field-md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.menuManage.updateForm.parentId.nameRules"
                    defaultMessage="Please enter parentId"
                  />
                ),
              },
            ]}
          >
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              treeData={props.treeData}
              treeDefaultExpandAll
            />
          </Form.Item>
          <ProFormText
            name="menuName"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.menuName.nameLabel',
              defaultMessage: 'menuName',
            })}
            tooltip="菜单中文说明信息"
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.menuManage.updateForm.menuName.nameRules"
                    defaultMessage="Please enter menuName"
                  />
                ),
              },
            ]}
          />
          <ProFormText
            name="title"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.title.nameLabel',
              defaultMessage: 'title',
            })}
            tooltip="菜单多语言key,对应多语言的说明信息"
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.menuManage.updateForm.title.nameRules"
                    defaultMessage="Please enter title"
                  />
                ),
              },
            ]}
          />
          <ProFormText
            name="icon"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.icon.nameLabel',
              defaultMessage: 'icon',
            })}
            tooltip="目录：以及菜单或者菜单组，菜单：具体对应某一个页面，按钮：功能才做按钮；"
            width="md"
            fieldProps={{
              id: 'icon',
              addonAfter: (
                <SettingOutlined
                  onClick={() => {
                    handleIconModalVisible(true);
                  }}
                />
              ),
              prefix: <IconFont type={data.icon || ''} />,
              value: data.icon,
              onClick: () => {
                handleIconModalVisible(true);
              },
            }}
          />
          <ProFormDigit
            name="sort"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.sort.nameLabel',
              defaultMessage: 'sort',
            })}
            tooltip="根据序号升序排列"
            width="md"
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.menuManage.updateForm.sort.nameRules"
                    defaultMessage="Please enter sort"
                  />
                ),
              },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormRadio.Group
            name="menuType"
            radioType="button"
            label={intl.formatMessage({
              id: 'pages.menuManage.updateForm.menuType.nameLabel',
              defaultMessage: 'menuType',
            })}
            tooltip="目录：以及菜单或者菜单组，菜单：具体对应某一个页面，按钮：功能才做按钮；"
            width="md"
            options={[
              {
                label: intl.formatMessage({
                  id: 'trAdd.menu',
                  defaultMessage: '目录',
                }),
                value: 'M',
              },
              {
                label: intl.formatMessage({
                  id: 'trAdd.list',
                  defaultMessage: '菜单',
                }),
                value: 'C',
              },
              {
                label: intl.formatMessage({
                  id: 'trAdd.button',
                  defaultMessage: '按钮',
                }),
                value: 'F',
              },
            ]}
          />
        </ProForm.Group>
        <ProFormDependency name={['menuType']}>
          {({ menuType }) => {
            if (menuType === 'M' || menuType === 'C') {
              return (
                <ProForm.Group>
                  <ProFormRadio.Group
                    name="isFrame"
                    radioType="button"
                    label={intl.formatMessage({
                      id: 'pages.menuManage.updateForm.isFrame.nameLabel',
                      defaultMessage: 'isFrame',
                    })}
                    tooltip="通过iframe打开指定地址"
                    width="md"
                    options={normalDisableSelectOption}
                  />
                  <ProFormRadio.Group
                    name="visible"
                    radioType="button"
                    label={intl.formatMessage({
                      id: 'pages.menuManage.updateForm.visible.nameLabel',
                      defaultMessage: 'visible',
                    })}
                    tooltip="需要显示在菜单列表的菜单设置为显示，否则设置为隐藏"
                    width="md"
                    options={showHideSelectOption}
                  />
                </ProForm.Group>
              );
            } else {
              return null;
            }
          }}
        </ProFormDependency>
        <ProForm.Group>
          <ProFormDependency name={['menuType']}>
            {({ menuType }) => {
              if (menuType === 'M' || menuType === 'C') {
                return (
                  <ProFormText
                    name="path"
                    label={intl.formatMessage({
                      id: 'pages.menuManage.updateForm.path.nameLabel',
                      defaultMessage: 'path',
                    })}
                    tooltip="访问此页面自定义的url地址，建议/开头书写，例如 /app-name/menu-name"
                    width="md"
                    placeholder="Please enter path"
                    // initialValue={props.values.path}
                  />
                );
              } else {
                return null;
              }
            }}
          </ProFormDependency>

          <ProFormDependency name={['menuType']}>
            {({ menuType }) => {
              if (menuType === 'F') {
                return (
                  <ProFormText
                    name="permission"
                    label={intl.formatMessage({
                      id: 'pages.menuManage.updateForm.permission.nameLabel',
                      defaultMessage: 'permission',
                    })}
                    width="xl"
                    placeholder="Please enter permission"
                    tooltip="前端权限控制按钮是否显示"
                    fieldProps={{
                      id: 'icon',
                      addonAfter: (
                        <>
                          <Tooltip title="设置GetPage">
                            <UnorderedListOutlined
                              onClick={(event) => {
                                let f = form.getFieldsValue();
                                const list = tree2list(props.treeData);
                                const prefix = find(list, { value: f.parentId }).path;
                                if (f['permission'] === '') {
                                  f['permission'] = `${prefix}_search`;
                                }
                                if (f['title'] === '') {
                                  f['title'] = 'search';
                                }
                                if (f['menuName'] === '') {
                                  f['menuName'] = '搜索';
                                }
                                form.setFieldsValue(f);
                              }}
                            />
                          </Tooltip>
                          <Divider type={'vertical'} />
                          <Tooltip title="设置Get">
                            <CopyOutlined
                              onClick={(event) => {
                                let f = form.getFieldsValue();
                                const list = tree2list(props.treeData);
                                const prefix = find(list, { value: f.parentId }).path;
                                if (f['permission'] === '') {
                                  f['permission'] = `${prefix}_view`;
                                }
                                if (f['title'] === '') {
                                  f['title'] = 'view';
                                }
                                if (f['menuName'] === '') {
                                  f['menuName'] = '查看';
                                }
                                form.setFieldsValue(f);
                              }}
                            />
                          </Tooltip>
                          <Divider type={'vertical'} />
                          <Tooltip title="设置Insert">
                            <FormOutlined
                              onClick={() => {
                                let f = form.getFieldsValue();
                                const list = tree2list(props.treeData);
                                const prefix = find(list, { value: f.parentId }).path;
                                if (f['permission'] === '') {
                                  f['permission'] = `${prefix}_insert`;
                                }
                                if (f['title'] === '') {
                                  f['title'] = 'insert';
                                }
                                if (f['menuName'] === '') {
                                  f['menuName'] = '创建';
                                }
                                form.setFieldsValue(f);
                              }}
                            />
                          </Tooltip>
                          <Divider type={'vertical'} />
                          <Tooltip title="设置Update">
                            <EditOutlined
                              onClick={() => {
                                let f = form.getFieldsValue();
                                const list = tree2list(props.treeData);
                                const prefix = find(list, { value: f.parentId }).path;
                                if (f['permission'] === '') {
                                  f['permission'] = `${prefix}_update`;
                                }
                                if (f['title'] === '') {
                                  f['title'] = 'update';
                                }
                                if (f['menuName'] === '') {
                                  f['menuName'] = FormattedMessage({ id: 'common.edit' });
                                }
                                form.setFieldsValue(f);
                              }}
                            />
                          </Tooltip>
                          <Divider type={'vertical'} />
                          <Tooltip title="设置Delete">
                            <DeleteOutlined
                              onClick={() => {
                                let f = form.getFieldsValue();
                                const list = tree2list(props.treeData);
                                const prefix = find(list, { value: f.parentId }).path;
                                if (f['permission'] === '') {
                                  f['permission'] = `${prefix}_delete`;
                                }
                                if (f['title'] === '') {
                                  f['title'] = 'delete';
                                }
                                if (f['menuName'] === '') {
                                  f['menuName'] = '删除';
                                }
                                form.setFieldsValue(f);
                              }}
                            />
                          </Tooltip>
                          <Divider type={'vertical'} />
                          <Tooltip title="推荐接口">
                            <BulbOutlined
                              onClick={(event) => {
                                const text = form.getFieldValue('permission');
                                const list = String(text).split('_');
                                var newlist: Number[] = [];
                                if (list.length >= 3) {
                                  let bl = true;
                                  apis.forEach((value) => {
                                    if (list[2] == 'Update') {
                                      if (value.bus == list[1] && value.func == 'Get') {
                                        newlist.push(value.id);
                                        bl = false;
                                      }
                                    }
                                    if (value.bus == list[1] && value.func == list[2]) {
                                      newlist.push(value.id);
                                      setState({ targetKeys: newlist });
                                      message.success('推荐成功！');
                                      bl = false;
                                    }
                                  });
                                  if (bl) {
                                    message.warning('未找到合适的接口！请手动配置！');
                                  }
                                } else {
                                  message.warning('推荐失败！请尝试手动配置！');
                                }
                              }}
                            />
                          </Tooltip>
                        </>
                      ),
                    }}
                  />
                );
              } else {
                return (
                  <ProFormText
                    name="permission"
                    label={intl.formatMessage({
                      id: 'pages.menuManage.updateForm.permission.nameLabel',
                      defaultMessage: 'permission',
                    })}
                    width="md"
                    placeholder="Please enter permission"
                    tooltip="前端权限控制按钮是否显示; 格式:{结构体名称}_{funcName}; eg: can_SysUser_GetPage"
                  />
                );
              }
            }}
          </ProFormDependency>
        </ProForm.Group>
        <ProFormDependency name={['menuType']}>
          {({ menuType }) => {
            if (menuType === 'F') {
              return (
                <ProForm.Item label="api权限">
                  <TableTransfer
                    titles={['未授权', '已授权']}
                    rowKey={(record) => record.id}
                    dataSource={apis}
                    listStyle={{
                      width: 400,
                    }}
                    targetKeys={state.targetKeys}
                    showSearch={true}
                    onChange={(nextTargetKeys) => {
                      console.log(nextTargetKeys);
                      setState({ targetKeys: nextTargetKeys });
                    }}
                    filterOption={(inputValue, item) => {
                      return Object.values(item ?? {}).some(
                        (value) => String(value).indexOf(inputValue) !== -1,
                      );
                    }}
                    leftColumns={leftTableColumns}
                    rightColumns={leftTableColumns}
                  />
                </ProForm.Item>
              );
            } else {
              return null;
            }
          }}
        </ProFormDependency>
      </WaterMark>
      <IconModal
        onSubmit={async () => {
          console.log();
        }}
        onOk={async (values: string) => {
          data.icon = values;
        }}
        onCancel={() => {
          handleIconModalVisible(false);
        }}
        iconModalVisible={iconModalVisible}
        values={{}}
        title={intl.formatMessage({
          id: 'pages.menuManage.createForm.icon',
          defaultMessage: 'icon',
        })}
      />
    </DrawerForm>
  );
};

export default UpdateForm;
