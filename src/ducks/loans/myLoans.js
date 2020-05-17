import { createSlice, createSelector } from '@reduxjs/toolkit';
import merge from 'lodash/merge';

import snxJSConnector from '../../utils/snxJSConnector';
import { getWalletInfo } from '../wallet/walletDetails';
import { bigNumberFormatter, toJSTimestamp } from '../../utils/formatters';

export const LOAN_STATUS = {
	OPEN: 'open',
	WAITING: 'waiting',
	CLOSED: 'closed',
	CLOSING: 'closing',
};

export const myLoansSlice = createSlice({
	name: 'myLoans',
	initialState: {
		loans: {},
		loadingError: null,
		isLoading: false,
		isLoaded: false,
		isRefreshing: false,
	},
	reducers: {
		fetchLoansRequest: (state) => {
			state.loadingError = null;
			state.isLoading = true;
			if (state.isLoaded) {
				state.isRefreshing = true;
			}
		},
		fetchLoansFailure: (state, action) => {
			state.loadingError = action.payload.error;
			state.isLoading = false;
			state.isRefreshing = false;
		},
		fetchLoansSuccess: (state, action) => {
			state.loans = merge(state.loans, action.payload.loans);
			state.isLoading = false;
			state.isRefreshing = false;
			state.isLoaded = true;
		},
		createLoan: (state, action) => {
			const { loan } = action.payload;

			// There is no loanID when creating a loan, so we are using the tx hash as key
			state.loans[loan.transactionHash] = loan;
		},
		updateLoan: (state, action) => {
			const { loanID, transactionHash, loanInfo } = action.payload;

			const loanKey = loanID || transactionHash;
			const loan = state.loans[loanKey];

			if (loan != null) {
				state.loans[loanKey] = { ...loan, ...loanInfo };
			}
		},
		swapTxHashWithLoanID: (state, action) => {
			const { loanID, transactionHash } = action.payload;

			const loan = state.loans[transactionHash];

			if (loan != null) {
				state.loans[loanID] = state.loans[transactionHash];
				delete state.loans[transactionHash];
			}
		},
	},
});

export const getMyLoansState = (state) => state.loans.myLoans;
export const getMyLoansMap = (state) => getMyLoansState(state).loans;
export const getIsLoadingMyLoans = (state) => getMyLoansState(state).isLoading;
export const getIsRefreshingMyLoans = (state) => getMyLoansState(state).isRefreshing;
export const getIsLoadedMyLoans = (state) => getMyLoansState(state).isLoaded;
export const getMyLoansLoadingError = (state) => getMyLoansState(state).loadingError;

export const getMyLoans = createSelector(getMyLoansMap, (loansMap) => Object.values(loansMap));

const {
	updateLoan,
	createLoan,
	swapTxHashWithLoanID,
	fetchLoansRequest,
	fetchLoansSuccess,
	fetchLoansFailure,
} = myLoansSlice.actions;

export const fetchLoans = () => async (dispatch, getState) => {
	const {
		snxJS: { EtherCollateral, contractSettings },
		etherCollateralsUSDContract,
		provider,
	} = snxJSConnector;

	const state = getState();
	const walletInfo = getWalletInfo(state);

	const { contractType } = state.loans.contractInfo;

	let contract = contractType === 'sETH' ? EtherCollateral.contract : etherCollateralsUSDContract;

	dispatch(fetchLoansRequest());

	try {
		const filter = {
			fromBlock: 0,
			toBlock: 9e9,
			...contract.filters.LoanCreated(walletInfo.currentWallet),
		};
		const events = await contractSettings.provider.getLogs(filter);

		const txHashs = events.map((e) => e.transactionHash);

		const loanIDs = events
			.map((log) => contract.interface.parseLog(log))
			.map((event) => Number(event.values.loanID));

		const loans = {};
		let i = 0;
		for (const loanID of loanIDs) {
			const tx = await provider.getTransactionReceipt(txHashs[i]);
			const loan = await contract.getLoan(walletInfo.currentWallet, loanID);
			const timeClosed = toJSTimestamp(loan.timeClosed);
			loans[loanID] = {
				collateralAmount: bigNumberFormatter(loan.collateralAmount),
				loanAmount: bigNumberFormatter(loan.loanAmount),
				timeCreated: toJSTimestamp(loan.timeCreated),
				loanID,
				timeClosed,
				feesPayable: bigNumberFormatter(loan.totalFees),
				currentInterest: bigNumberFormatter(loan.interest),
				status: timeClosed > 0 ? LOAN_STATUS.CLOSED : LOAN_STATUS.OPEN,
				transactionHash: null,
				loanType: tx.to === EtherCollateral.address ? 'sETH' : 'sUSD',
			};
			i++;
		}

		//@TODO remove console logs after verifying the loans are filtered
		const filteredLoans = loans.filter((e) => {
			console.log(e);
			if (contractType === 'sETH') {
				return e.loanType === 'sETH';
			} else {
				return e.loanType === 'sUSD';
			}
		});

		console.log(filteredLoans);

		dispatch(fetchLoansSuccess({ filteredLoans }));
	} catch (e) {
		dispatch(fetchLoansFailure({ error: e.message }));
	}
};

export default myLoansSlice.reducer;

export { updateLoan, createLoan, swapTxHashWithLoanID };
