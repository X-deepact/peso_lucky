import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ListItem } from '../data';
import { useIntl, useModel, useRequest, formatMessage } from 'umi';
import FormattedMessage from '@/components/FormattedMessage';
import { useEffect, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProDescriptions,
  ModalForm,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Modal, Space, message, Image } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import { queryUnsettle } from '../service';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { colorGameColors, dropGameBgs } from '@/utils/color';
import ActionAnchor from '@/components/ActionAnchor';
import { useBetaSchemaForm } from '@/hooks';
import { useNewGetDateTime, dateOptions } from '@/utils/dateRange';
// import UnsettleTabItemDetail from './UnsettleTabItemDetail';

import { history, useLocation } from 'umi';

import { dropGames as dropArr } from '@/utils/color';
const isdebug = window.location.hash.includes('debug');
export default (props: { isUnsettlement?: boolean }) => {
  const actionRef = useRef<ActionType>();
  const searchFormRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const form = useBetaSchemaForm();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<ListItem>();

  const drop_ball_render = (v: string, isSecond?: boolean) => {
    return v
      ?.toString()
      .split(',')
      .map((v1: string, i) => {
        if (!v1) return null;
        const [color, money] = v1.split(': ');
        const index = dropArr.indexOf(color?.trim());
        console.log(index, 'vv');
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <Image width={31} src={dropGameBgs[index ?? 0]} />
            {!isSecond ? (money as any as number) / 100 : null}
          </div>
        );
      });
  };

  const columns: ProColumns<ListItem>[] = [
    {
      title: <FormattedMessage id="common.dateTimeRange" />,
      // dataIndex: 'dateTimeRange',
      // valueType: 'dateTimeRange',
      dataIndex: 'dateRange',
      valueType: 'dateRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const start_at = moment(value[0]).valueOf();
          const end_at = moment(value[1]).endOf('day').valueOf();
          return {
            start_at,
            end_at,
          };
        },
      },
      hideInTable: true,
      hideInForm: true,
    },
    // 注单用户
    {
      title: <FormattedMessage id="record.order.bettingUser" />,
      dataIndex: 'id',
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: (
                  <FormattedMessage id="record.order.order_number" defaultMessage="order_number" />
                ),
                dataIndex: 'order_number',
                valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="record.order.username" defaultMessage="username" />,
                dataIndex: 'nickname',
                render(_, record) {
                  return record.username || record.nickname;
                },
              },
              {
                label: <FormattedMessage id="record.order.user_id" defaultMessage="user_id" />,
                dataIndex: 'user_id',
                // valueType: 'copyable',
              },
            ]}
          />
        );
      },
      width: '300px',
      hideInSearch: true,
    },
    // 注单信息
    {
      title: FormattedMessage({ id: 'record.order.bettingInfo', defaultMessage: 'id' }),
      dataIndex: 'id',
      hideInSearch: true,
      render(dom, record) {
        return (
          <ProDescriptions
            layout="horizontal"
            dataSource={record}
            column={1}
            columns={[
              {
                label: <FormattedMessage id="record.order.seq" defaultMessage="seq" />,
                // 游戏期号
                dataIndex: 'seq',
                // valueType: 'copyable',
              },
              {
                label: <FormattedMessage id="game.info.game_name" defaultMessage="seq" />,
                // 游戏名称
                dataIndex: 'game_name',
                // valueType: 'copyable',
              },
              {
                label: (
                  <FormattedMessage id="record.order.created_at" defaultMessage="created_at" />
                ),
                dataIndex: 'created_at',
                valueType: 'dateTime',
              },
            ]}
          />
        );
      },
      width: '400px',
    },
    // 币种
    {
      title: FormattedMessage({ id: 'record.order.currency', defaultMessage: 'currency' }),
      dataIndex: 'currency',
      request: async () => {
        return currencySelectOption;
      },
      valueType: 'select',
    },
    // 下注金额
    {
      title: FormattedMessage({ id: 'record.order.amount', defaultMessage: 'amount' }),
      dataIndex: 'bet_amount',
      hideInSearch: true,
      valueType: 'okAmount' as any,
    },
    // 注单状态
    {
      title: FormattedMessage({ id: 'record.order.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      hideInSearch: true, // 只展示
      // request: async () => await optionDictDataSelect({ dictType: 'order_status' }, true),
      // 订单状态: 1 - 未结算，2 - 已结算(中奖)，3 - 已结算(未中奖)
      render: () => formatMessage({ id: 'dict.order_status.1' }),
    } as any,
    {
      title: FormattedMessage({ id: 'record.order.device_type', defaultMessage: 'device_type' }),
      dataIndex: 'device_type',
      hideInSearch: true,
      // 设备类型：1PC-WEB、2H5、3APP(IOS)、4APP(Android)
      valueEnum: {
        1: 'PC-WEB',
        2: 'H5',
        3: 'APP(iOS)',
        4: 'APP(Android)',
        0: 'OTHER',
      },
    },
    // 商户名称
    {
      // title: FormattedMessage({ id: 'record.order.merchant_name', defaultMessage: 'merchant_name' }),
      title: formatMessage({ id: 'record.order.merchant_name' }),
      dataIndex: 'merchant_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
      render: (dom, record) => record.merchant_name || record.merchant_code,
      hideInSearch: process.env.PLATFORM === 'MERCHANT',
    },
    {
      // title: FormattedMessage({ id: 'record.order.user_id', defaultMessage: 'user_id' }),
      title: formatMessage({ id: 'record.order.user_id' }),
      dataIndex: 'user_id',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      // title: FormattedMessage({ id: 'record.order.username', defaultMessage: 'username' }),
      title: formatMessage({ id: 'record.order.username' }),
      dataIndex: 'username',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'game.info.game_name', defaultMessage: 'game_name' }),
      dataIndex: 'game_name',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'record.order.seq', defaultMessage: 'seq' }),
      dataIndex: 'seq',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: formatMessage({ id: 'record.order.order_number', defaultMessage: 'order_number' }),
      dataIndex: 'order_number',
      hideInTable: true,
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    // {
    //   title: '流程id',
    //   dataIndex: 'flow_id',
    //   hideInSearch: !isdebug,
    //   hideInTable: !isdebug,
    // },
    // {
    //   // title: <FormattedMessage id="common.option" />,
    //   title: formatMessage({ id: 'common.option' }),
    //   dataIndex: 'option',
    //   valueType: 'option',
    //   align: 'center',
    //   width: 120,
    //   hideInTable: props.isUnsettlement,
    //   render: (dom, record) => [
    //     <ActionAnchor
    //       key="edit"
    //       access="/record/order_view"
    //       onClick={() => {
    //         setShow(true);
    //         setData(record);
    //       }}
    //     >
    //       <FormattedMessage id="common.view" />
    //     </ActionAnchor>,
    //   ],
    //   fixed: 'right',
    // },
    // {
    //   title: FormattedMessage({
    //     id: 'record.lottery.game_type',
    //     defaultMessage: '游戏类型',
    //   }),
    //   dataIndex: 'game_type',
    //   valueType: 'select',
    //   request: async () => [
    //     { label: 'Color Game', value: 1 },
    //     { label: 'DROP BALL GAME', value: 2 },
    //   ],
    //   hideInTable: true,
    // },
  ];
  const location = useLocation() as any;
  // 初始化参数
  useEffect(() => {
    searchFormRef.current?.setFieldsValue({
      ...(location.query || {}),
      dateTimeRange: dateOptions[5].value,
    });
    // history.replace(window.location.pathname + window.location.hash);
    searchFormRef.current?.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        manualRequest={true}
        formRef={searchFormRef}
        form={{ ignoreRules: false }}
        search={{
          defaultCollapsed: false,
          labelWidth: 'auto',
          span: 8,
        }}
        scroll={{ x: 'max-content' }}
        rowKey="key"
        columns={columns}
        request={async (params) => {
          // status: 1,
          const res = await queryUnsettle(objValTrim(omitEmpty({ ...params } as any)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
      />
      {/* <Modal
        visible={show}
        onCancel={() => {
          setShow(false);
        }}
        destroyOnClose
        title={FormattedMessage({ id: 'common.order.detail', defaultMessage: '注单详情' })}
        width={'1200px'}
        footer={null}
      >
        {data && <UnsettleTabItemDetail {...data} />}
      </Modal> */}
    </div>
  );
};
