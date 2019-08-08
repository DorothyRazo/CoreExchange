import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import isEmpty from 'lodash/isEmpty';
import isNan from 'lodash/isNaN';

import { formatCurrency, bytesFormatter } from '../../utils/formatters';

import { HeadingSmall, DataMedium, DataSmall } from '../Typography';
import { ButtonFilter, ButtonPrimary } from '../Button';
import { TradeInput } from '../Input';
import { getSynthPair, getExchangeRates, getWalletInfo } from '../../ducks';
import { setSynthPair } from '../../ducks/synths';
import snxJSConnector from '../../utils/snxJSConnector';

/* eslint-disable */
const TradeBox = ({
	theme: { colors },
	synthPair,
	setSynthPair,
	rates,
	walletInfo: { balances, currentWallet },
}) => {
	const { base, quote } = synthPair;
	const [baseAmount, setBaseAmount] = useState('');
	const [quoteAmount, setQuoteAmount] = useState('');
	const [error, setError] = useState(null);
	const synthsBalances = (balances && balances.synths && balances.synths.balances) || {};

	const onConfirmTrade = async () => {
		const {
			snxJS: { Synthetix },
			utils,
		} = snxJSConnector;
		try {
			const transaction = await Synthetix.exchange(
				bytesFormatter(quote),
				utils.parseEther(quoteAmount.toString()),
				bytesFormatter(base)
			);
			console.log(transaction);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		setBaseAmount('');
		setQuoteAmount('');
	}, [base, quote]);

	useEffect(() => {
		const getGasEstimate = async () => {
			if (!quoteAmount || !baseAmount) return;
			if (!currentWallet) return;
			try {
				const {
					snxJS: { Synthetix },
					utils,
				} = snxJSConnector;
				setError(null);
				const transaction = await Synthetix.contract.estimate.exchange(
					bytesFormatter(quote),
					utils.parseEther(quoteAmount.toString()),
					bytesFormatter(base)
				);
				console.log(transaction);
			} catch (e) {
				console.log(e);
				setError(e.message);
			}
		};
		getGasEstimate();
	}, [quoteAmount, baseAmount]);

	return (
		<Container>
			<Header>
				<HeadingSmall>{`${base}/${quote}`}</HeadingSmall>
				<ButtonFilter height={'22px'} onClick={() => setSynthPair({ quote: base, base: quote })}>
					<ButtonIcon src={'/images/reverse-arrow.svg'}></ButtonIcon>
				</ButtonFilter>
			</Header>
			<Body>
				<InputBlock>
					<InputInfo>
						<DataMedium color={colors.fontSecondary} fontFamily={'apercu-medium'}>
							Sell:
						</DataMedium>
						{!isEmpty(synthsBalances) && synthsBalances[quote] ? (
							<Balance>
								Balance: {formatCurrency(synthsBalances[quote].balance)} {quote}
							</Balance>
						) : null}
					</InputInfo>
					<TradeInput
						synth={quote}
						amount={quoteAmount}
						onAmountChange={value => {
							const convertedRate = rates ? value * rates[quote][base] : 0;
							setBaseAmount(isNan(convertedRate) ? 0 : convertedRate);
							setQuoteAmount(value);
						}}
					/>
					<InputPopup isVisible={error}>
						<DataMedium>{error}</DataMedium>
					</InputPopup>
				</InputBlock>
				<InputBlock>
					<InputInfo>
						<DataMedium color={colors.fontSecondary} fontFamily={'apercu-medium'}>
							Buy:
						</DataMedium>
						{!isEmpty(synthsBalances) && synthsBalances[base] ? (
							<Balance>
								Balance: {formatCurrency(synthsBalances[base].balance)} {base}
							</Balance>
						) : null}
					</InputInfo>
					<TradeInput
						synth={base}
						amount={baseAmount}
						onAmountChange={value => {
							const convertedRate = rates ? value * rates[base][quote] : 0;
							setQuoteAmount(isNan(convertedRate) ? 0 : convertedRate);
							setBaseAmount(value);
						}}
					/>
				</InputBlock>
				<ButtonRow>
					{[25, 50, 75, 100].map((fraction, i) => {
						return (
							<ButtonAmount
								disabled={isEmpty(synthsBalances) || !synthsBalances[quote]}
								key={i}
								onClick={() => {
									const balance = synthsBalances[quote].balance;
									const amount = (balance * Number(fraction)) / 100;
									setQuoteAmount(amount);
									const convertedRate = rates ? amount * rates[quote][base] : 0;
									setBaseAmount(convertedRate);
								}}
							>
								<DataSmall color={colors.fontTertiary}>{fraction}%</DataSmall>
							</ButtonAmount>
						);
					})}
				</ButtonRow>
				<NetworkInfo>
					<NetworkDataRow>
						<NetworkData>Price</NetworkData>
						<NetworkData>
							1 {base} = {rates ? formatCurrency(rates[base][quote]) : 0} {quote}
						</NetworkData>
					</NetworkDataRow>
					<NetworkDataRow>
						<NetworkData>$USD Value</NetworkData>
						<NetworkData>
							${rates ? formatCurrency(baseAmount * rates[base][quote]) : 0}
						</NetworkData>
					</NetworkDataRow>
					<NetworkDataRow>
						<NetworkData>Fee</NetworkData>
						<NetworkData>0</NetworkData>
					</NetworkDataRow>
					<NetworkDataRow>
						<NetworkData>Gas</NetworkData>
						<NetworkData>0</NetworkData>
					</NetworkDataRow>
					<NetworkDataRow>
						<NetworkData>Gas Price (gwei)</NetworkData>
						<NetworkData>
							0
							<ButtonEdit>
								<DataSmall color={colors.hyperLink}>Edit</DataSmall>
							</ButtonEdit>
						</NetworkData>
					</NetworkDataRow>
				</NetworkInfo>
				<ButtonPrimary disabled={!currentWallet || error} onClick={onConfirmTrade}>
					Confirm Trade
				</ButtonPrimary>
			</Body>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	height: 100%;
	background-color: ${props => props.theme.colors.surfaceL2};
`;

const Header = styled.div`
	background-color: ${props => props.theme.colors.surfaceL3};
	width: 100%;
	height: 40px;
	display: flex;
	align-items: center;
	padding: 0 18px;
	justify-content: flex-start;
	& > button {
		margin-left: 12px;
	}
`;

const ButtonIcon = styled.img`
	width: 16px;
	height: 12px;
`;

const Body = styled.div`
	padding: 0 12px 18px 12px;
`;

const InputBlock = styled.div`
	width: 100%;
	margin-top: 16px;
	position: relative;
`;

const InputInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
`;

const InputPopup = styled.div`
	position: absolute;
	transition: opacity 0.2s ease-out;
	bottom: 0;
	left: 0;
	width: 100%;
	background-color: ${props => props.theme.colors.red};
	padding: 8px 10px;
	border-radius: 1px;
	transform: translateY(calc(100% + 6px));
	z-index: 100;
	opacity: ${props => (props.isVisible ? 1 : 0)};
	height: ${props => (props.isVisible ? 'auto' : 0)};
`;

const Balance = styled(DataSmall)`
	text-transform: none;
	color: ${props => props.theme.colors.fontTertiary};
	font-family: 'apercu-light';
`;

const ButtonRow = styled.div`
	display: flex;
	margin: 18px 0;
	& > :first-child {
		margin-left: 0;
	}
	& > :last-child {
		margin-right: 0;
	}
`;

const ButtonAmount = styled.button`
	&:disabled {
		pointer-events: none;
		opacity: 0.5;
	}
	border-radius: 1px;
	cursor: pointer;
	flex: 1;
	margin: 0 8px;
	border: none;
	background-color: ${props => props.theme.colors.accentLight};
	height: 24px;
`;

const NetworkInfo = styled.div`
	margin: 18px 0;
`;

const NetworkDataRow = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 8px;
`;

const NetworkData = styled(DataSmall)`
	color: ${props => props.theme.colors.fontTertiary};
`;

const ButtonEdit = styled.button`
	border: none;
	background: transparent;
	padding: 0;
	margin-left: 10px;
	cursor: pointer;
`;

const mapStateToProps = state => {
	return {
		synthPair: getSynthPair(state),
		rates: getExchangeRates(state),
		walletInfo: getWalletInfo(state),
	};
};

const mapDispatchToProps = {
	setSynthPair,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(TradeBox));
