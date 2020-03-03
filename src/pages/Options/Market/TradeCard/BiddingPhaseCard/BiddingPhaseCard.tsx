import React, { FC, memo, useState, useEffect } from 'react';
import { ConnectedProps, connect } from 'react-redux';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { queryCache, AnyQueryKey } from 'react-query';

import { ReactComponent as WalletIcon } from 'assets/images/wallet.svg';

import { OptionsMarketInfo, OptionsTransaction, AccountMarketInfo } from 'pages/Options/types';
import { RootState } from 'ducks/types';
import { getWalletBalancesMap } from 'ducks/wallet/walletBalances';
import { getGasInfo } from 'ducks/transaction';
import { getIsWalletConnected, getCurrentWalletAddress } from 'ducks/wallet/walletDetails';

import QUERY_KEYS from 'constants/queryKeys';
import { SYNTHS_MAP } from 'constants/currency';
import { EMPTY_VALUE } from 'constants/placeholder';
import { APPROVAL_EVENTS } from 'constants/events';
import { SLIPPAGE_THRESHOLD } from 'constants/ui';

import { getCurrencyKeyBalance, getCurrencyKeyUSDBalanceBN } from 'utils/balances';
import { formatCurrencyWithKey, getAddress } from 'utils/formatters';
import { normalizeGasLimit } from 'utils/transactions';
import { GWEI_UNIT } from 'utils/networkUtils';

import { FlexDivRowCentered, GridDivCenteredCol } from 'shared/commonStyles';

import Card from 'components/Card';
import { Button } from 'components/Button';
import { formLabelSmallCSS } from 'components/Typography/Form';

import BidNetworkFees from '../components/BidNetworkFees';
import { useBOMContractContext } from '../../contexts/BOMContractContext';
import snxJSConnector from 'utils/snxJSConnector';

// TO DO: rename and put this tooltip in ./components
import NetworkInfoTooltip from 'pages/Trade/components/CreateOrderCard/NetworkInfoTooltip';

import {
	StyledTimeRemaining,
	CardContent,
	ActionButton,
	StyledCardBody,
	PhaseEnd,
} from '../common';

import TradeSide from './TradeSide';

const TIMEOUT_DELAY = 2500;

const mapStateToProps = (state: RootState) => ({
	walletBalancesMap: getWalletBalancesMap(state),
	isWalletConnected: getIsWalletConnected(state),
	currentWalletAddress: getCurrentWalletAddress(state),
	gasInfo: getGasInfo(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type BiddingPhaseCardProps = PropsFromRedux & {
	optionsMarket: OptionsMarketInfo;
	accountMarketInfo: AccountMarketInfo;
};

function getPriceDifference(currentPrice: number, newPrice: number): number {
	return newPrice - currentPrice;
}

const BiddingPhaseCard: FC<BiddingPhaseCardProps> = memo(
	({
		optionsMarket,
		isWalletConnected,
		walletBalancesMap,
		currentWalletAddress,
		gasInfo,
		accountMarketInfo,
	}) => {
		const { longPrice, shortPrice, fees, isResolved, BN } = optionsMarket;
		const { t } = useTranslation();
		const BOMContract = useBOMContractContext();
		const [gasLimit, setGasLimit] = useState<number | null>(null);
		const [hasAllowance, setAllowance] = useState<boolean>(false);
		const [isAllowing, setIsAllowing] = useState<boolean>(false);
		const [type, setType] = useState<OptionsTransaction['type']>('bid');
		const [isBidding, setIsBidding] = useState<boolean>(false);
		const [priceShift, setPriceShift] = useState<number>(0);
		const [longSideAmount, setLongSideAmount] = useState<OptionsTransaction['amount'] | string>('');
		const [shortSideAmount, setShortSideAmount] = useState<OptionsTransaction['amount'] | string>(
			''
		);
		const [longPriceAmount, setLongPriceAmount] = useState<string | number>('');
		const [shortPriceAmount, setShortPriceAmount] = useState<string | number>('');

		const [side, setSide] = useState<OptionsTransaction['side']>('long');

		const [pricesAfterBidOrRefundTimer, setPricesAfterBidOrRefundTimer] = useState<number | null>(
			null
		);
		const [bidOrRefundForPriceTimer, setBidOrRefundForPriceTimer] = useState<number | null>(null);

		const { bids, claimable } = accountMarketInfo;
		const longPosition = {
			bid: bids.long,
			payout: claimable.long,
		};
		const shortPosition = {
			bid: bids.short,
			payout: claimable.short,
		};

		useEffect(() => {
			return () => {
				if (pricesAfterBidOrRefundTimer) clearTimeout(pricesAfterBidOrRefundTimer);
				if (bidOrRefundForPriceTimer) clearTimeout(bidOrRefundForPriceTimer);
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		useEffect(() => {
			setLongSideAmount('');
			setShortSideAmount('');
			setLongPriceAmount('');
			setShortPriceAmount('');
		}, [side]);

		const transKey =
			type === 'bid'
				? 'options.market.trade-card.bidding.bid'
				: 'options.market.trade-card.bidding.refund';

		const sUSDBalance = getCurrencyKeyBalance(walletBalancesMap, SYNTHS_MAP.sUSD) || 0;
		const sUSDBalanceBN = getCurrencyKeyUSDBalanceBN(walletBalancesMap, SYNTHS_MAP.sUSD) || 0;

		useEffect(() => {
			const fetchGasLimit = async (isShort: boolean, amount: string) => {
				const {
					utils: { parseEther },
				} = snxJSConnector as any;
				try {
					const bidOrRefundAmount =
						amount === sUSDBalance ? sUSDBalanceBN : parseEther(amount.toString());
					const BOMContractWithSigner = BOMContract.connect((snxJSConnector as any).signer);
					const bidOrRefundFunction =
						type === 'bid'
							? BOMContractWithSigner.estimate.bid
							: BOMContractWithSigner.estimate.refund;
					const gasEstimate = await bidOrRefundFunction(isShort ? 1 : 0, bidOrRefundAmount);
					setGasLimit(normalizeGasLimit(Number(gasEstimate)));
				} catch (e) {
					console.log(e);
					setGasLimit(null);
				}
			};
			if (!isWalletConnected || (!shortSideAmount && !longSideAmount)) return;
			const isShort = side === 'short';
			const amount = isShort ? shortSideAmount : longSideAmount;
			fetchGasLimit(isShort, amount as string);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isWalletConnected, shortSideAmount, longSideAmount]);

		useEffect(() => {
			const {
				snxJS: { sUSD },
			} = snxJSConnector as any;

			const getAllowance = async () => {
				const allowance = await sUSD.allowance(currentWalletAddress, BOMContract.address);
				setAllowance(!!Number(allowance));
			};

			const registerAllowanceListener = () => {
				sUSD.contract.on(APPROVAL_EVENTS.APPROVAL, (owner: string, spender: string) => {
					if (owner === currentWalletAddress && spender === getAddress(BOMContract.address)) {
						setAllowance(true);
						setIsAllowing(false);
					}
				});
			};

			if (!currentWalletAddress) return;
			getAllowance();
			registerAllowanceListener();
			return () => {
				sUSD.contract.removeAllListeners(APPROVAL_EVENTS.APPROVAL);
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [currentWalletAddress]);

		const handleAllowance = async () => {
			const {
				snxJS: { sUSD },
			} = snxJSConnector as any;
			try {
				setIsAllowing(true);
				const maxInt = `0x${'f'.repeat(64)}`;
				const gasEstimate = await sUSD.contract.estimate.approve(BOMContract.address, maxInt);
				await sUSD.approve(BOMContract.address, maxInt, {
					gasLimit: normalizeGasLimit(Number(gasEstimate)),
					gasPrice: gasInfo.gasPrice * GWEI_UNIT,
				});
			} catch (e) {
				console.log(e);
				setIsAllowing(false);
			}
		};

		const handleBidOrRefund = async () => {
			const {
				utils: { parseEther },
			} = snxJSConnector as any;
			const isShort = side === 'short';
			const amount = isShort ? shortSideAmount : longSideAmount;
			if (!amount) return;
			try {
				setIsBidding(true);
				const BOMContractWithSigner = BOMContract.connect((snxJSConnector as any).signer);
				const bidOrRefundFunction =
					type === 'bid' ? BOMContractWithSigner.bid : BOMContractWithSigner.refund;
				const bidOrRefundAmount =
					amount === sUSDBalance ? sUSDBalanceBN : parseEther(amount.toString());
				await bidOrRefundFunction(isShort ? 1 : 0, bidOrRefundAmount, {
					gasLimit,
					gasPrice: gasInfo.gasPrice * GWEI_UNIT,
				});
				setIsBidding(false);
			} catch (e) {
				console.log(e);
				setIsBidding(false);
			}
		};

		const handleTargetPrice = async (
			targetPrice: string,
			isShort: boolean,
			targetShort: boolean,
			isRefund: boolean
		) => {
			const {
				utils: { parseEther },
				binaryOptionsUtils: { bidOrRefundForPrice },
			} = snxJSConnector as any;
			const setPriceAmountFunction = isShort ? setShortPriceAmount : setLongPriceAmount;
			const setOtherSidePriceAmountFunction = isShort ? setLongPriceAmount : setShortPriceAmount;
			const setSideAmountFunction = isShort ? setShortSideAmount : setLongSideAmount;
			const bidPrice = side === 'short' ? shortPrice : longPrice;
			try {
				if (!targetPrice || Number(targetPrice) > 1) {
					setPriceAmountFunction('');
					setPriceShift(0);
					return;
				}
				setPriceAmountFunction(targetPrice);
				setOtherSidePriceAmountFunction((1 - Number(targetPrice)).toString());

				const estimatedAmountNeeded = bidOrRefundForPrice({
					bidSide: isShort ? 1 : 0,
					priceSide: targetShort ? 1 : 0,
					price: parseEther(targetPrice),
					refund: isRefund,
					fee: BN.feeBN,
					refundFee: BN.refundFeeBN,
					longBids: BN.totalLongBN,
					shortBids: BN.totalShortBN,
					deposited: BN.depositedBN,
				});

				setSideAmountFunction(estimatedAmountNeeded / 1e18);
				setPriceShift(getPriceDifference(bidPrice, Number(targetPrice)));

				if (bidOrRefundForPriceTimer) clearTimeout(bidOrRefundForPriceTimer);
				setBidOrRefundForPriceTimer(
					setTimeout(async () => {
						try {
							const amountNeeded = await BOMContract.bidOrRefundForPrice(
								isShort ? 1 : 0,
								targetShort ? 1 : 0,
								parseEther(targetPrice),
								isRefund
							);
							setSideAmountFunction(amountNeeded / 1e18);
						} catch (e) {
							console.log(e);
							setSideAmountFunction('');
						}
					}, TIMEOUT_DELAY)
				);
			} catch (e) {
				console.log(e);
				setPriceAmountFunction('');
			}
		};

		const setBidsPriceAmount = (long: number, short: number) => {
			const bidPrice = side === 'short' ? shortPrice : longPrice;
			setShortPriceAmount(short);
			setLongPriceAmount(long);
			setPriceShift(getPriceDifference(bidPrice, side === 'short' ? short : long));
		};

		const handleBidAmount = async (amount: string) => {
			side === 'short' ? setShortSideAmount(amount) : setLongSideAmount(amount);
			const {
				utils: { parseEther },
				binaryOptionsUtils: { pricesAfterBidOrRefund },
			} = snxJSConnector as any;
			if (!amount) {
				setLongPriceAmount('');
				setShortPriceAmount('');
				return;
			}
			try {
				const bidOrRefundAmount =
					amount === sUSDBalance ? sUSDBalanceBN : parseEther(amount.toString());

				const estimatedPrice = pricesAfterBidOrRefund({
					side: side === 'short' ? 1 : 0,
					value: bidOrRefundAmount,
					refund: type === 'refund',
					longBids: BN.totalLongBN,
					shortBids: BN.totalShortBN,
					fee: BN.feeBN,
					refundFee: BN.refundFeeBN,
					resolved: isResolved,
					deposited: BN.depositedBN,
				});
				setBidsPriceAmount(estimatedPrice.long / 1e18, estimatedPrice.short / 1e18);

				if (pricesAfterBidOrRefundTimer) clearTimeout(pricesAfterBidOrRefundTimer);
				setPricesAfterBidOrRefundTimer(
					setTimeout(async () => {
						try {
							const { long, short } = await BOMContract.pricesAfterBidOrRefund(
								side === 'short' ? 1 : 0,
								bidOrRefundAmount,
								type === 'refund'
							);
							setBidsPriceAmount(long / 1e18, short / 1e18);
						} catch (e) {
							console.log(e);
						}
					}, TIMEOUT_DELAY)
				);
			} catch (e) {
				console.log(e);
			}
		};

		const handleTypeChange = (selectedType: OptionsTransaction['type']) => {
			setType(selectedType);
			setLongPriceAmount('');
			setShortPriceAmount('');
			setLongSideAmount('');
			setShortSideAmount('');
			setPriceShift(0);
		};

		const handleSideChange = (selectedSide: OptionsTransaction['side']) => {
			if (side === selectedSide) return;
			setSide(selectedSide);
			setPriceShift(0);
		};

		return (
			<Card>
				<StyledCardHeader>
					<TabButton isActive={type === 'bid'} onClick={() => handleTypeChange('bid')}>
						{t('options.market.trade-card.bidding.bid.title')}
					</TabButton>
					<TabButton isActive={type === 'refund'} onClick={() => handleTypeChange('refund')}>
						{t('options.market.trade-card.bidding.refund.title')}
					</TabButton>
				</StyledCardHeader>
				<StyledCardBody>
					<CardContent>
						<FlexDivRowCentered>
							<Title>{t(`${transKey}.subtitle`)}</Title>
							<WalletBalance>
								<WalletIcon />
								{isWalletConnected
									? formatCurrencyWithKey(SYNTHS_MAP.sUSD, sUSDBalance)
									: EMPTY_VALUE}
							</WalletBalance>
						</FlexDivRowCentered>
					</CardContent>
					<TradeSides>
						<TradeSide
							side="long"
							type={type}
							isActive={side === 'long'}
							amount={longSideAmount}
							onAmountChange={(e) => handleBidAmount(e.target.value)}
							onMaxClick={() => handleBidAmount(sUSDBalance)}
							price={longPriceAmount}
							onPriceChange={(e) =>
								handleTargetPrice(e.target.value, false, false, type === 'refund')
							}
							onClick={() => handleSideChange('long')}
							transKey={transKey}
							currentPosition={longPosition}
							priceShift={side === 'long' ? priceShift : 0}
						/>
						<TradeSideSeparator />
						<TradeSide
							side="short"
							type={type}
							isActive={side === 'short'}
							amount={shortSideAmount}
							onAmountChange={(e) => handleBidAmount(e.target.value)}
							onMaxClick={() => handleBidAmount(sUSDBalance)}
							price={shortPriceAmount}
							onPriceChange={(e) =>
								handleTargetPrice(e.target.value, true, true, type === 'refund')
							}
							onClick={() => handleSideChange('short')}
							transKey={transKey}
							currentPosition={shortPosition}
							priceShift={side === 'short' ? priceShift : 0}
						/>
					</TradeSides>
					<CardContent>
						<BidNetworkFees
							gasLimit={gasLimit}
							type={type}
							fees={fees}
							amount={side === 'long' ? longSideAmount : shortSideAmount}
						/>
						{hasAllowance ? (
							<NetworkInfoTooltip
								open={type === 'bid' && Math.abs(priceShift) > SLIPPAGE_THRESHOLD}
								title={t(`${transKey}.confirm-button.high-slippage`)}
							>
								<ActionButton
									size="lg"
									palette="primary"
									disabled={isBidding || !isWalletConnected || !sUSDBalance || !gasLimit}
									onClick={handleBidOrRefund}
								>
									{!isBidding
										? t(`${transKey}.confirm-button.label`)
										: t(`${transKey}.confirm-button.progress-label`)}
								</ActionButton>
							</NetworkInfoTooltip>
						) : (
							<ActionButton
								size="lg"
								palette="primary"
								disabled={isAllowing || !isWalletConnected}
								onClick={handleAllowance}
							>
								{!isAllowing
									? t(`${transKey}.allowance-button.label`)
									: t(`${transKey}.allowance-button.progress-label`)}
							</ActionButton>
						)}
						<PhaseEnd>
							{t('options.market.trade-card.bidding.footer.end-label')}{' '}
							<StyledTimeRemaining
								end={optionsMarket.timeRemaining}
								onEnded={() =>
									queryCache.invalidateQueries(
										(QUERY_KEYS.BinaryOptions.Market(
											optionsMarket.address
										) as unknown) as AnyQueryKey
									)
								}
							/>
						</PhaseEnd>
					</CardContent>
				</StyledCardBody>
			</Card>
		);
	}
);

const StyledCardHeader = styled(Card.Header)`
	padding: 0;
	> * + * {
		margin-left: 0;
	}
	display: grid;
	grid-template-columns: 1fr 1fr;
	padding: 4px;
	grid-gap: 4px;
`;

export const TabButton = styled(Button).attrs({ size: 'sm', palette: 'tab' })``;

const WalletBalance = styled(GridDivCenteredCol)`
	font-family: ${(props) => props.theme.fonts.medium};
	font-size: 12px;
	grid-gap: 8px;
	color: ${(props) => props.theme.colors.fontSecondary};
`;

const Title = styled.div`
	${formLabelSmallCSS};
	text-transform: capitalize;
`;

const TradeSides = styled(GridDivCenteredCol)`
	grid-auto-flow: initial;
	grid-template-columns: 1fr auto 1fr;
	border-bottom: 1px solid
		${(props) =>
			props.theme.isDarkTheme ? props.theme.colors.accentL1 : props.theme.colors.accentL2};
`;

const TradeSideSeparator = styled.div`
	width: 1px;
	height: 100%;
	background-color: ${(props) =>
		props.theme.isDarkTheme ? props.theme.colors.accentL1 : props.theme.colors.accentL2};
`;

export default connector(BiddingPhaseCard);
