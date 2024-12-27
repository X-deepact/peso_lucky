import { formatMessage, request } from 'umi';
export type GameDetail = {
  game_type: number;
  game_end_second: boolean;
  first_two_second: number;
  game_code: string;
  seq: string;
  status: number;
  next_seq: string;
  game_name: string;
  first_draw_content: string;
  second_draw_content: string;
  first_bet_time_rem: number;
  first_draw_tmp_content: string;
  second_draw_tmp_content: string;
  game_status: 1 | 2 | 3;
  game_code_type: string;
  second_bet_time_rem: number;
  live_status: number;
};
export async function queryDetail(params: { game_code: string }) {
  return request<{
    data: {
      list: GameDetail;
    };
  }>('/api/v1/live2/detail', {
    method: 'get',
    params,
    timeout: 3000,
  });
}

/**第一次开奖 */
export async function firstAward(params: {
  game_code: string;
  seq: string;
  remark?: string;
  result: string;
}) {
  return request<any>('/api/v1/live2/settlement/one', {
    method: 'post',
    params,
  });
}

export async function secondAward(params: {
  game_code: string;
  seq: string;
  result_second?: string;
}) {
  return request<any>('/api/v1/live2/settlement/two', {
    method: 'post',
    params,
  });
}

export async function changeGameStatus(data: { game_code: string; game_status: number }) {
  return request<any>('/api/v1/live/hall/start', {
    method: 'post',
    data,
  });
}

/**开始下局游戏 */
export async function startGame(params: { game_code: string; seq: string }) {
  return request<any>('/api/v1/live2/start/game', {
    method: 'post',
    params,
  });
}
export const gameStatus = {
  0: ' 准备开始(未开奖)',
  10: ' 开始游戏(未开奖)',
  20: ' 停止下注----开奖中',
  30: ' 一次开奖----开奖中',
  60: ' 游戏取消',
  90: ' 开启二次下注(开奖中）',
  100: ' 二次下注结束（开奖中）',
  110: ' 一次开奖结束（最终状态）',
  120: ' 二次开奖结束（最终状态）',
};

export const jackpotOptions = [
  { value: '3', label: formatMessage({ id: 'multiple.3' }) },
  { value: '10', label: formatMessage({ id: 'multiple.10' }) },
  { value: '20', label: formatMessage({ id: 'multiple.20' }) },
  { value: '60', label: formatMessage({ id: 'multiple.60' }) },
  { value: '100', label: formatMessage({ id: 'multiple.100' }) },
  { value: '88801', label: formatMessage({ id: 'multiple.88801' }) },
  { value: '88802', label: formatMessage({ id: 'multiple.88802' }) },
  { value: '88803', label: formatMessage({ id: 'multiple.88803' }) },
];
