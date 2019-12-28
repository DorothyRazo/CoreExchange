import { takeLatest, put } from 'redux-saga/effects';
import { createSlice, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';
import orderBy from 'lodash/orderBy';
import keyBy from 'lodash/keyBy';

import { L2_API_URL } from 'src/constants/l2';
import snxJSConnector from 'src/utils/snxJSConnector';
import { bytesFormatter, getAddress } from 'src/utils/formatters';
import { SYNTHS_MAP } from 'src/constants/currency';

export const leaderboardSlice = createSlice({
	name: 'leaderboard',
	initialState: {
		data: [],
		lastUpdated: null,
		loadingError: null,
		isLoading: false,
		isLoaded: false,
		isRefreshing: false,
	},
	reducers: {
		fetchRequest: state => {
			state.loadingError = null;
			state.isLoading = true;
			if (state.isLoaded) {
				state.isRefreshing = true;
			}
		},
		fetchFailure: (state, action) => {
			state.loadingError = action.payload.error;
			state.isLoading = false;
			state.isRefreshing = false;
		},
		fetchSuccess: (state, action) => {
			const { data } = action.payload;

			state.data = data;
			state.lastUpdated = Date.now();
			state.isLoading = false;
			state.isRefreshing = false;
			state.isLoaded = true;
		},
	},
});

export const getLeaderboardState = state => state.leaderboard;
export const getIsLoadingLeaderboard = state => getLeaderboardState(state).isLoading;
export const getIsRefreshingLeaderboard = state => getLeaderboardState(state).isRefreshing;
export const getIsLoadedLeaderboard = state => getLeaderboardState(state).isLoaded;
export const getLeaderboardLoadingError = state => getLeaderboardState(state).loadingError;
export const getLeaderboardData = state => getLeaderboardState(state).data;

export const getSortedLeaderboard = createSelector(getLeaderboardData, leaderboardData =>
	orderBy(leaderboardData, 'assetValue', 'desc').map((d, idx) => ({ rank: idx + 1, ...d }))
);

export const getSortedLeaderboardMap = createSelector(getSortedLeaderboard, sortedLeaderboardData =>
	keyBy(sortedLeaderboardData, item => getAddress(item.address))
);

export const getTop10Leaders = createSelector(getSortedLeaderboard, sortedLeaderboardData =>
	sortedLeaderboardData.slice(0, 10)
);

export const {
	fetchRequest: fetchLeaderboardRequest,
	fetchSuccess: fetchLeaderboardSuccess,
	fetchFailure: fetchLeaderboardFailure,
} = leaderboardSlice.actions;

function* fetchLeaderboard() {
	// const { synthSummaryUtilContract } = snxJSConnector;
	try {
		throw Error('Leaderboard is currently down. We are working on a fix - should be up shortly');
		// const results = yield axios.get(`${L2_API_URL}/api/holders`);
		// const holders = results.data;

		// const balances = yield synthSummaryUtilContract.totalSynthsInKeyForAccounts(
		// 	holders.map(holder => holder.address),
		// 	bytesFormatter(SYNTHS_MAP.sUSD)
		// );

		// yield put(
		// 	fetchLeaderboardSuccess({
		// 		data: holders.map((holder, idx) => ({
		// 			...holder,
		// 			assetValue: balances[idx] / 1e18,
		// 		})),
		// 	})
		// );
	} catch (e) {
		yield put(fetchLeaderboardFailure({ error: e.message }));
	}
}

export function* watchFetchLeaderboardRequest() {
	yield takeLatest(fetchLeaderboardRequest.type, fetchLeaderboard);
}

export default leaderboardSlice.reducer;
