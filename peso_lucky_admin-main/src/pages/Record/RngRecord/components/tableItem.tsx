import { useRef, useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import FormattedMessage from '@/components/FormattedMessage';
import type { ProColumns } from '@ant-design/pro-table';
import { Tag, Row, Col, Image, Space } from 'antd';
import { colorGameColors, dropGameBgs } from '@/utils/color';
import ProTable from '@ant-design/pro-table';
import { queryRng } from '../service';
import { useIntl } from 'umi';
import { ProCard, type ActionType, type ProFormInstance } from '@ant-design/pro-components';
import { map, values } from 'lodash';
import { dateOptions, useNewGetDateTime } from '@/utils/dateRange';
interface Props {
  game_id: number;
  game_type: number;
}
const defaultWheeltitles = [
  'WheelGame3x',
  'WheelGame10x',
  'WheelGame20x',
  'WheelGame60x',
  'WheelGame100x',
  'WheelGameMinor',
  'WheelGameMajor',
  'WheelGameGrand',
];
const dbgtWheelTitles1 = ['5x', '10x', '20x', 'bonus'];
const dbgtWheelTitles2 = ['50x', '100x', '200x', '200x/jackpot'];
const colorText = ['yellow', 'white', 'pink', 'blue', 'red', 'green'];
const TableItem = (props: Props) => {
  const tableRef = useRef<ActionType>();
  const intl = useIntl();
  const { game_id, game_type } = props;
  const searchFormRef = useRef<ProFormInstance>();

  const getBinomCell = (v: any, t?: any) => {
    if (!v || Number.isNaN(v))
      return {
        value: '0.00%',
        style: {
          color: '#f00',
        },
      };

    const formatterValue = v === 0 ? '' : `${(v * 100).toFixed(2)}%`;
    return {
      value: t === 1 ? v.toFixed(9) : formatterValue,
      style: {
        color: v < 0.05 ? '#f00' : '#000',
      },
    };
  };

  const columns: ProColumns[] = [
    {
      title: <FormattedMessage id="rngRecord.time" defaultMessage="时间区间" />,
      hideInTable: true,
      dataIndex: 'dateTimeRange',
      valueType: 'dateTimeRange',
      fieldProps: {
        ranges: useNewGetDateTime(),
      },
      search: {
        transform: (value: any) => {
          const start_at = moment(value[0]).valueOf();
          const end_at = moment(value[1]).milliseconds(999).valueOf(); // 补偿时间选择器给的时间没有毫秒，导致查询当天数据有差异;
          return {
            start_at,
            end_at,
          };
        },
      },
    },
    {
      dataIndex: 'seq',
      key: 'seq',
      title: <FormattedMessage id="rngRecord.number" defaultMessage="最近期数" />,
      hideInTable: true,
      valueType: 'digit',
      // fieldProps: {
      //   min: 1,
      // },
    },

    {
      dataIndex: 'head',
      key: 'head',
      title: '',
      hideInSearch: true,
      width: 150,
    },
    ...map(game_type === 2 ? dropGameBgs : colorGameColors, (v, i) => {
      return {
        dataIndex: i.toString(),
        key: i.toString(),
        title:
          game_type === 2 ? (
            <Image width={31} src={dropGameBgs[i ?? 0]} />
          ) : (
            <Tag style={{ border: '1px solid #000', color: 'transparent' }} color={v}>
              {i + 1}
            </Tag>
          ),
        width: 120,
        hideInSearch: true,
        render: (value: any) => <span style={value?.style}>{value?.value || value}</span>,
      };
    }),
    // ...colorGameColors.map((v, i) => {
    //   // debugger;
    //   return {
    //     dataIndex: i.toString(),
    //     key: i.toString(),
    //     title: (
    //       <Tag style={{ border: '1px solid #000', color: 'transparent' }} color={v}>
    //         {i + 1}
    //       </Tag>
    //     ),
    //     width: 120,
    //     hideInSearch: true,
    //   };
    // }),
  ];

  const columns1: ProColumns[] = [
    {
      dataIndex: 'head',
      key: 'head',
      title: '',
      hideInSearch: true,
      width: 100,
    },
    ...map(game_type === 2 ? dropGameBgs : colorText, (v, i) => {
      return {
        dataIndex: i.toString(),
        key: i.toString(),
        title:
          game_type === 2 ? (
            <>
              3<Image width={31} src={dropGameBgs[i ?? 0]} />
            </>
          ) : (
            <>3 {colorText[i]}</>
          ),
        width: 120,
        hideInSearch: true,
        // render: (value: any) => <span style={value?.style || {}}>{value?.value || value}</span>,
        render: (value: any) =>
          typeof value === 'object' && value !== null ? (
            <span style={value.style}>{value.value}</span>
          ) : (
            <span>{value}</span>
          ),
      };
    }),
  ];

  const defaultWheelcolumns = [
    {
      dataIndex: 'head',
      key: 'head',
      title: '',
      hideInSearch: true,
      width: 100,
    },
    ...map(defaultWheeltitles, (v, i) => {
      return {
        dataIndex: i.toString(),
        key: i.toString(),
        title: v,
        width: 100,
        hideInSearch: true,
        render: (value: any) => <span style={value?.style}>{value?.value || value}</span>,
      };
    }),
  ];

  const dbgWheelcolumns1 = [
    {
      dataIndex: 'head',
      key: 'head',
      title: '',
      hideInSearch: true,
      width: 100,
    },
    ...map(dbgtWheelTitles1, (v, i) => {
      return {
        dataIndex: i.toString(),
        key: i.toString(),
        title: v,
        width: 100,
        hideInSearch: true,
        render: (value: any) => <span style={value?.style}>{value?.value || value}</span>,
      };
    }),
  ];

  const dbgWheelcolumns2 = [
    {
      dataIndex: 'head',
      key: 'head',
      title: '',
      hideInSearch: true,
      width: 100,
    },
    ...map(dbgtWheelTitles2, (v, i) => {
      return {
        dataIndex: i.toString(),
        key: i.toString(),
        title: v,
        width: 100,
        hideInSearch: true,
        render: (value: any) => <span style={value?.style}>{value?.value || value}</span>,
      };
    }),
  ];

  const formate = (v: any) => {
    if (!v) return '0.00%';
    if (Number.isNaN(v)) return '0.00%';
    return `${(v * 100).toFixed(2)}%`;
  };

  const getData = (data: any) => {
    const dataSource = [
      {
        head: intl.formatMessage({
          id: 'rngRecord.nums',
          defaultMessage: '实际出现次数',
        }),
        0: data.single_count.one_count,
        1: data.single_count.two_count,
        2: data.single_count.three_count,
        3: data.single_count.four_count,
        4: data.single_count.five_count,
        5: data.single_count.six_count,
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.probability',
          defaultMessage: '实际出现概率',
        }),
        0: formate(data.single_rate.one_rate),
        1: formate(data.single_rate.two_rate),
        2: formate(data.single_rate.three_rate),
        3: formate(data.single_rate.four_rate),
        4: formate(data.single_rate.five_rate),
        5: formate(data.single_rate.six_rate),
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.bionm',
          defaultMessage: '单色P值',
        }),
        0: getBinomCell(data.single_p_value.one_binom),
        1: getBinomCell(data.single_p_value.two_binom),
        2: getBinomCell(data.single_p_value.three_binom),
        3: getBinomCell(data.single_p_value.four_binom),
        4: getBinomCell(data.single_p_value.five_binom),
        5: getBinomCell(data.single_p_value.six_binom),
      },
    ];
    return dataSource;
  };

  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // 另外两个表格
  const tripleDataExists = Object.keys(data?.triple_count || {}).length > 0;
  const wheelDataExists = Object.keys(data?.wheel_count || {}).length > 0;

  // 三色出现情况
  const tripleData = () => {
    const triple_count = data?.triple_count || {}; // 先提供一个默认的空对象，防止 undefined 错误
    const triple_rate = data?.triple_rate || {};
    const triple_p_value = data?.triple_p_value || {};

    const triple = [
      {
        head: intl.formatMessage({
          id: 'rngRecord.nums',
          defaultMessage: '三同色出现次数',
        }),
        0: triple_count.one_count ?? 0,
        1: triple_count.two_count ?? 0,
        2: triple_count.three_count ?? 0,
        3: triple_count.four_count ?? 0,
        4: triple_count.five_count ?? 0,
        5: triple_count.six_count ?? 0,
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.probability',
          defaultMessage: '	三同色出现概率',
        }),
        0: formate(triple_rate.one_rate),
        1: formate(triple_rate.two_rate),
        2: formate(triple_rate.three_rate),
        3: formate(triple_rate.four_rate),
        4: formate(triple_rate.five_rate),
        5: formate(triple_rate.six_rate),
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.bionm.multiple',
          defaultMessage: '	三同色P值',
        }),
        0: getBinomCell(triple_p_value.one_binom, 1),
        1: getBinomCell(triple_p_value.two_binom, 1),
        2: getBinomCell(triple_p_value.three_binom, 1),
        3: getBinomCell(triple_p_value.four_binom, 1),
        4: getBinomCell(triple_p_value.five_binom, 1),
        5: getBinomCell(triple_p_value.six_binom, 1),
      },
    ];

    return triple_count ? triple : []; // 确保 triple_count 存在后再返回 triple 数据
  };

  // 轮盘触发总局数
  const wheelDataDefault = () => {
    const wheel_count = data?.wheel_count || {}; // 先提供一个默认的空对象，防止 undefined 错误
    const wheel_rate = data?.wheel_rate || {};
    const wheel_p_value = data?.wheel_p_value || {};
    if (!wheel_count) return [];
    if (game_type === 2) {
      return [
        {
          head: intl.formatMessage({
            id: 'rngRecord.nums',
            defaultMessage: '实际出现次数',
          }),
          0: wheel_count.five_count ?? 0,
          1: wheel_count.ten_count ?? 0,
          2: wheel_count.twenty_count ?? 0,
          3: wheel_count.fifty_count ?? 0,
          4: wheel_count.one_hundred_count ?? 0,
          5: wheel_count.two_hundred_count ?? 0,
          6: wheel_count.jackpot_count ?? 0,
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.probability',
            defaultMessage: '实际出现概率',
          }),
          0: formate(wheel_rate.five_rate),
          1: formate(wheel_rate.ten_rate),
          2: formate(wheel_rate.twenty_rate),
          3: formate(wheel_rate.fifty_rate),
          4: formate(wheel_rate.one_hundred_rate),
          5: formate(wheel_rate.two_hundred_rate),
          6: formate(wheel_rate.jackpot_rate),
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.bionm',
            defaultMessage: '单色P值',
          }),
          0: getBinomCell(wheel_p_value.five_binom, 1),
          1: getBinomCell(wheel_p_value.ten_binom, 1),
          2: getBinomCell(wheel_p_value.twenty_binom, 1),
          3: getBinomCell(wheel_p_value.fifty_binom, 1),
          4: getBinomCell(wheel_p_value.one_hundred_binom, 1),
          5: getBinomCell(wheel_p_value.two_hundred_binom, 1),
          6: getBinomCell(wheel_p_value.jackpot_binom, 1),
        },
      ];
    }

    const wheel = [
      {
        head: intl.formatMessage({
          id: 'rngRecord.nums',
          defaultMessage: '实际出现次数',
        }),
        0: wheel_count.three_count ?? 0,
        1: wheel_count.ten_count ?? 0,
        2: wheel_count.twenty_count ?? 0,
        3: wheel_count.sixty_count ?? 0,
        4: wheel_count.one_hundred_count ?? 0,
        5: wheel_count.minor_count ?? 0,
        6: wheel_count.major_count ?? 0,
        7: wheel_count.grand_count ?? 0,
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.probability',
          defaultMessage: '实际出现概率',
        }),
        0: formate(wheel_rate.three_rate),
        1: formate(wheel_rate.ten_rate),
        2: formate(wheel_rate.twenty_rate),
        3: formate(wheel_rate.sixty_rate),
        4: formate(wheel_rate.one_hundred_rate),
        5: formate(wheel_rate.minor_rate),
        6: formate(wheel_rate.major_rate),
        7: formate(wheel_rate.grand_rate),
      },
      {
        head: intl.formatMessage({
          id: 'rngRecord.bionm',
          defaultMessage: '单色P值',
        }),
        0: getBinomCell(wheel_p_value.three_binom, 1),
        1: getBinomCell(wheel_p_value.ten_binom, 1),
        2: getBinomCell(wheel_p_value.twenty_binom, 1),
        3: getBinomCell(wheel_p_value.sixty_binom, 1),
        4: getBinomCell(wheel_p_value.one_hundred_binom, 1),
        5: getBinomCell(wheel_p_value.minor_binom, 1),
        6: getBinomCell(wheel_p_value.major_binom, 1),
        7: getBinomCell(wheel_p_value.grand_binom, 1),
      },
    ];

    return wheel_count ? wheel : []; // 确保 triple_count 存在后再返回 triple 数据
  };

  const wheelDataDBG = () => {
    const wheel_count = data?.wheel_count || {}; // 先提供一个默认的空对象，防止 undefined 错误
    const wheel_rate = data?.wheel_rate || {};
    const wheel_p_value = data?.wheel_p_value || {};
    if (!wheel_count) return [];
    return [
      [
        {
          head: intl.formatMessage({
            id: 'rngRecord.nums',
            defaultMessage: '实际出现次数',
          }),
          0: wheel_count.five_count ?? 0,
          1: wheel_count.ten_count ?? 0,
          2: wheel_count.twenty_count ?? 0,
          3: wheel_count.bonus_count ?? 0,
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.probability',
            defaultMessage: '实际出现概率',
          }),
          0: formate(wheel_rate.five_rate),
          1: formate(wheel_rate.ten_rate),
          2: formate(wheel_rate.twenty_rate),
          3: formate(wheel_rate.bonus_rate),
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.bionm',
            defaultMessage: '单色P值',
          }),
          0: getBinomCell(wheel_p_value.five_binom, 1),
          1: getBinomCell(wheel_p_value.ten_binom, 1),
          2: getBinomCell(wheel_p_value.twenty_binom, 1),
          3: getBinomCell(wheel_p_value.bonus_binom, 1),
        },
      ],
      [
        {
          head: intl.formatMessage({
            id: 'rngRecord.nums',
            defaultMessage: '实际出现次数',
          }),
          0: wheel_count.fifty_count ?? 0,
          1: wheel_count.one_hundred_count ?? 0,
          2: wheel_count.two_hundred_count ?? 0,
          3: wheel_count.jackpot_count ?? 0,
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.probability',
            defaultMessage: '实际出现概率',
          }),
          0: formate(wheel_rate.fifty_rate),
          1: formate(wheel_rate.one_hundred_rate),
          2: formate(wheel_rate.two_hundred_rate),
          3: formate(wheel_rate.jackpot_rate),
        },
        {
          head: intl.formatMessage({
            id: 'rngRecord.bionm',
            defaultMessage: '单色P值',
          }),
          0: getBinomCell(wheel_p_value.fifty_binom, 1),
          1: getBinomCell(wheel_p_value.one_hundred_binom, 1),
          2: getBinomCell(wheel_p_value.two_hundred_binom, 1),
          3: getBinomCell(wheel_p_value.jackpot_binom, 1),
        },
      ],
    ];
  };
  // 初始化参数
  useEffect(() => {
    // 默认查询今天的数据, 需要手动设置，默认值不生效
    searchFormRef.current?.setFieldsValue({
      dateTimeRange: dateOptions[5].value,
    });
    searchFormRef.current?.submit();
  }, []);

  return (
    <div
      style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}
    >
      <ProTable
        columns={columns}
        pagination={false}
        actionRef={tableRef}
        manualRequest={true}
        formRef={searchFormRef}
        request={async (params: any) => {
          setLoading(true);
          const res: any = await queryRng({
            ...params,
            game_id,
            start_at: params.start_at?.toString(),
            end_at: params.end_at?.toString(),
          }).finally(() => {
            setLoading(false);
          });

          setData(res.data);
          return Promise.resolve({
            data: getData(res.data),
            total: 0,
            success: true,
          });
        }}
        search={{
          defaultCollapsed: false,
          span: 12,
          layout: 'vertical',
        }}
        title={() => (
          <Row justify={'space-between'}>
            <Col>
              {intl.formatMessage({
                id: 'rngRecord.timeTotal',
                defaultMessage: '总期数',
              })}
              : {data?.round_count}
            </Col>
            <Col
              style={{
                color: Number(data?.chisq ?? 0) * 100 <= 1 ? '#D9001B' : '#4B7902',
              }}
            >
              {intl.formatMessage({
                id: 'rngRecord.chisq',
                defaultMessage: 'CHISQ校验P值',
              })}
              : {`${(Number(data?.chisq) * 100).toFixed(2)}%`}
            </Col>
          </Row>
        )}
        toolBarRender={false}
      />
      {tripleDataExists && (
        <ProTable
          columns={columns1}
          dataSource={tripleData()}
          loading={loading}
          search={false}
          toolBarRender={false}
          pagination={false}
          // title={() => '轮盘触发总局数'}
        />
      )}
      {wheelDataExists &&
        (game_type === 2 ? (
          <div style={{ width: '100%', display: 'flex', gap: '40px' }}>
            <ProTable
              style={{ flex: 1 }}
              columns={dbgWheelcolumns1}
              dataSource={wheelDataDBG()[0]}
              loading={loading}
              search={false}
              toolBarRender={false}
              pagination={false}
              title={() => (
                <Row justify={'space-between'}>
                  <Col>
                    {intl.formatMessage({
                      id: 'rngRecord.wheelTotal',
                      defaultMessage: '轮盘触发总局数',
                    })}
                    : {data?.round_count_wheel ?? 0}
                  </Col>
                </Row>
              )}
            />
            <ProTable
              style={{ flex: 1 }}
              columns={dbgWheelcolumns2}
              dataSource={wheelDataDBG()[1]}
              loading={loading}
              search={false}
              toolBarRender={false}
              pagination={false}
              title={() => (
                <Row justify={'space-between'}>
                  <Col>
                    {intl.formatMessage({
                      id: 'rngRecord.wheelTotal.2',
                      defaultMessage: '内层层转盘触发总局数',
                    })}
                    : {data?.wheel_count?.bonus_count ?? 0}
                  </Col>
                </Row>
              )}
            />
          </div>
        ) : (
          <ProTable
            columns={defaultWheelcolumns}
            dataSource={wheelDataDefault()}
            loading={loading}
            search={false}
            toolBarRender={false}
            pagination={false}
            title={() => (
              <Row justify={'space-between'}>
                <Col>
                  {intl.formatMessage({
                    id: 'rngRecord.wheelTotal',
                    defaultMessage: '轮盘触发总局数',
                  })}
                  : {data?.round_count_wheel ?? 0}
                </Col>
              </Row>
            )}
          />
        ))}
    </div>
  );
};

export default TableItem;
