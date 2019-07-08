import { hot } from 'react-hot-loader/root';
import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import synthetixJsTools from '../../synthetixJsTool';
import { getEthereumNetwork } from '../../utils/metamaskTools';
import { getExchangeData } from '../../dataFetcher';

import { getAvailableSynths } from '../../ducks';
import { updateExchangeRates, setAvailableSynths, updateFrozenSynths } from '../../ducks/synths';
import { connectToWallet, updateGasAndSpeedInfo, updateExchangeFeeRate } from '../../ducks/wallet';

import Trade from '../Trade';
import Home from '../Home';

const Root = ({
	setAvailableSynths,
	updateExchangeRates,
	updateGasAndSpeedInfo,
	updateExchangeFeeRate,
	updateFrozenSynths,
}) => {
	const [intervalId, setIntervalId] = useState(null);
	const fetchAndSetData = useCallback(async synths => {
		const { exchangeRates, exchangeFeeRate, networkPrices, frozenSynths } = await getExchangeData(
			synths
		);
		updateExchangeRates(exchangeRates);
		updateExchangeFeeRate(exchangeFeeRate);
		updateGasAndSpeedInfo(networkPrices);
		updateFrozenSynths(frozenSynths);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		const init = async () => {
			const { networkId } = await getEthereumNetwork();
			synthetixJsTools.setContractSettings({ networkId });
			const synths = synthetixJsTools.synthetixJs.contractSettings.synths.filter(
				synth => synth.asset
			);
			setAvailableSynths(synths);
			fetchAndSetData(synths);
			const intervalId = setInterval(() => {
				fetchAndSetData(synths);
			}, 30 * 1000);
			setIntervalId(intervalId);
		};
		init();
		return () => {
			clearInterval(intervalId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchAndSetData]);

	return (
		<div>
			<Router>
				<div>
					<Switch>
						<Route path="/trade">
							<Trade />
						</Route>
						<Route path="/">
							<Home />
						</Route>
					</Switch>
				</div>
			</Router>
		</div>
	);
};

const mapStateToProps = state => {
	return {
		availableSynths: getAvailableSynths(state),
	};
};

const mapDispatchToProps = {
	updateExchangeRates,
	setAvailableSynths,
	connectToWallet,
	updateGasAndSpeedInfo,
	updateFrozenSynths,
	updateExchangeFeeRate,
};

Root.propTypes = {
	updateExchangeRates: PropTypes.func.isRequired,
	setAvailableSynths: PropTypes.func.isRequired,
	availableSynths: PropTypes.array.isRequired,
	connectToWallet: PropTypes.func.isRequired,
	updateGasAndSpeedInfo: PropTypes.func.isRequired,
	updateFrozenSynths: PropTypes.func.isRequired,
	updateExchangeFeeRate: PropTypes.func.isRequired,
};

export default hot(connect(mapStateToProps, mapDispatchToProps)(Root));
