import moment from 'moment';
import { useIntl } from 'umi';

export const getDefaultDateTimeRange = (day: number) => {
  return [
    moment().subtract(day, 'days').hours(0).minute(0).second(0).millisecond(0),
    moment().hours(23).minute(59).second(59).millisecond(999),
  ];
};
export const getToDayRange = () => getDefaultDateTimeRange(0);
// 昨天
export const getYesterdayRange = () => [
  moment().subtract(1, 'days').hours(0).minute(0).second(0).millisecond(0),
  moment().subtract(1, 'days').hours(23).minute(59).second(59).millisecond(999),
];
// 近七天
export const getWeekRange = () => getDefaultDateTimeRange(6);
// 上个月
export const getLastMonthRange = () => [
  moment().subtract(1, 'months').date(1).hours(0).minute(0).second(0).millisecond(0),
  moment().date(1).hours(23).minute(59).second(59).millisecond(0).subtract(1, 'days'),
];
// 本月
export const getThisMonthRange = () => [
  moment().date(1).hours(0).minute(0).second(0).millisecond(0),
  moment().hours(23).minute(59).second(59).millisecond(999),
];
// 近三十天
export const getMonthRange = () => getDefaultDateTimeRange(29);
// 近三个月（90天）
export const getThreeMonthRange = () => getDefaultDateTimeRange(89);

export const getDateTimeRange = () => {
  return {
    今天: getToDayRange(),
    昨天: getYesterdayRange(),
    近七天: getWeekRange(),
    近三十天: getMonthRange(),
    '近三个月（90天）': getThreeMonthRange(),
  };
};

export const dateOptions = [
  {
    label: 'today',
    value: [
      moment().subtract(0, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: 'yesterday',
    value: [
      moment().subtract(1, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: '3D',
    value: [
      moment().subtract(3, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: '7D',
    value: [
      moment().subtract(7, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: '15D',
    value: [
      moment().subtract(15, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: '30D',
    value: [
      moment().subtract(30, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
  {
    label: '90D',
    value: [
      moment().subtract(90, 'days').startOf('days'),
      moment().subtract(0, 'days').endOf('day'),
    ],
  },
];
// 新的统一时间查询条件
export const useNewGetDateTime = () => {
  const intl = useIntl();
  return {
    [intl.formatMessage({ id: 'lotteryMonitoring.today', defaultMessage: '今天' })]:
      getToDayRange(),
    [intl.formatMessage({ id: 'lotteryMonitoring.yesterday', defaultMessage: '昨天' })]:
      getYesterdayRange(),
    '3D': dateOptions[2].value,
    '7D': dateOptions[3].value,
    '15D': dateOptions[4].value,
    '30D': dateOptions[5].value,
    '90D': dateOptions[6].value,
  };
};
