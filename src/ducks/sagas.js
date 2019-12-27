import { all } from 'redux-saga/effects';

import { watchFetchMarketsRequest } from './markets';
import { watchFetchWalletBalancesRequest } from './wallet/walletBalances';
import { watchFetchMyTradesRequest } from './trades/myTrades';
import { watchFetchAllTradesRequest } from './trades/allTrades';
import { watchFetchLeaderboardRequest } from './leaderboard';
import { watchFetchDashboardRequest } from './dashboard';

const rootSaga = function* () {
	yield all([
		watchFetchMarketsRequest(),
		watchFetchWalletBalancesRequest(),
		watchFetchMyTradesRequest(),
		watchFetchAllTradesRequest(),
		watchFetchLeaderboardRequest(),
		watchFetchDashboardRequest(),
	]);
};

export default rootSaga;
