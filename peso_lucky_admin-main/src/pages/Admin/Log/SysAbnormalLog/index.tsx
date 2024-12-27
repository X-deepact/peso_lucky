import { Button, message, Tag } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { useIntl, useModel } from 'umi';
import {
  PageContainer,
  FooterToolbar,
  ProColumns,
  ActionType,
  ProTable,
  type ProFormInstance,
} from '@ant-design/pro-components';
import UpdateForm from './components/UpdateForm';
import { listSysAbnormalLog, getSysAbnormalLog, removeSysAbnormalLog } from './service';
import moment from 'moment';
import FormattedMessage from '@/components/FormattedMessage';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
/**
 *  Select SysAbnormalLog
 * @zh-CN 查询异常日志
 *
 * @param id
 */
const handleSysAbnormalLogGet = async (id: number) => {
  try {
    const resData = await getSysAbnormalLog(id);
    return resData;
  } catch (error) {
    return undefined;
  }
};

/**
 * @en-US Delete SysAbnormalLog
 * @zh-CN 删除异常日志
 *
 * @param selectedRows
 */
const handleSysAbnormalLogRemove = async (selectedRows: SysAbnormalLogItem[]) => {
  const hide = message.loading('Configuring');
  if (!selectedRows) return true;
  try {
    const resp = await removeSysAbnormalLog({
      ids: selectedRows.map((row) => row.abId),
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

const SysAbnormalLogList: React.FC = () => {
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
  const searchFormRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<SysAbnormalLogItem>();
  const [selectedRowsState, setSelectedRows] = useState<SysAbnormalLogItem[]>([]);

  const { initialState } = useModel('@@initialState');

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<SysAbnormalLogItem>[] = [
    {
      title: FormattedMessage({ id: 'pages.sysAbnormalLogManage.abId', defaultMessage: 'abId' }),
      dataIndex: 'abId',
      sorter: true,
      search: false,
      width: 100,
      fixed: 'left',
    },
    {
      title: FormattedMessage({
        id: 'pages.sysAbnormalLogManage.method',
        defaultMessage: 'method',
      }),
      dataIndex: 'method',
      sorter: true,
      search: false,
      width: 140,
      render: (text, record, index) => {
        if (record.method == 'POST') {
          return <Tag color="purple">{text}</Tag>;
        }
        if (record.method == 'GET') {
          return <Tag color="blue">{text}</Tag>;
        }
        if (record.method == 'PUT') {
          return <Tag color="warning">{text}</Tag>;
        }
        return <Tag color="blue">{text}</Tag>;
      },
    },
    {
      title: FormattedMessage({ id: 'pages.sysAbnormalLogManage.url', defaultMessage: 'url' }),
      dataIndex: 'url',
      sorter: true,
      search: false,
      width: 360,
    },
    {
      title: FormattedMessage({
        id: 'pages.sysAbnormalLogManage.abInfo',
        defaultMessage: 'abInfo',
      }),
      dataIndex: 'abInfo',
      sorter: true,
      search: false,
      width: 360,
      ellipsis: true,
    },
    {
      title: FormattedMessage({ id: 'pages.sysAbnormalLogManage.ip', defaultMessage: 'ip' }),
      dataIndex: 'ip',
      sorter: true,
      search: false,
      width: 140,
    },
    {
      title: (
        <FormattedMessage id="pages.sysAbnormalLogManage.userName" defaultMessage="userName" />
      ),
      dataIndex: 'userName',
      sorter: true,
      search: false,
      width: 140,
    },
    {
      title: (
        <FormattedMessage id="pages.sysAbnormalLogManage.createdAt" defaultMessage="createdAt" />
      ),
      key: 'showTime',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      width: 200,
      sorter: true,
      hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage id="pages.sysAbnormalLogManage.createdAt" defaultMessage="createdAt" />
      ),
      dataIndex: 'createdAt',
      valueType: 'dateTimeRange',
      hideInTable: true,
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const startTime = moment(value[0]).valueOf();
          const endTime = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            startTime,
            endTime,
          };
        },
      },
    },
    {
      title: FormattedMessage({ id: 'common.option', defaultMessage: 'Operating' }),
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="view"
          onClick={() => {
            handleSysAbnormalLogGet(record.abId).then((resData) => {
              if (resData?.success) {
                console.log(resData.data);
                setCurrentRow(resData.data);
                handleUpdateModalVisible(true);
              }
            });
          }}
        >
          <FormattedMessage id="pages.view" defaultMessage="view" />
        </a>,
      ],
    },
  ];

  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      createdAt: dateOptions[5].value,
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <PageContainer>
      <ProTable<SysAbnormalLogItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.sysAbnormalLogManage.title',
          defaultMessage: 'sysAbnormalLog Manage',
        })}
        manualRequest={true}
        formRef={searchFormRef}
        actionRef={actionRef}
        scroll={{ x: 'max-content' }}
        rowKey={(record) => {
          return String(record.abId) + record.updatedAt; // 在这里加上一个时间戳就可以了
        }}
        toolBarRender={() => [<></>]}
        request={listSysAbnormalLog}
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
          <Button
            onClick={async () => {
              await handleSysAbnormalLogRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage id="pages.batchDeletion" defaultMessage="Batch deletion" />
          </Button>
        </FooterToolbar>
      )}
      <UpdateForm
        onSubmit={async (value) => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          setCurrentRow(undefined);
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
        title={intl.formatMessage({
          id: 'pages.sysAbnormalLogManage.updateForm.viewSysAbnormalLog',
          defaultMessage: 'View SysAbnormalLog',
        })}
      />
    </PageContainer>
  );
};

export default SysAbnormalLogList;
