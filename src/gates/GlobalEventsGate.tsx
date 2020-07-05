import { useEffect, FC } from 'react';
import { connect } from 'react-redux';

import { fetchWalletBalancesRequest } from 'ducks/wallet/walletBalances';
import { getCurrentWalletAddress } from 'ducks/wallet/walletDetails';
import { RootState } from 'ducks/types';

import snxJSConnector from 'utils/snxJSConnector';

import { EXCHANGE_RATES_EVENTS, EXCHANGE_EVENTS } from 'constants/events';

type StateProps = {
	currentWallet: string | null;
};

type DispatchProps = {
	fetchWalletBalancesRequest: typeof fetchWalletBalancesRequest;
};

type GlobalEventsGateProps = StateProps & DispatchProps;

const GlobalEventsGate: FC<GlobalEventsGateProps> = ({
	fetchWalletBalancesRequest,
	currentWallet,
}) => {
	useEffect(() => {
		const {
			snxJS: { ExchangeRates },
		} = snxJSConnector as any;

		return () => {
			Object.values(EXCHANGE_RATES_EVENTS).forEach((event) =>
				ExchangeRates.contract.removeAllListeners(event)
			);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!currentWallet) return;
		const {
			snxJS: { Synthetix },
		} = snxJSConnector as any;

		Synthetix.contract.on(EXCHANGE_EVENTS.SYNTH_EXCHANGE, (address: string) => {
			if (address === currentWallet) {
				fetchWalletBalancesRequest();
			}
		});

		return () => {
			Object.values(EXCHANGE_EVENTS).forEach((event) =>
				Synthetix.contract.removeAllListeners(event)
			);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentWallet]);

	return null;
};

const mapStateToProps = (state: RootState): StateProps => ({
	currentWallet: getCurrentWalletAddress(state),
});

const mapDispatchToProps: DispatchProps = {
	fetchWalletBalancesRequest,
};

export default connect<StateProps, DispatchProps, {}, RootState>(
	mapStateToProps,
	mapDispatchToProps
)(GlobalEventsGate as any);
