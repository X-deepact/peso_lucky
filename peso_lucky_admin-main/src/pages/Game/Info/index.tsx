import { PageHeaderWrapper } from '@ant-design/pro-layout';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ChipItem, ListItem } from './data';
import { useIntl, useModel, useRequest, formatMessage, history } from 'umi';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BetaSchemaForm,
  type ActionType,
  type ProFormInstance,
  ProFormList,
  ProFormTextArea,
  EditableProTable,
  ModalForm,
  ProForm,
} from '@ant-design/pro-components';
import { Button, Modal, Tabs } from 'antd';
import moment from 'moment';
import { omitEmpty, objValTrim } from '@/utils/omitEmpty';
import {
  query,
  edit,
  getChipByGameId,
  getGameRuleByGameId,
  editChip,
  add,
  create,
  editGameRuleByGameId,
  getJackpot,
  updateJackpot,
} from './service';
import ActionAnchor, { ActionBtn } from '@/components/ActionAnchor';
import { sleep } from '@/utils/sleep';
import { optionDictDataSelect } from '@/services/ant-design-pro/api';
import { useBetaSchemaForm } from '@/hooks';
import { getGameType } from '../Content/service';
import FormattedMessage from '@/components/FormattedMessage';
import { find, get } from 'lodash';
import math from '@/utils/math';
import { formatNumber } from '@/utils/normal';

export default () => {
  const actionRef = useRef<ActionType>();
  const editFormRef = useRef<ProFormInstance>();
  const formRef = useRef<ProFormInstance>();
  const [chip, setChip] = useState(0);
  const [rowData, setRow] = useState<ListItem>();

  const chipForm = useBetaSchemaForm();
  const videoForm = useBetaSchemaForm();
  const addAndEditForm = useBetaSchemaForm();
  const chipEditForm = useBetaSchemaForm();
  const prizeForm = useBetaSchemaForm();
  const intl = useIntl();
  const editAndReload = async (data: Partial<ListItem>) => {
    await edit(data);
    await actionRef.current?.reload();
  };
  const columns: ProColumns<ListItem>[] = [
    // {
    //   title: FormattedMessage({ id: 'game.info.id', defaultMessage: 'id' }),
    //   dataIndex: 'id',
    // },
    {
      title: FormattedMessage({ id: 'game.info.game_type', defaultMessage: 'game_type' }),
      dataIndex: 'game_type',
      valueType: 'select',
      async request() {
        const res = await getGameType({ game_category: 1 });
        return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
      },
    },
    {
      title: FormattedMessage({ id: 'game.info.game_code', defaultMessage: 'game_code' }),
      dataIndex: 'game_code',
      hideInSearch: true,
    },
    {
      title: formatMessage({
        id: 'game.info.game_name',
      }),
      dataIndex: 'game_name',
      formItemProps: {
        rules: [{ max: 50 }],
      },
    },
    {
      title: FormattedMessage({ id: 'game.info.code_type', defaultMessage: 'code_type' }),
      dataIndex: 'code_type',
      hideInSearch: true,
      valueType: 'select',
      request: async () => {
        return [
          { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
          { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
        ];
      },
    },
    // {
    //   title: FormattedMessage({ id: 'game.info.game_category', defaultMessage: 'game_category' }),
    //   dataIndex: 'game_category',
    //   hideInSearch: true,
    // },
    {
      title: FormattedMessage({ id: 'game.info.status', defaultMessage: 'status' }),
      dataIndex: 'status',
      request: async () => {
        return [
          {
            label: formatMessage({
              id: `dict.game_status.1`,
            }),
            value: '1',
          },
          {
            label: formatMessage({
              id: `dict.game_status.2`,
            }),
            value: '2',
          },
          {
            label: formatMessage({
              id: `dict.game_status.3`,
            }),
            value: '3',
          },
          {
            label: formatMessage({
              id: `dict.game_status.4`,
            }),
            value: '4',
          },
        ];
        // optionDictDataSelect({ dictType: 'game_status' }, true)
      },
      valueType: 'select',
    },
    {
      title: (
        <FormattedMessage id="game.info.theory_return_rate" defaultMessage="theory_return_rate" />
      ),
      dataIndex: 'theory_return_rate',
      valueType: 'percent',
      hideInSearch: true,
      render: (text, record) => <>{(record.theory_return_rate as any as number) * 100 + '%'}</>,
    },
    // {
    //   title: (
    //     <FormattedMessage id="game.info.actual_return_rate" defaultMessage="actual_return_rate" />
    //   ),
    //   dataIndex: 'actual_return_rate',
    //   valueType: 'percent',
    //   render: (text, record) => <>{(record.actual_return_rate as any as number) * 100 + '%'}</>,
    //   hideInSearch: true,
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.play_method_id', defaultMessage: 'play_method_id' }),
    //   dataIndex: 'play_method_id',
    // },
    // {
    //   title: (
    //     <FormattedMessage id="game.info.prize_pool_para_id" defaultMessage="prize_pool_para_id" />
    //   ),
    //   dataIndex: 'prize_pool_para_id',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.video_source_id', defaultMessage: 'video_source_id' }),
    //   dataIndex: 'video_source_id',
    // },

    // {
    //   title: FormattedMessage({ id: 'game.info.rec_chip_id', defaultMessage: '游戏玩法' }),
    //   valueType: 'option',
    //   render(dom, record) {
    //     return (
    //       <ActionAnchor
    //         access="/game/info_view_gameplay"
    //         action={async () => {
    //           Modal.info({
    //             width: 800,
    //             title: FormattedMessage({ id: 'game.info.rec_chip_id' }),
    //             content: (
    //               <Tabs
    //                 items={[
    //                   {
    //                     key: '1',
    //                     label: FormattedMessage({ id: 'game.info.regular_game_type' }),
    //                     children: (
    //                       <ProTable
    //                         request={async (params) => {
    //                           const res = await getGameRuleByGameId({
    //                             game_id: record.id,
    //                             game_type: record.game_type,
    //                           });
    //                           return { data: res.data, total: res.data.length };
    //                         }}
    //                         search={false}
    //                         pagination={false}
    //                         //  去掉工具栏
    //                         toolBarRender={false}
    //                         columns={[
    //                           {
    //                             title: 'Name',
    //                             dataIndex: 'name',
    //                             render: (text, record) => {
    //                               return record.odds_info[0].name;
    //                             },
    //                           },
    //                           {
    //                             title: 'Odds tables',
    //                             dataIndex: 'a_odds',
    //                             render: (text, record1) => {
    //                               return `1:${record1.odds_info[0].odds}`;
    //                             },
    //                           },
    //                           {
    //                             title: 'Name',
    //                             dataIndex: 'name',
    //                             render: (text, record) => {
    //                               return record.odds_info[1].name;
    //                             },
    //                           },
    //                           {
    //                             title: 'Odds tables',
    //                             dataIndex: 'name',
    //                             render: (text, record1) => {
    //                               return `1:${record1.odds_info[1].odds}`;
    //                             },
    //                           },
    //                           {
    //                             title: 'Name',
    //                             dataIndex: 'name',
    //                             render: (text, record) => {
    //                               return record.odds_info[2].name;
    //                             },
    //                           },
    //                           {
    //                             title: 'Odds tables',
    //                             dataIndex: 'c_odds',
    //                             render: (text, record1) => {
    //                               return `1:${record1.odds_info[2].odds}`;
    //                             },
    //                           },
    //                         ]}
    //                       />
    //                     ),
    //                   },
    //                   // {
    //                   //   key: '2',
    //                   //   label: '大奖玩法（敬请期待）',
    //                   //   disabled: true,
    //                   //   children: (
    //                   //     <ProTable
    //                   //
    //                   //       pagination={false}
    //                   //       request={async (params) => {
    //                   //         const res = await getGameRuleByGameId({ game_id: record.id });
    //                   //         return { data: res.data, total: res.data.length };
    //                   //       }}
    //                   //       columns={[
    //                   //         {
    //                   //           title: (
    //                   //             <FormattedMessage
    //                   //               id="merchant.currency"
    //                   //               defaultMessage="currency"
    //                   //             />
    //                   //           ),
    //                   //           dataIndex: 'currency',
    //                   //         },
    //                   //       ]}
    //                   //     />
    //                   //   ),
    //                   // },
    //                 ]}
    //               />
    //             ),
    //           });
    //         }}
    //       >
    //         <FormattedMessage id="common.view" defaultMessage="view" />
    //       </ActionAnchor>
    //     );
    //   },
    // },
    {
      title: FormattedMessage({ id: 'game.info.min_max_bet', defaultMessage: '游戏额度配置' }),
      valueType: 'option',
      render(dom, record) {
        return (
          <ActionAnchor
            access="/game/info_min_max_bet"
            action={async () => {
              chipEditForm.setShow(true);
              chipEditForm.setData(record);
              chipEditForm.setIsEdit(true);
            }}
          >
            <FormattedMessage id="common.setting" defaultMessage="setting" />
          </ActionAnchor>
        );
      },
    },
    {
      title: <FormattedMessage id="game.info.jackpot.params" />,
      valueType: 'option',
      render(dom, record) {
        if (record.code_type === 'SG') return '-';
        return [
          // todo /game/info_jackpot_params_update /api/v1/game/jackpot
          <ActionAnchor
            access="/game/info_jackpot_params_update"
            key={'1'}
            action={async () => {
              const { data } = await getJackpot({ game_id: record.id });
              prizeForm.setShow(true);
              prizeForm.setData(data);
              if (!data) return;
              await sleep(300);

              if (find(data, { jackpot_name: 'MINOR' })) {
                prizeForm.formRef.current?.setFieldsValue({
                  comm_ratio1: math.divide(
                    math.number(get(find(data, { jackpot_name: 'MINOR' }), 'comm_ratio')),
                    10000,
                  ),
                  init_amount1: find(data, { jackpot_name: 'MINOR' }).init_amount,
                });
              }
              if (find(data, { jackpot_name: 'MAJOR' })) {
                prizeForm.formRef.current?.setFieldsValue({
                  comm_ratio2: math.divide(
                    math.number(get(find(data, { jackpot_name: 'MAJOR' }), 'comm_ratio')),
                    10000,
                  ),
                  init_amount2: find(data, { jackpot_name: 'MAJOR' }).init_amount,
                });
              }

              if (find(data, { jackpot_name: 'GRAND' })) {
                prizeForm.formRef.current?.setFieldsValue({
                  comm_ratio3: math.divide(
                    math.number(get(find(data, { jackpot_name: 'GRAND' }), 'comm_ratio')),
                    10000,
                  ),
                  init_amount3: find(data, { jackpot_name: 'GRAND' }).init_amount,
                });
              }
            }}
          >
            <FormattedMessage id="common.setting" />
          </ActionAnchor>,
        ];
      },
    },

    {
      title: <FormattedMessage id="game.info.video_source_url" />,
      valueType: 'option',
      render(dom, record) {
        return [
          // todo 不知是否配置
          <ActionAnchor
            access="/game/info_video_update"
            key={'1'}
            action={async () => {
              const video_source_url = record.video_source_url?.split(',').map((v) => ({
                label: v,
                value: v,
              }));
              videoForm.setShow(true);
              videoForm.setData(record);
              await sleep(300);
              videoForm.formRef.current?.setFieldsValue({
                video_source_url,
              });
            }}
          >
            <FormattedMessage id="common.setting" />
          </ActionAnchor>,
        ];
      },
    },
    {
      title: FormattedMessage({ id: 'trAdd.inSet', defaultMessage: '推荐筹码设置' }),
      valueType: 'option',
      render(dom, record) {
        // return 1;
        return (
          <ActionAnchor
            access="/game/info_update_chip"
            action={async () => {
              // if (record.game_type === 4) {
              //   setChip(record.id);
              //   chipModal.form.setShow(true);
              // } else {
              //   setChip(record.id);
              //   chipForm.setShow(true);
              // }
              setChip(record.id);
              setRow(record);
              chipForm.setShow(true);
            }}
          >
            <FormattedMessage id="common.setting" />
          </ActionAnchor>
        );
      },
    },
    // {
    //   title: FormattedMessage({ id: 'game.info.created_at', defaultMessage: 'created_at' }),
    //   dataIndex: 'created_at',
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.updated_at', defaultMessage: 'updated_at' }),
    //   dataIndex: 'updated_at',
    //   valueType: 'dateTime',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.updated_by', defaultMessage: 'updated_by' }),
    //   dataIndex: 'updated_by',
    // },
    // {
    //   title: FormattedMessage({ id: 'game.info.created_by', defaultMessage: 'created_by' }),
    //   dataIndex: 'created_by',
    // },
    {
      title: <FormattedMessage id="common.option" />,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      align: 'center',
      width: 250,
      render: (dom, record) => {
        return [
          <ActionAnchor
            access="/game/info_update"
            key="4"
            action={async () => {
              addAndEditForm.setData(record);
              addAndEditForm.setShow(true);
              addAndEditForm.setIsEdit(true);
              await sleep(300);
              addAndEditForm.formRef.current?.setFieldsValue?.({ ...record });
            }}
          >
            <FormattedMessage id="common.edit" />
          </ActionAnchor>,
          record.status !== 2 ? (
            <ActionAnchor
              access="/game/info_update_status"
              key="1"
              disabled={record.status === 2}
              action={async () => {
                await editAndReload({ ...record, status: 2 });
              }}
            >
              <FormattedMessage id="common.close" />
            </ActionAnchor>
          ) : (
            <ActionAnchor
              access="/game/info_update_status"
              key="2"
              action={async () => {
                await editAndReload({ ...record, status: 1 });
              }}
            >
              <FormattedMessage id="common.open" />
            </ActionAnchor>
          ),

          record.status !== 3 ? (
            <ActionAnchor
              access="/game/info_update_status"
              key="3"
              disabled={record.status === 2 || record.status === 4}
              action={async () => {
                await editAndReload({ ...record, status: 3 });
              }}
            >
              <FormattedMessage id="common.maintain" />
            </ActionAnchor>
          ) : (
            <ActionAnchor
              access="/game/info_update_status"
              key="4"
              action={async () => {
                await editAndReload({ ...record, status: 1 });
              }}
            >
              <FormattedMessage id="common.removeMaintenance" />
            </ActionAnchor>
          ),
          // todo 应该是要请求有权限的列表
          // <ActionAnchor
          //   // access="/game/info_update_status"
          //   key="5"
          //   action={async () => {
          //     history.push(`/lottery/colorgameScene/?game_code=${record.game_code}`);
          //   }}
          // >
          //   <FormattedMessage id="game.sceneEntry" />
          // </ActionAnchor>,
          // todo 应该是要请求有权限的列表
          <ActionAnchor
            // access="/game/info_update_status"
            key="6"
            action={async () => {
              history.push(`/lottery/colorgame/?game_code=${record.game_code}`);
            }}
          >
            <FormattedMessage id="game.controlButton" />
          </ActionAnchor>,
        ];
      },
    },
  ];

  const MINOR = {
    title: 'MINOR',
    valueType: 'group',
    columns: [
      {
        title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
        dataIndex: 'init_amount1',
        valueType: 'digit',
        width: 'xs',
        fieldProps: {
          min: 0,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
      },
      {
        title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
        width: 'md',
        dataIndex: 'comm_ratio1',
        valueType: 'digit',
        fieldProps: {
          formatter: (value) => `${value || 0}%`,
          parser: (value) => {
            try {
              return math.number(isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''));
            } catch (error) {
              return 0;
            }
          },
          min: 0,
          max: 100,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
    ],
  };

  const MAJOR = {
    title: 'MAJOR',
    valueType: 'group',
    columns: [
      {
        title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
        dataIndex: 'init_amount2',
        valueType: 'digit',
        width: 'xs',
        fieldProps: {
          min: 0,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
      },
      {
        title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
        width: 'md',
        dataIndex: 'comm_ratio2',
        valueType: 'digit',
        fieldProps: {
          formatter: (value) => `${value || 0}%`,
          parser: (value) => {
            try {
              return math.number(isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''));
            } catch (error) {
              return 0;
            }
          },
          min: 0,
          max: 100,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
    ],
  };

  const GRAND = {
    title: 'GRAND',
    valueType: 'group',
    columns: [
      {
        title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
        dataIndex: 'init_amount3',
        valueType: 'digit',
        width: 'xs',
        fieldProps: {
          min: 0,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
      },
      {
        title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
        width: 'md',
        dataIndex: 'comm_ratio3',
        valueType: 'digit',
        fieldProps: {
          formatter: (value) => `${value || 0}%`,
          parser: (value) => {
            try {
              return math.number(isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''));
            } catch (error) {
              return 0;
            }
          },
          min: 0,
          max: 100,
          disabled: true,
        },
        colProps: {
          xs: 12,
        },
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
      },
    ],
  };

  const schemaFormColumns: any = useMemo(() => {
    const cols = [];
    // 只有存在才显示 奖池完全由后端控制
    if (find(prizeForm.data, { jackpot_name: 'MINOR' })) {
      cols.push(MINOR);
    }
    if (find(prizeForm.data, { jackpot_name: 'MAJOR' })) {
      cols.push(MAJOR);
    }
    if (find(prizeForm.data, { jackpot_name: 'GRAND' })) {
      cols.push(GRAND);
    }
    return cols;
  }, [prizeForm.data]);

  const colorGame = [
    // name
    {
      title: 'Name',
      dataIndex: 'name', // todo 暂时无国际化
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 160,
      editable: false,
    },
    // 最小投注
    {
      title: formatMessage({ id: 'record.order.min_bet' }),
      dataIndex: 'min_bet',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    // 最大投注
    {
      title: formatMessage({ id: 'record.order.max_bet' }),
      dataIndex: 'max_bet',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    // 编辑
    {
      title: <FormattedMessage id="common.edit" />,
      valueType: 'option',
      dataIndex: 'option',
      width: 160,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <FormattedMessage id="common.edit" />
        </a>,
      ],
    },
  ];

  const aviator = [
    // 币种
    {
      title: 'currency',
      dataIndex: 'currency', // todo 暂时无国际化
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 160,
      editable: false,
    },
    // 最小投注
    {
      title: formatMessage({ id: 'record.order.min_bet' }),
      dataIndex: 'min_bet',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    // 最大投注
    {
      title: formatMessage({ id: 'record.order.max_bet' }),
      dataIndex: 'max_bet',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: formatMessage({ id: 'record.order.maxpayout', defaultMessage: '最高赔付金额' }),
      dataIndex: 'max_payout',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    // 编辑
    {
      title: <FormattedMessage id="common.edit" />,
      valueType: 'option',
      dataIndex: 'option',
      width: 160,
      render: (text: any, record: any, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <FormattedMessage id="common.edit" />
        </a>,
      ],
    },
  ];

  const chipColumnsNoraml: ProColumns[] = [
    {
      title: formatMessage({ id: 'record.order.currency' }),
      dataIndex: 'currency',
      readonly: true,
    },
    {
      title: 'chip1',
      dataIndex: 'chip1',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 160,
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: 'chip2',
      dataIndex: 'chip2',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: 'chip3',
      dataIndex: 'chip3',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: 'chip4',
      dataIndex: 'chip4',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 160,
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: 'chip5',
      dataIndex: 'chip5',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: {
        precision: 0,
        min: 1,
      },
    },
    {
      title: 'chip6',
      dataIndex: 'chip6',
      width: 160,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      // 提示
      tooltip: FormattedMessage({ id: 'game.info.chip6.tips' }),
      fieldProps: {
        precision: 0,
        min: 0,
      },
    },
    {
      title: <FormattedMessage id="common.edit" />,
      valueType: 'option',
      dataIndex: 'option',
      width: 160,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <FormattedMessage id="common.edit" />
        </a>,
      ],
    },
  ];

  const chipAmountRecommendation: ProColumns[] = [
    {
      title: formatMessage({ id: 'record.order.currency' }),
      dataIndex: 'currency',
      readonly: true,
    },
    {
      dataIndex: 'chip1',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 100,
      valueType: 'digit',
      fieldProps: { precision: 1, min: 0.1 },
      render(_, record) {
        return formatNumber(record.chip1);
      },
    },
    {
      dataIndex: 'chip2',
      width: 100,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: { precision: 1, min: 0.1 },
      render(_, record) {
        return formatNumber(record.chip2);
      },
    },
    {
      dataIndex: 'chip3',
      width: 100,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: { precision: 1, min: 0.1 },
      render(_, record) {
        return formatNumber(record.chip3);
      },
    },
    {
      dataIndex: 'chip4',
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      width: 100,
      valueType: 'digit',
      fieldProps: { precision: 1, min: 0.1 },
      render(_, record) {
        return formatNumber(record.chip4);
      },
    },
    {
      title: '+/-调整单位',
      dataIndex: 'chip5',
      width: 100,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
      valueType: 'digit',
      fieldProps: { precision: 1, min: 0.1 },
      render(_, record) {
        return formatNumber(record.chip5);
      },
    },

    {
      title: <FormattedMessage id="common.edit" />,
      valueType: 'option',
      dataIndex: 'option',
      width: 160,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          <FormattedMessage id="common.edit" />
        </a>,
      ],
    },
  ];

  //chipEditForm.data 数据来源不明
  const minMaxBetColumns: any = chipEditForm.data?.game_type === 4 ? aviator : colorGame;

  const chipColumns = rowData?.game_type === 4 ? chipAmountRecommendation : chipColumnsNoraml;

  return (
    <PageHeaderWrapper>
      <ProTable<ListItem, ListItem>
        actionRef={actionRef}
        // manualRequest={true}

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
          const res = await query(objValTrim(omitEmpty(params)));
          return {
            total: res.total,
            data: res.data,
          };
        }}
        pagination={{ showSizeChanger: true }}
        toolBarRender={() => [
          <ActionBtn
            type="primary"
            access="/game/info_insert"
            onClick={async () => {
              addAndEditForm.setShow(true);
              addAndEditForm.setIsEdit(false);
            }}
            key="add"
          >
            <FormattedMessage id="pages.new" />
          </ActionBtn>,
        ]}
      />
      {/* 推荐筹码设置 */}
      <ModalForm
        visible={chipForm.show}
        formRef={chipForm.formRef}
        width={rowData?.game_type === 4 ? 800 : 1300}
        title={
          rowData?.game_type === 4
            ? '推荐金额设置'
            : intl.formatMessage({
                id: 'trAdd.inSet',
                defaultMessage: '推荐筹码设置',
              })
        }
        onVisibleChange={async (v) => {
          chipForm.setShow(v);
          if (!v) {
            setChip(0);
            await sleep(100);
            chipForm.formRef.current?.resetFields();
          }
        }}
        onFinish={async () => {
          chipForm.setShow(false);
        }}
        modalProps={{ destroyOnClose: true }}
      >
        {rowData?.game_type !== 4 && (
          <h1
            style={{
              color: 'red',
              fontSize: 16,
              marginBottom: 20,
              marginLeft: 20,
            }}
          >
            {FormattedMessage({ id: 'game.info.chip6.tips' })}
          </h1>
        )}
        <EditableProTable
          rowKey="id"
          editableFormRef={editFormRef}
          recordCreatorProps={false}
          editable={{
            type: 'single',
            onlyAddOneLineAlertMessage: FormattedMessage({
              id: 'game.info.onlyAddOneLineAlertMessage',
            }),
            onlyOneLineEditorAlertMessage: FormattedMessage({
              id: 'game.info.onlyOneLineEditorAlertMessage',
            }),
            onSave: async (rowKey, data) => {
              const chips =
                rowData?.game_type === 4
                  ? [
                      data.chip1 * 100,
                      data.chip2 * 100,
                      data.chip3 * 100,
                      data.chip4 * 100,
                      data.chip5 * 100,
                    ]
                  : [
                      data.chip1 * 100,
                      data.chip2 * 100,
                      data.chip3 * 100,
                      data.chip4 * 100,
                      data.chip5 * 100,
                      data.chip6 * 100,
                    ];
              await editChip({
                id: rowKey,
                chips: chips.join(','),
              });

              await sleep(100);
              chipForm.formRef.current?.resetFields();
            },
            actionRender: (row, config, dom) => [dom.save],
          }}
          request={async () => {
            const res = await getChipByGameId({ game_id: chip });
            const list = res.data.map((v) => {
              const chips = v.chips.split(',').map((v1: string) => Number(v1) / 100);
              return {
                ...v,
                chip1: chips[0],
                chip2: chips[1],
                chip3: chips[2],
                chip4: chips[3],
                chip5: chips[4],
                chip6: chips[5],
              };
            });
            return { data: list, total: list.length };
          }}
          columns={chipColumns}
        />
      </ModalForm>
      {/* 游戏额度配置 */}
      <ModalForm
        visible={chipEditForm.show}
        formRef={chipEditForm.formRef}
        width={1300}
        title={FormattedMessage({ id: 'game.info.min_max_bet', defaultMessage: '游戏额度配置' })}
        onVisibleChange={async (v) => {
          chipEditForm.setShow(v);
          if (!v) {
            setChip(0);
            await sleep(100);
            chipEditForm.formRef.current?.resetFields();
          }
        }}
        onFinish={async () => {
          chipEditForm.setShow(false);
        }}
        modalProps={{ destroyOnClose: true }}
      >
        <EditableProTable
          rowKey="id"
          editableFormRef={editFormRef}
          recordCreatorProps={false}
          editable={{
            type: 'single',
            onlyAddOneLineAlertMessage: FormattedMessage({
              id: 'game.info.onlyAddOneLineAlertMessage',
            }),
            onlyOneLineEditorAlertMessage: FormattedMessage({
              id: 'game.info.onlyOneLineEditorAlertMessage',
            }),
            onSave: async (rowKey, data) => {
              await editGameRuleByGameId({
                id: rowKey,
                ...data,
                min_bet: data.min_bet * 100,
                max_bet: data.max_bet * 100,
                max_payout: data.max_payout ? data.max_payout * 100 : undefined,
              });
              await sleep(100);
              chipForm.formRef.current?.resetFields();
            },
            actionRender: (row, config, dom) => [dom.save],
          }}
          request={async () => {
            const res = await getGameRuleByGameId({
              game_id: chipEditForm.data?.id,
              game_type: chipEditForm.data?.game_type,
            });
            res.data = res.data.map((v) => {
              return {
                ...v,
                min_bet: v.min_bet / 100,
                max_bet: v.max_bet / 100,
                max_payout: v.max_payout ? v.max_payout / 100 : undefined,
              };
            });
            return { data: res.data, total: res.data.length };
          }}
          columns={minMaxBetColumns}
        />
      </ModalForm>
      <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={videoForm.setShow}
        formRef={videoForm.formRef}
        visible={videoForm.show}
        title={intl.formatMessage({
          id: 'trAdd.videoUpdate',
          defaultMessage: '编辑视频源',
        })}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        onFinish={async (values) => {
          await editAndReload({
            ...videoForm.data,
            ...values,
            video_source_url: values.video_source_url.map((v: any) => v.label)?.join(','),
          });

          return true;
        }}
        columns={[
          {
            name: 'video_source_url',
            renderFormItem: () => {
              return (
                <ProFormList
                  name={'video_source_url'}
                  label={
                    <h3>
                      {intl.formatMessage({
                        id: 'trAdd.video',
                        defaultMessage: '视频源',
                      })}
                    </h3>
                  }
                  tooltip="直播源地址，例如 https://g04-01.myshow22.live/bg01/a-12.flv"
                  // initialValue={[
                  //   {
                  //     value: 'https://g04-01.myshow22.live/bg01/a-12.flv',
                  //     label: 'https://g04-01.myshow22.live/bg01/a-12.flv',
                  //   },
                  // ]}
                >
                  <ProFormTextArea name="label" width={500} />
                </ProFormList>
              );
            },
          },
        ]}
      />
      <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={prizeForm.setShow}
        formRef={prizeForm.formRef}
        visible={prizeForm.show}
        title={FormattedMessage({ id: 'game.info.jackpot.params' })}
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        onFinish={async (values) => {
          return true; // 产品说不需要编辑 @niko
          prizeForm.data.map(async (v: any) => {
            if (v.jackpot_name === 'MINOR') {
              await updateJackpot(v.id, {
                ...v,
                comm_ratio: values.comm_ratio1 * 100,
                init_amount: values.init_amount1,
              });
            }
            if (v.jackpot_name === 'MAJOR') {
              await updateJackpot(v.id, {
                ...v,
                comm_ratio: values.comm_ratio2 * 100,
                init_amount: values.init_amount2,
              });
            }
            if (v.jackpot_name === 'GRAND') {
              await updateJackpot(v.id, {
                ...v,
                comm_ratio: values.comm_ratio3 * 100,
                init_amount: values.init_amount3,
              });
            }
          });

          return true;
        }}
        columns={[
          ...schemaFormColumns,
          // {
          //   title: 'MINOR',
          //   valueType: 'group',
          //   columns: [
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
          //       dataIndex: 'init_amount1',
          //       valueType: 'digit',
          //       width: 'xs',
          //       fieldProps: {
          //         min: 0,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //     },
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
          //       width: 'md',
          //       dataIndex: 'comm_ratio1',
          //       valueType: 'digit',
          //       fieldProps: {
          //         formatter: (value) => `${value || 0}%`,
          //         parser: (value) => {
          //           try {
          //             return math.number(
          //               isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''),
          //             );
          //           } catch (error) {
          //             return 0;
          //           }
          //         },
          //         min: 0,
          //         max: 100,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //       formItemProps: {
          //         rules: [
          //           {
          //             required: true,
          //             message: '此项为必填项',
          //           },
          //         ],
          //       },
          //     },
          //   ],
          // },

          // {
          //   title: 'MAJOR',
          //   valueType: 'group',
          //   columns: [
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
          //       dataIndex: 'init_amount2',
          //       valueType: 'digit',
          //       width: 'xs',
          //       fieldProps: {
          //         min: 0,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //     },
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
          //       width: 'md',
          //       dataIndex: 'comm_ratio2',
          //       valueType: 'digit',
          //       fieldProps: {
          //         formatter: (value) => `${value || 0}%`,
          //         parser: (value) => {
          //           try {
          //             return math.number(
          //               isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''),
          //             );
          //           } catch (error) {
          //             return 0;
          //           }
          //         },
          //         min: 0,
          //         max: 100,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //       formItemProps: {
          //         rules: [
          //           {
          //             required: true,
          //             message: '此项为必填项',
          //           },
          //         ],
          //       },
          //     },
          //   ],
          // },

          // {
          //   title: 'GRAND',
          //   valueType: 'group',
          //   columns: [
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.init_amount' }),
          //       dataIndex: 'init_amount3',
          //       valueType: 'digit',
          //       width: 'xs',
          //       fieldProps: {
          //         min: 0,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //     },
          //     {
          //       title: FormattedMessage({ id: 'game.info.jackpot.comm_ratio' }),
          //       width: 'md',
          //       dataIndex: 'comm_ratio3',
          //       valueType: 'digit',
          //       fieldProps: {
          //         formatter: (value) => `${value || 0}%`,
          //         parser: (value) => {
          //           try {
          //             return math.number(
          //               isNaN(+value!.replace('%', '')) ? 0 : value!.replace('%', ''),
          //             );
          //           } catch (error) {
          //             return 0;
          //           }
          //         },
          //         min: 0,
          //         max: 100,
          //         disabled: true,
          //       },
          //       colProps: {
          //         xs: 12,
          //       },
          //       formItemProps: {
          //         rules: [
          //           {
          //             required: true,
          //             message: '此项为必填项',
          //           },
          //         ],
          //       },
          //     },
          //   ],
          // },
        ]}
      />
      <BetaSchemaForm<any>
        layoutType={'ModalForm'}
        onVisibleChange={addAndEditForm.setShow}
        formRef={addAndEditForm.formRef}
        visible={addAndEditForm.show}
        title={
          addAndEditForm.isEdit
            ? FormattedMessage({ id: 'common.edit' }) + FormattedMessage({ id: 'menu.game.info' })
            : FormattedMessage({ id: 'pages.new' }) + FormattedMessage({ id: 'menu.game.info' })
        }
        rowProps={{
          gutter: [16, 16],
        }}
        colProps={{
          span: 12,
        }}
        onFinish={async (values) => {
          if (addAndEditForm.isEdit) {
            await edit({ ...addAndEditForm.data, ...values });
          } else {
            await create(values);
          }
          actionRef?.current?.reload();
          return true;
        }}
        columns={[
          {
            title: formatMessage({
              id: 'game.info.game_code',
            }),
            dataIndex: 'game_code',
            formItemProps: {
              rules: [
                {
                  required: true,
                },
                {
                  max: 50,
                },
              ],
            },
            hideInForm: !addAndEditForm.isEdit,
            readonly: true,
          },
          {
            title: formatMessage({
              id: 'game.info.game_name',
            }),
            dataIndex: 'game_name',
            formItemProps: {
              rules: [
                {
                  required: true,
                },
                {
                  max: 50,
                },
              ],
            },
          },
          {
            title: formatMessage({
              id: 'game.info.code_type',
            }),
            dataIndex: 'code_type',
            valueType: 'select',
            fieldProps: {
              disabled: addAndEditForm.isEdit,
            },
            request: async () => {
              return [
                { label: FormattedMessage({ id: 'dict.code_type.CGJP' }), value: 'JP' },
                { label: FormattedMessage({ id: 'dict.code_type.CGSG' }), value: 'SG' },
              ];
            },
          },
          {
            title: formatMessage({
              id: 'game.info.game_type',
            }),
            dataIndex: 'game_type',
            fieldProps: {
              disabled: addAndEditForm.isEdit,
            },
            async request() {
              const res = await getGameType({ game_category: 1 });
              return ((res.data as any) ?? []).map((v: any) => ({ label: v.name, value: v.id }));
            },
            valueType: 'select',
            formItemProps: {
              rules: [
                {
                  required: true,
                },
              ],
            },
          },
          {
            title: formatMessage({
              id: 'game.info.draw_source_url',
            }),
            dataIndex: 'draw_source_url',
            valueType: 'textarea',
            formItemProps: {
              rules: [
                {
                  required: true,
                },
                {
                  max: 500,
                },
                {
                  validator: async (rule, value) => {
                    try {
                      new URL(value);
                    } catch (error) {
                      return Promise.reject('格式错误, 需要输入合法域名');
                    }
                    return Promise.resolve();
                  },
                },
              ],
            },
          },
          {
            title: formatMessage({
              id: 'game.info.game_category',
            }),
            dataIndex: 'game_category',
            hideInForm: true,
            fieldProps: {
              value: 1,
              defaultValue: 1,
            },
          },
        ]}
      />
    </PageHeaderWrapper>
  );
};
