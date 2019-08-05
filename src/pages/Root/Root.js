/* eslint-disable */
import { hot } from 'react-hot-loader/root';
import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import snxJSConnector from '../../utils/snxJSConnector';
import { getEthereumNetwork } from '../../utils/metamaskTools';
import { getExchangeData, getWalletBalances } from '../../dataFetcher';

import { getAvailableSynths, getCurrentTheme, getWalletInfo } from '../../ducks';
import { updateExchangeRates, setAvailableSynths, updateFrozenSynths } from '../../ducks/synths';
import { updateWalletStatus, updateWalletBalances } from '../../ducks/wallet';
// import { updateGasAndSpeedInfo, updateExchangeFeeRate } from '../../ducks/wallet';

import Trade from '../Trade';
import Home from '../Home';

import Theme from '../../styles/theme';

const Root = ({
	setAvailableSynths,
	updateExchangeRates,
	updateGasAndSpeedInfo,
	updateExchangeFeeRate,
	updateFrozenSynths,
	updateWalletStatus,
	updateWalletBalances,
	currentTheme,
	walletInfo: { currentWallet },
}) => {
	const [intervalId, setIntervalId] = useState(null);
	const fetchAndSetExchangeData = useCallback(async synths => {
		const { exchangeRates, exchangeFeeRate, networkPrices, frozenSynths } = await getExchangeData(
			synths
		);
		updateExchangeRates(exchangeRates);
		// updateExchangeFeeRate(exchangeFeeRate);
		// updateGasAndSpeedInfo(networkPrices);
		updateFrozenSynths(frozenSynths);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchAndSetWalletBalances = useCallback(
		async synths => {
			if (!currentWallet) return;
			updateWalletBalances(await getWalletBalances(currentWallet, synths));
		},
		[currentWallet]
	);

	useEffect(() => {
		const init = async () => {
			const { networkId, name } = await getEthereumNetwork();
			snxJSConnector.setContractSettings({ networkId });
			updateWalletStatus({ networkId, networkName: name.toLowerCase() });
			const synths = snxJSConnector.snxJS.contractSettings.synths.filter(synth => synth.asset);
			setAvailableSynths(synths);
			fetchAndSetExchangeData(synths);
			fetchAndSetWalletBalances(synths);
			const intervalId = setInterval(() => {
				fetchAndSetExchangeData(synths);
				fetchAndSetWalletBalances(synths);
			}, 30 * 1000);
			setIntervalId(intervalId);
		};
		init();
		return () => {
			clearInterval(intervalId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchAndSetExchangeData, fetchAndSetWalletBalances]);
	const themeStyle = currentTheme ? Theme(currentTheme) : Theme('light');
	return (
		<ThemeProvider theme={themeStyle}>
			<div>
				<Router>
					<RootContainer>
						<Switch>
							<Route path="/trade">
								<Trade />
							</Route>
							<Route path="/">
								<Trade />
							</Route>
						</Switch>
					</RootContainer>
				</Router>
			</div>
		</ThemeProvider>
	);
};

const RootContainer = styled.div`
	background-color: ${props => props.theme.colors.surfaceL1};
`;

const mapStateToProps = state => {
	return {
		availableSynths: getAvailableSynths(state),
		walletInfo: getWalletInfo(state),
		currentTheme: getCurrentTheme(state),
	};
};

const mapDispatchToProps = {
	updateExchangeRates,
	setAvailableSynths,
	// updateGasAndSpeedInfo,
	updateFrozenSynths,
	updateWalletStatus,
	updateWalletBalances,
	// updateExchangeFeeRate,
};

export default hot(connect(mapStateToProps, mapDispatchToProps)(Root));
