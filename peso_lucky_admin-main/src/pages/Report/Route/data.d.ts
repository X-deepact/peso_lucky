export interface Params {}
export interface ListItem {
  amount: number;
  bet_count: number;
  bet_users: number;
  currency: string;
  merchant_name: string;
  profit_amount: number;
  profit_rate: string;
  valid_bet: number;
}
export interface DetailItem {
  amount: number;
  bet_count: number;
  bet_users: number;
  created_at: number;
  currency: string;
  profit_amount: number;
  profit_rate: string;
  valid_bet: number;
}
