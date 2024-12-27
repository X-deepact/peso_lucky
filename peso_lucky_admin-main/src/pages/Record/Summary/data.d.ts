export interface Params {}
export interface ListItem {
  cancel_at: number;
  cancel_count: number;
  create_at: number;
  game_name: string;
  game_seq: string;
  line_count: number;
  operation_type: number;
  operator: string;
  recoverable_amount: number;
  recovered_amount: number;
  refunded_amount: number;
  remark: string;
  sum_id: number;
  un_recovered_jackpot_amount: number;
  un_recovered_multi_amount: number;
  user_count: number;
}
