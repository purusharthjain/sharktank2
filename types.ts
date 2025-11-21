
export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  DISPLAY_ACCOUNT = 'displayAccount',
  LOGIN = 'login',
  GET_STOCKS = 'getStocks',
}

export interface TransactionPayload {
  player_id: number;
  password?: string;
  symbol?: string;
  quantity?: number;
  transactionType: TransactionType;
}

export interface ApiResponse {
    success: boolean | string;
    message?: string;
    response?: string;
    data?: any;
}
