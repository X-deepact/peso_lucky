// import card9 from './images/card9.png';
// import card10 from './images/card10.png';
// import cardA from './images/cardA.png';
// import cardJ from './images/cardJ.png';
// import cardQ from './images/cardQ.png';
// import cardK from './images/cardK.png';

import card9 from './images/cards_0.png';
import card10 from './images/cards_1.png';
import cardJ from './images/cards_2.png';
import cardQ from './images/cards_3.png';
import cardK from './images/cards_4.png';
import cardA from './images/cards_5.png';
import { formatMessage } from 'umi';

// import pineappleImg from './images/pineapple_mini.png';
// import bananaImg from './images/banana_mini.png';
// import strawberryImg from './images/strawberry_mini.png';
// import orangeImg from './images/orange_mini.png';
// import watermelonImg from './images/watermelon_mini.png';
// import grapesImg from './images/grapes_mini.png';

export const colorGameColors = ['#f7d367', '#fcfcfc', '#d446b9', '#4672ca', '#a42832', '#448334'];

export const dropGameBgs = [card9, cardK, cardJ, cardQ, cardA, card10];
export const dropGames = ['pineapple', 'banana', 'strawberry', 'orange', 'watermelon', 'grapes'];

// export const dropGameBgs = [
//   pineappleImg,
//   bananaImg,
//   strawberryImg,
//   orangeImg,
//   watermelonImg,
//   grapesImg,
// ];
export const isCanSecond = (v?: string) => v?.length === 3 && new Set(v).size === 1;

export const getJackpotOptions = (game_type: number | string) => {
  if (game_type == 1) {
    return [
      { value: '3', label: formatMessage({ id: 'multiple.3' }) },
      { value: '10', label: formatMessage({ id: 'multiple.10' }) },
      { value: '20', label: formatMessage({ id: 'multiple.20' }) },
      { value: '60', label: formatMessage({ id: 'multiple.60' }) },
      { value: '100', label: formatMessage({ id: 'multiple.100' }) },
      { value: '88801', label: formatMessage({ id: 'multiple.88801' }) },
      { value: '88802', label: formatMessage({ id: 'multiple.88802' }) },
      { value: '88803', label: formatMessage({ id: 'multiple.88803' }) },
    ];
  }
  return [
    { value: '5', label: formatMessage({ id: 'multiple.5' }) },
    { value: '10', label: formatMessage({ id: 'multiple.10' }) },
    { value: '20', label: formatMessage({ id: 'multiple.20' }) },
    { value: '50', label: formatMessage({ id: 'multiple.50' }) },
    { value: '100', label: formatMessage({ id: 'multiple.100' }) },
    { value: '200', label: formatMessage({ id: 'multiple.200' }) },
    { value: '88801', label: formatMessage({ id: 'multiple.jackpot' }) },
  ];
};
