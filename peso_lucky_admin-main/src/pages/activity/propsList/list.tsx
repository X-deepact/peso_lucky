import React, { useEffect, useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  BetaSchemaForm,
  PageContainer,
  ProTable,
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormCheckbox,
} from '@ant-design/pro-components';
import { Button, message, Modal, Checkbox } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';
import {
  getAnchorList,
  deleteAnchor,
  addAnchor,
  editAnchor,
  getMerchantsList,
  getGameList,
} from './service';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import './list.less';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { trim } from 'lodash';
import { useIntl } from 'umi';

const { confirm } = Modal;

const FlowEditer: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<any>();
  const intl = useIntl();
  const [showModal, setshowModal] = useState(false);
  const [isEdit, setisEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allRoutesSelected, setAllRoutesSelected] = useState(false); // 全部线路选中状态
  const [selectedRoutes, setSelectedRoutes] = useState([]); // / 存储选中值，支持多选路线
  const [allRoutes, setAllRoutes] = useState([]); // 存取所有路线
  const [allGamesSelected, setAllGamesSelected] = useState(false); // 全部游戏选中状态
  const [selectedGames, setSelectedGames] = useState([]); // 存储选中值，支持多选游戏
  const [allGames, setAllGames] = useState([]); // 存取所有游戏

  const handleAllRoutesChange = (e) => {
    const isChecked = e.target.checked;
    setAllRoutesSelected(isChecked);
    setSelectedRoutes(isChecked ? allRoutes : []);
    if (isChecked) {
      // 全部选择
      setSelectedRoutes(allRoutes.map((item) => item.value));
    } else {
      // 取消选择
      setSelectedRoutes([]);
    }
  };

  const handleRouteChange = (checkedValues) => {
    setSelectedRoutes(checkedValues);
    setAllRoutesSelected(checkedValues.length === allRoutes.length);
  };

  const handleAllGamesChange = (e) => {
    const isChecked = e.target.checked;
    setAllGamesSelected(isChecked);
    setSelectedGames(isChecked ? allGames : []);
    if (isChecked) {
      // 全部选择
      setSelectedGames(allGames.map((item) => item.value));
    } else {
      // 取消选择
      setSelectedGames([]);
    }
  };

  const handleGameChange = (checkedValues) => {
    setSelectedGames(checkedValues);
    setAllGamesSelected(checkedValues.length === allGames.length);
  };

  useEffect(() => {
    const handleMerGet = async () => {
      try {
        // 获取所有商户（线路）
        const response = await getMerchantsList();
        const formattedOptions = response.data.map((item) => ({
          label: item?.merchant_name, // 显示的标签
          value: item?.id, // 选中的值
        }));
        setAllRoutes(formattedOptions); // 更新选项数据

        // 获取所有游戏
        const resp = await getGameList();
        const formattedGame = resp.data.map((item) => ({
          label: item?.game_name, // 显示的标签
          value: item?.game_code, // 选中的值
        }));
        setAllGames(formattedGame); // 更新选项数据
      } catch (error) {
        message.error('获取数据失败');
      }
    };

    handleMerGet();
  }, []);

  const showConfirm = (record: any) => {
    const { id } = record;

    confirm({
      title: '删除道具信息',
      icon: <ExclamationCircleFilled />,
      content: '确定删除该道具信息吗？',
      onOk() {
        console.log(id);
        deleteAnchor(id).then((res) => {
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
  const handleFinish = async (values) => {
    console.log('提交的数据:', values);
    const newValues = {};

    for (const key in values) {
      if (values[key] !== undefined) {
        // newValues[key] = trim(values[key]);
        newValues[key] = values[key];
      }
    }

    if (isEdit) {
      const id = formRef.current?.getFieldValue('id');
      editAnchor({
        ...newValues,
        id,
        game_codes: selectedGames,
        merchant_ids: selectedRoutes,
        prop_type: 1,
        prop_price: newValues.prop_price * 100,
      }).then((res) => {
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
        prop_type: 1,
        game_codes: selectedGames,
        merchant_ids: selectedRoutes,
        prop_price: newValues.prop_price * 100,
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
  };

  const columns: ProColumns[] = [
    {
      title: FormattedMessage({ id: 'activity.prop.name', defaultMessage: '道具名称' }),
      dataIndex: 'prop_name',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'activity.prop.code', defaultMessage: '道具编号' }),
      dataIndex: 'prop_code',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'activity.prop.type', defaultMessage: '道具类型' }),
      dataIndex: 'prop_type',
      valueType: 'select',
      request: async () => {
        return [
          {
            label: FormattedMessage({ id: 'activity.porp.free', defaultMessage: '免费投注' }),
            value: '1',
          },
        ];
      },
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'activity.prop.price', defaultMessage: '道具价值' }),
      dataIndex: 'prop_price',
      valueType: 'okAmount' as any,
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'activity.prop.desc', defaultMessage: '道具描述' }),
      dataIndex: 'prop_desc',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'merchant.created_at', defaultMessage: '创建时间' }),
      dataIndex: 'created_at',
      valueType: 'dateTime',
    },
    {
      hideInSearch: true,
      title: FormattedMessage({ id: 'merchant.created_by', defaultMessage: '创建人' }),
      dataIndex: 'created_by',
    },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: '操作' }),
      valueType: 'option',
      key: 'option',
      render: (text, record) => [
        <ActionAnchor
          access="/props/edit"
          action={() => {
            setshowModal(true);
            setisEdit(true);
            setTimeout(() => {
              setSelectedGames(record.game_codes);
              setSelectedRoutes(record.merchant_ids);
              setAllGamesSelected(record.game_codes.length == allGames.length);
              setAllRoutesSelected(record.merchant_ids.length == allRoutes.length);
              formRef.current?.setFieldsValue({
                ...record,
                prop_price: record.prop_price / 100,
              });
            }, 300);
          }}
        >
          {<FormattedMessage id="common.edit" defaultMessage="编辑" />}
        </ActionAnchor>,
        <ActionAnchor
          access="/props/delete"
          action={() => {
            showConfirm(record);
          }}
        >
          {<FormattedMessage id="common.delete" defaultMessage="删除" />}
        </ActionAnchor>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        toolBarRender={() => [
          <ActionBtn
            access="/props/add"
            key="add"
            type="primary"
            onClick={() => {
              setSelectedGames(null);
              setSelectedRoutes(null);
              setAllGamesSelected(null);
              setAllRoutesSelected(null);
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
      {/* 弹出框 */}
      <Modal
        title={
          isEdit
            ? FormattedMessage({ id: 'activity.edit.props' })
            : FormattedMessage({ id: 'activity.new.props' })
        }
        visible={showModal}
        onCancel={() => setshowModal(false)} // 点击取消关闭弹窗
        footer={null} // 自定义底部，使用表单的按钮
        destroyOnClose // 关闭时销毁内容，避免缓存表单数据
        style={{ minWidth: '1000px' }}
      >
        {/* 表单 */}
        <ProForm
          layout="vertical"
          formRef={formRef}
          onFinish={handleFinish}
          submitter={{
            resetButtonProps: false,
            render: (_, dom) => (
              <div style={{ textAlign: 'right' }}>
                {dom}
                <Button
                  onClick={() => {
                    setshowModal(false);
                    formRef.current?.resetFields();
                    setisEdit(false);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  取消
                </Button>
              </div>
            ),
          }}
        >
          {/* 道具名称 */}
          <ProFormText
            name="prop_name"
            label={FormattedMessage({ id: 'activity.prop.name', defaultMessage: '道具名称' })}
            placeholder={FormattedMessage({
              id: 'activity.prop.name.place',
              defaultMessage: '请输入道具名称',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="activity.prop.name.rules"
                    defaultMessage="道具名称不能为空"
                  />
                ),
              },
            ]}
          />

          {/* 道具编号 */}
          <ProFormText
            name="prop_code"
            label={FormattedMessage({ id: 'activity.prop.code', defaultMessage: '道具编号' })}
            placeholder={FormattedMessage({
              id: 'activity.prop.code.place',
              defaultMessage: '请输入道具编号',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="activity.prop.code.rules"
                    defaultMessage="道具编号不能为空"
                  />
                ),
              },
            ]}
            fieldProps={{ disabled: isEdit }}
          />

          {/* 道具价值 */}
          <ProFormDigit
            name="prop_price"
            label={FormattedMessage({ id: 'activity.prop.price', defaultMessage: '道具价值' })}
            placeholder={FormattedMessage({
              id: 'activity.prop.price.place',
              defaultMessage: '请输入道具价值',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="activity.prop.price.rules"
                    defaultMessage="道具价值不能为空"
                  />
                ),
              },
            ]}
            fieldProps={{
              addonAfter: 'P',
            }}
          />

          {/* 道具描述 */}
          <ProFormText
            name="prop_desc"
            label={FormattedMessage({ id: 'activity.prop.des', defaultMessage: '道具描述' })}
            placeholder={FormattedMessage({
              id: 'activity.prop.des.place',
              defaultMessage: '请输入道具描述',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="activity.prop.des.rules"
                    defaultMessage="道具描述不能为空"
                  />
                ),
              },
            ]}
          />

          {/* 获取数量上限 */}
          <ProFormDigit
            name="max_quantity"
            label={FormattedMessage({ id: 'activity.prop.max', defaultMessage: '获取数量上限' })}
            placeholder={FormattedMessage({
              id: 'activity.prop.max.place',
              defaultMessage: '请输入获取数量上限',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="activity.prop.max.rules"
                    defaultMessage="获取数量上限不能为空"
                  />
                ),
              },
            ]}
          />
          <div style={{ marginBottom: 16 }}>
            <Checkbox checked={allRoutesSelected} onChange={handleAllRoutesChange}>
              {/* 全部线路 */}
              {/* All lines */}
              <FormattedMessage
                id="firstOrderCompensation.allLines"
                defaultMessage="firstOrderCompensation.allLines"
              />
            </Checkbox>
          </div>

          <ProFormCheckbox.Group
            // label="选择具体线路"
            label={intl.formatMessage({
              id: 'firstOrderCompensation.selectRoute',
              defaultMessage: 'firstOrderCompensation.selectRoute',
            })}
            // Select specific route
            options={allRoutes.map((route) => ({ label: route.label, value: route.value }))}
            fieldProps={{
              value: selectedRoutes,
              onChange: handleRouteChange,
            }}
            itemStyle={{
              marginRight: '16px',
            }}
            rules={[{ required: true, message: '请选择具体线路' }]}
          />

          {/* All Games Checkbox */}
          <div style={{ marginBottom: 16 }}>
            <Checkbox checked={allGamesSelected} onChange={handleAllGamesChange}>
              {/* 全部游戏 */}
              {/* All games */}
              <FormattedMessage
                id="firstOrderCompensation.allGames"
                defaultMessage="firstOrderCompensation.allGames"
              />
            </Checkbox>
          </div>

          {/* Specific Games Selection */}
          <ProFormCheckbox.Group
            // label="选择具体游戏"
            label={intl.formatMessage({
              id: 'firstOrderCompensation.selectGame',
              defaultMessage: 'firstOrderCompensation.selectGame',
            })}
            options={allGames.map((game) => ({ label: game.label, value: game.value }))}
            fieldProps={{
              value: selectedGames,
              onChange: handleGameChange,
            }}
            rules={[{ required: true, message: '选择具体游戏' }]}
            itemStyle={{
              marginRight: '16px',
            }}
          />
        </ProForm>
      </Modal>

      {/* <BetaSchemaForm
        title={
          isEdit
            ? '编辑道具'
            : '新增道具'
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
              porp_type: 1,
              id,
            }).then((res) => {
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
              porp_type: 1,
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
            setisEdit(false);
          }
        }}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
      /> */}
    </PageContainer>
  );
};

export default FlowEditer;
