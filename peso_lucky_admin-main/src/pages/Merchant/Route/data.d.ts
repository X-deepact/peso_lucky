export interface Params {}
export interface ListItem {
  account_type: number;
  id: string;
  merchant_code: string;
  merchant_name: string;
  merchant_company: string;
  merchant_type: number;
  merchant_agent: string;
  enable_status: number;
  platform_fee: string;
  remark: string;
  domain_url: string;
  commission_type: number;
  currency: string;
  contact_no: string;
  valid_status: 1 | 2;
}
