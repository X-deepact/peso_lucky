import { request } from 'umi';

export async function queryDetail(params: { game_code: string }) {
  return request<{
    data: {
      list: {
        game_code: string;
        game_name: string;
        seq: string;
        first_draw_tmp_content: string;
        second_draw_content: string;
      };
    };
  }>('/api/v1/live/detail', {
    method: 'get',
    params,
  });
}

/**第一次开奖 */
export async function firstAward(params: { game_code: string; seq: string }) {
  return request<any>('/api/v1/live/award', {
    method: 'post',
    params,
  });
}

/**第一次开奖确认数据录入 */
export async function firstDraw(params: { game_code: string; seq: string; result: string }) {
  return request<any>('/api/v1/live/monitor/submit/draw', {
    method: 'post',
    params,
  });
}

/**第二次开奖 */
export async function secondAward(params: { game_code: string; seq: string }) {
  return request<any>('/api/v1/live/award/second', {
    method: 'post',
    params,
  });
}

/**第二次开奖确认数据录入 */
export async function secondDraw(params: { game_code: string; seq: string; result: string }) {
  return request<any>('/api/v1/live/monitor/submit/draw/second', {
    method: 'post',
    params,
  });
}

/**开始下局游戏 */
export async function startGame(params: { game_code: string; seq: string }) {
  return request<any>('/api/v1/live/start/game', {
    method: 'post',
    params,
  });
}
