export interface Params {}
export interface ListItem {
  code_type: string;
  id: number;
  game_code: string;
  game_name: string;
  game_type: number;
  game_category: number;
  theory_return_rate: string;
  actual_return_rate: string;
  play_method_id: number;
  prize_pool_para_id: number;
  video_source_url: string;
  rec_chip_id: number;
  status: number;
  created_at: number;
  updated_at: number;
  updated_by: string;
  created_by: string;
}
export interface ChipItem {
  id: number;
  game_id: number;
  currency: string;
  chips: string;
  created_at: number;
  updated_at: number;
  updated_by: string;
  created_by: string;
}
export interface GameRuleItem {
  id: number;
  game_id: number;
  a_name: string;
  a_odds: number;
  b_name: string;
  b_odds: number;
  c_name: string;
  c_odds: number;
  min_bet: number;
  max_bet: number;
  max_payout: number;
  created_at: number;
  updated_at: number;
  updated_by: string;
  created_by: string;
}
