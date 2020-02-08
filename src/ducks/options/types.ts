import { CurrencyKey } from 'constants/currency';

export type Phase = 'Bidding' | 'Trading' | 'Maturity' | 'Destruction';

export type Side = 'Long' | 'Short';

export type OptionsTransaction = {
	type: 'refund' | 'bid';
	timestamp: number;
	address: string;
	currencyKey: CurrencyKey;
	side: Side;
	amount: number;
};

export type OptionsTransactions = OptionsTransaction[];

export type OptionsMarket = {
	timestamp: number;
	currencyKey: CurrencyKey;
	marketAddress: string;
	creatorAddress: string;
	phase: Phase;
	maturityDate: number;
	destructionDate: number;
	strikePrice: number; // strike price
	endOfBidding: number;
	prices: {
		long: number;
		short: number;
	};
	poolSize: number; // deposited in smart contract,
	transactions: OptionsTransactions;
};

export type OptionsMarkets = OptionsMarket[];
export type OptionsMarketsMap = Record<string, OptionsMarket>;
