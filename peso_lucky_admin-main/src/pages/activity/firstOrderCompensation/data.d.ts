export interface DataItem {
  id: number;
  act_type: number;
  act_name: string;
  act_id: string;
  act_switch: number;
  eligible_user_type: number;
  eligible_merchant_type: number;
  eligible_game_type: number;
  description: string;
  act_share_image_url: string;
  act_start_at: number;
  act_end_at: number;
  first_open_time: number;
  act_frequency: number;
  ip_limit: number;
  merchant_ids: string[];
  game_codes: string[];
  reward_threshold: Rewardthreshold[];
}

export interface Rewardthreshold {
  id: number;
  act_id: number;
  refund_percentage: number;
  max_reward_amount: number;
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
  valid_status: number;
  participation_threshold_start: number;
  participation_threshold_end: number;
}

export interface MerchantListItem {
  id: string;
  merchant_code: string;
  merchant_name: string;
  merchant_company: string;
  merchant_type: number;
  merchant_agent: string;
  md5_secret: string;
  aes_secret: string;
  merchant_password: string;
  enable_status: number;
  platform_fee_type: number;
  platform_fee: number;
  remark: string;
  commission_type: number;
  rate_plan_id: string;
  currency: string;
  contact_no: string;
  business_connect: string;
  account_type: number;
  valid_status: number;
  site_id: number;
  created_at: number;
  updated_at: number;
  created_by: string;
  updated_by: string;
  order_clause: string;
  domain_url: string;
  plan_name: string;
  ip: string;
  balance: string;
  health_api: string;
  balance_api: string;
  place_bet_api: string;
  cancel_bet_api: string;
  payout_api: string;
  cancel_order_api: string;
  re_settle_api: string;
  dealer_reward_api: string;
  cancel_reward_api: string;
}

export interface GameListItem {
  id: number;
  game_code: string;
  code_type: string;
  game_name: string;
  game_type: number;
  game_category: number;
  theory_return_rate: string;
  actual_return_rate: string;
  play_method_id: number;
  prize_pool_para_id: number;
  video_source_url: string;
  draw_source_url: string;
  rec_chip_id: number;
  status: number;
  chatroom_status: number;
  bet_option_num: number;
  created_at: number;
  updated_at: number;
  updated_by: string;
  created_by: string;
}
type SysJobGet = RespGet<SysJobItem>;
