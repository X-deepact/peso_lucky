export interface Params {}
export interface ListItem {
	id: number;
	merchant_id: number;
	merchant_code: string;
	merchant_user_id: string;
	nickname: string;
	password: string;
	avatar: string;
	balance: number;
	status: number;
	login_time: number;
	login_ip: string;
	first_login_ip: string;
	created_at: number;
	created_by: string;
	updated_at: number;
	updated_by: string;
	site_id: number;
}