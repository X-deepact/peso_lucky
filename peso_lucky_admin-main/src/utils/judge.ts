// enum prize_type {

// }

export function judgePrizeType(prizeType: number) {
  // 88801 minor
  // 88802 major
  // 88803 grand
  // 0 没中奖
  // 其他数字 为中奖倍数

  let str = '';
  switch (prizeType) {
    case 88801:
      str = 'minor';
      break;

    case 88802:
      str = 'major';
      break;

    case 88803:
      str = 'grand';
      break;

    case 0:
      str = ' -- ';
      break;

    default:
      str = `${str} 倍`;
      break;
  }

  return str;
}
