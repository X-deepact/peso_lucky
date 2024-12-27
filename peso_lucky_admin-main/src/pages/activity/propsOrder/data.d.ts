export interface Params {}
export interface ListItem {
  second_settlement_tow_result: any;
  game_code_type: string;
  code_type: string;
  second_draw_result: number | string;
  id: number;
  created_at: number;
  updated_at: number;
  prize_at: number;
  merchant_id: string;
  merchant_name: string;
  merchant_user_id: string;
  username: string;
  order_number: string;
  seq: string;
  game_name: string;
  game_code: number;
  play_code: number;
  multiples: number;
  amount: number;
  award_amount: number;
  prize_amount: number;
  status?: number;
  order_type: number;
  ip: string;
  win_lose_amount: number;
  bet_content: string;
  second_bet_content: string;
  jackpot_ratio: number;
  prize_type: number;
  user_id: number;
  device_type: number;
  currency: string;
  settle_time: number;
  game_type: number;
}
