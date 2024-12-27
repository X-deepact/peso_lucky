export interface Params {}
export interface ListItem {
	id: number;
	seq: string;
	order_number: string;
	user_id: number;
	nickname: string;
	currency: string;
	game_id: number;
	game_name: string;
	merchant_id: number;
	merchant_name: string;
	init_prize_amount: number;
	second_prize_amount: number;
	adjust_amount: number;
	win_lose_amount: string;
	win_lose_adjustment: number;
	not_recycle_mult_amount: number;
	not_recycle_jackpot_amount: number;
	status: number;
	settle_time: number;
	updated_at: number;
	created_at: number;
}