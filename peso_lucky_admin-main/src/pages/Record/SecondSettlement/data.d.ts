export interface Params {}
export interface ListItem {
  id: number;
  seq: string;
  game_id: number;
  game_name: string;
  order_count: number;
  user_count: number;
  mer_count: number;
  init_prize_amount: number;
  second_prize_amount: number;
  init_settle_first_result: string;
  init_settle_second_result: string;
  second_settle_first_result: string;
  second_settle_second_result: string;
  recycle_win_amount: number;
  not_recycle_mult_amount: number;
  not_recycle_jackpot_amount: number;
  jackpot_deficit_amount: number;
  // status: number;
  updated_by: string;
  remark: string;
  settle_time: number;
  updated_at: number;
  created_at: number;
}
