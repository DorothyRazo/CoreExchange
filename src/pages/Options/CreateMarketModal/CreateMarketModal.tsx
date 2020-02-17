import React, { useState, memo, FC, useMemo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';
import { ValueType } from 'react-select';
import intervalToDuration from 'date-fns/intervalToDuration';
import { addDays } from 'date-fns';

import Modal from '@material-ui/core/Modal';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles';

import { ReactComponent as CloseCrossIcon } from 'assets/images/close-cross.svg';

import ROUTES, { navigateTo } from 'constants/routes';
import {
	SYNTHS_MAP,
	CRYPTO_CURRENCY_MAP,
	FIAT_CURRENCY_MAP,
	CurrencyKey,
	USD_SIGN,
} from 'constants/currency';
import { EMPTY_VALUE } from 'constants/placeholder';

import { lightTheme, darkTheme } from 'styles/theme';
import colors from 'styles/theme/colors';

import { RootState } from 'ducks/types';
import { getAvailableSynthsMap, getAvailableSynths } from 'ducks/synths';

import DatePicker from 'components/Input/DatePicker';
import { headingH3CSS, headingH6CSS, headingH5CSS } from 'components/Typography/Heading';
import { bodyCSS, sectionTitleCSS } from 'components/Typography/General';
import NumericInput from 'components/Input/NumericInput';
import NumericInputWithCurrency from 'components/Input/NumericInputWithCurrency';
import { formLabelLargeCSS, formDataCSS, formLabelSmallCSS } from 'components/Typography/Form';
import Select from 'components/Select';
import Currency from 'components/Currency';
import Button from 'components/Button/Button';

import { GridDivCol, resetButtonCSS, GridDivRow, FlexDivRowCentered } from 'shared/commonStyles';
import { media } from 'shared/media';

import {
	formatPercentage,
	formatShortDate,
	formattedDuration,
	bytesFormatter,
} from 'utils/formatters';
import MarketSentiment from '../components/MarketSentiment';
import snxJSConnector from 'utils/snxJSConnector';

const MATURITY_DATE_DAY_DELAY = 1;

/*
TODO:

BinaryOptionMarketManager.durations()
sAUDKey,
			initialTargetPrice,
			[creationTime + biddingTime, creationTime + timeToMaturity],
			[initialLongBid, initialShortBid],
			{ from: initialBidder }
	from
	if the values are x, y (where x+y=1), then the bids are x * funding y * funding
*/

const FEES = {
	CREATOR: 0.1 / 100,
	REFUND: 0.1 / 100,
	TRADING: 0.1 / 100,
};

const StyledSlider = withStyles({
	root: {
		color: colors.green,
		height: 16,
	},
	thumb: {
		height: 24,
		width: 24,
		background: colors.white,
		boxShadow: '0px 1px 4px rgba(202, 202, 241, 0.5)',
		'&:focus, &:hover, &$active': {
			boxShadow: '0px 1px 4px rgba(202, 202, 241, 0.5)',
		},
	},
	track: {
		height: 16,
		borderRadius: 2,
	},
	rail: {
		height: 16,
		backgroundColor: colors.red,
		opacity: 1,
		borderRadius: 2,
	},
})(Slider);

const mapStateToProps = (state: RootState) => ({
	synthsMap: getAvailableSynthsMap(state),
	synths: getAvailableSynths(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type CreateMarketModalProps = PropsFromRedux;

type CurrencyKeyOptionType = { value: CurrencyKey; label: string };

export const CreateMarketModal: FC<CreateMarketModalProps> = memo(({ synths, synthsMap }) => {
	const { t } = useTranslation();
	const [currencyKey, setCurrencyKey] = useState<ValueType<CurrencyKeyOptionType>>();
	const [strikePrice, setStrikePrice] = useState<number | string>('');
	const [biddingEndDate, setEndOfBidding] = useState<Date | null | undefined>(null);
	const [maturityDate, setMaturityDate] = useState<Date | null | undefined>(null);
	const [initialLongShorts, setInitialLongShorts] = useState<{ long: number; short: number }>({
		long: 50,
		short: 50,
	});
	const [initialFundingAmount, setInitialFundingAmount] = useState<number | string>('');
	const assetsOptions = useMemo(
		() => [
			{
				label: CRYPTO_CURRENCY_MAP.SNX,
				value: CRYPTO_CURRENCY_MAP.SNX,
			},
			...synths
				.filter((synth) => !synth.inverted && synth.name !== SYNTHS_MAP.sUSD)
				.map((synth) => ({
					label: synth.asset,
					value: synth.name,
				})),
		],
		[synths]
	);

	const isButtonDisabled =
		currencyKey == null ||
		strikePrice === '' ||
		biddingEndDate === null ||
		maturityDate === null ||
		initialFundingAmount === '';

	const strikePricePlaceholderVal = `${USD_SIGN}10000.00 ${FIAT_CURRENCY_MAP.USD}`;

	const handleClose = () => navigateTo(ROUTES.Options.Home);
	const handleMarketCreation = async () => {
		try {
			const {
				snxJS: { BinaryOptionMarketManager },
				utils: { parseEther },
			} = snxJSConnector as any;

			const longBidAmount: number = initialLongShorts.long / (initialFundingAmount as number);
			const shortBidAmount: number = initialLongShorts.short / (initialFundingAmount as number);
			const tx = await BinaryOptionMarketManager.createMarket(
				bytesFormatter((currencyKey as CurrencyKeyOptionType).value),
				parseEther(strikePrice),
				[
					Math.round((biddingEndDate as Date).getTime() / 1000),
					Math.round((maturityDate as Date).getTime() / 1000),
				],
				[parseEther(longBidAmount.toString()), parseEther(shortBidAmount.toString())]
			);
			console.log(tx);
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<ThemeProvider theme={lightTheme}>
			<StyledModal
				open={true}
				onClose={handleClose}
				disableEscapeKeyDown={true}
				disableAutoFocus={true}
				disableEnforceFocus={true}
				hideBackdrop={true}
				disableRestoreFocus={true}
			>
				<Container>
					<CloseButton>
						<CloseCrossIcon onClick={handleClose} />
					</CloseButton>
					<Title>{t('options.create-market-modal.title')}</Title>
					<Subtitle>{t('options.create-market-modal.subtitle')}</Subtitle>
					<Content>
						<MarketDetails>
							<FormRow>
								<FormControlGroup>
									<FormControl>
										<FormInputLabel htmlFor="asset">
											{t('options.create-market-modal.details.select-asset-label')}
										</FormInputLabel>
										<SelectContainer>
											<Select
												formatOptionLabel={(option) => (
													<Currency.Name
														currencyKey={option.value}
														name={option.label}
														showIcon={true}
														iconProps={{ type: 'asset' }}
													/>
												)}
												options={assetsOptions}
												placeholder={t('common.eg-val', { val: CRYPTO_CURRENCY_MAP.BTC })}
												value={currencyKey}
												onChange={(option) => {
													setCurrencyKey(option);
												}}
											/>
										</SelectContainer>
									</FormControl>
									<FormControl>
										<FormInputLabel htmlFor="strike-price">
											{t('options.create-market-modal.details.strike-price-label')}
										</FormInputLabel>
										<StyledNumericInput
											id="strike-price"
											value={strikePrice}
											onChange={(e) => setStrikePrice(e.target.value)}
											placeholder={t('common.eg-val', {
												val: strikePricePlaceholderVal,
											})}
										/>
									</FormControl>
								</FormControlGroup>
							</FormRow>
							<FormRow>
								<FormControlGroup>
									<FormControl>
										<FormInputLabel htmlFor="end-of-bidding">
											{t('options.create-market-modal.details.bidding-end-date-label')}
										</FormInputLabel>
										<StyledDatePicker
											id="end-of-bidding"
											selected={biddingEndDate}
											showTimeSelect
											onChange={(d) => setEndOfBidding(d)}
											minDate={new Date()}
											maxDate={maturityDate}
										/>
									</FormControl>
									<FormControl>
										<FormInputLabel htmlFor="maturity-date">
											{t('options.create-market-modal.details.market-maturity-date-label')}
										</FormInputLabel>
										<StyledDatePicker
											disabled={!biddingEndDate}
											id="maturity-date"
											selected={maturityDate}
											showTimeSelect
											onChange={(d) => setMaturityDate(d)}
											minDate={
												biddingEndDate
													? new Date(addDays(biddingEndDate, MATURITY_DATE_DAY_DELAY))
													: null
											}
										/>
									</FormControl>
								</FormControlGroup>
							</FormRow>
							<FormRow>
								<FormControl>
									<FlexDivRowCentered>
										<FormInputLabel style={{ cursor: 'default' }}>
											{t('options.create-market-modal.details.long-short-skew-label')}
										</FormInputLabel>
										<div>
											<Longs>{t('common.val-in-cents', { val: initialLongShorts.long })}</Longs>
											{' / '}
											<Shorts>{t('common.val-in-cents', { val: initialLongShorts.short })}</Shorts>
										</div>
									</FlexDivRowCentered>
									<StyledSlider
										value={initialLongShorts.long}
										onChange={(_, newValue) => {
											const long = newValue as number;
											setInitialLongShorts({
												long,
												short: 100 - long,
											});
										}}
									/>
								</FormControl>
							</FormRow>
							<FormRow>
								<FormControl>
									<FormInputLabel htmlFor="funding-amount">
										{t('options.create-market-modal.details.funding-amount-label')}
									</FormInputLabel>
									<StyledNumericInputWithCurrency
										currencyKey={SYNTHS_MAP.sUSD}
										value={initialFundingAmount}
										onChange={(e) => setInitialFundingAmount(e.target.value)}
										inputProps={{
											id: 'funding-amount',
										}}
									/>
								</FormControl>
							</FormRow>
						</MarketDetails>
						<MarketSummary>
							<MarketSummaryTitle>
								{t('options.create-market-modal.summary.title')}
							</MarketSummaryTitle>
							<MarketSummaryPreview>
								<PreviewAssetRow>
									{currencyKey ? (
										<StyledCurrencyName
											showIcon={true}
											currencyKey={(currencyKey as CurrencyKeyOptionType).value}
											name={(currencyKey as CurrencyKeyOptionType).label}
											iconProps={{ type: 'asset' }}
										/>
									) : (
										EMPTY_VALUE
									)}
									<span>&gt;</span>
									<StrikePrice>{`${USD_SIGN}${strikePrice !== '' ? strikePrice : 0} ${
										FIAT_CURRENCY_MAP.USD
									}`}</StrikePrice>
								</PreviewAssetRow>
								<PreviewDatesRow>
									<div>
										{t('options.create-market-modal.summary.dates.bids-end', {
											date: biddingEndDate ? formatShortDate(biddingEndDate) : EMPTY_VALUE,
										})}
									</div>
									<div>
										{t('options.create-market-modal.summary.dates.trading-period', {
											period: biddingEndDate
												? formattedDuration(
														intervalToDuration({ start: Date.now(), end: biddingEndDate })
												  )
												: EMPTY_VALUE,
										})}
									</div>
								</PreviewDatesRow>
								<PreviewMarketPriceRow>
									<MarketSentiment
										long={initialLongShorts.long / 100}
										short={initialLongShorts.short / 100}
									/>
								</PreviewMarketPriceRow>
								<PreviewFeesRow>
									<FlexDivRowCentered>
										<span>{t('options.create-market-modal.summary.fees.creator')}</span>
										<span>{formatPercentage(FEES.CREATOR)}</span>
									</FlexDivRowCentered>
									<FlexDivRowCentered>
										<span>{t('options.create-market-modal.summary.fees.refund')}</span>
										<span>{formatPercentage(FEES.REFUND)}</span>
									</FlexDivRowCentered>
									<FlexDivRowCentered>
										<span>{t('options.create-market-modal.summary.fees.trading')}</span>
										<span>{formatPercentage(FEES.TRADING)}</span>
									</FlexDivRowCentered>
								</PreviewFeesRow>
								<CreateMarketButton
									palette="primary"
									size="lg"
									disabled={isButtonDisabled}
									onClick={handleMarketCreation}
								>
									{t('options.create-market-modal.summary.create-market-button-label')}
								</CreateMarketButton>
							</MarketSummaryPreview>
						</MarketSummary>
					</Content>
				</Container>
			</StyledModal>
		</ThemeProvider>
	);
});

const Container = styled.div`
	background-color: ${(props) => props.theme.colors.surfaceL1};
	text-align: center;
	outline: none;
`;

const StyledModal = styled(Modal)`
	background-color: ${(props) => props.theme.colors.surfaceL1};
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 1;
	${media.medium`
		display: block;
		padding: 80px 24px;
	`}
	overflow: auto;
`;

const Title = styled.div`
	${headingH3CSS};
	color: ${(props) => props.theme.colors.fontPrimary};
	padding-bottom: 8px;
`;

const Subtitle = styled.div`
	${bodyCSS};
	color: ${(props) => props.theme.colors.fontSecondary};
	padding-bottom: 57px;
	max-width: 520px;
	margin: 0 auto;
`;

const Content = styled(GridDivCol)`
	grid-gap: 57px;
	${media.medium`
		grid-auto-flow: row;
	`}
`;

const MarketDetails = styled.div`
	width: 570px;
	${media.medium`
		width: 100%;
	`}
`;

const FormInputLabel = styled.label`
	${formLabelLargeCSS};
	color: ${(props) => props.theme.colors.fontSecondary};
	text-align: left;
	cursor: pointer;
`;

const FormRow = styled.div`
	padding-bottom: 24px;
`;

const FormControlGroup = styled(GridDivCol)`
	grid-gap: 24px;
	grid-template-columns: 1fr 1fr;
	${media.medium`
		grid-template-columns: unset;
		grid-auto-flow: row;
	`}
`;

const FormControl = styled(GridDivRow)`
	grid-gap: 8px;
`;

const Longs = styled.span`
	${headingH6CSS};
	color: ${(props) => props.theme.colors.green};
`;
const Shorts = styled.span`
	${headingH6CSS};
	color: ${(props) => props.theme.colors.red};
`;

const MarketSummary = styled.div`
	width: 330px;
	background-color: ${(props) => props.theme.colors.surfaceL2};
	${media.medium`
		width: 100%;
	`}
`;

const MarketSummaryTitle = styled.div`
	${sectionTitleCSS};
	text-align: center;
	background-color: ${(props) => props.theme.colors.surfaceL3};
	height: 48px;
	color: ${(props) => props.theme.colors.fontPrimary};
	padding: 15px;
	text-transform: uppercase;
`;

const MarketSummaryPreview = styled.div`
	padding: 20px;
`;
const PreviewAssetRow = styled.div`
	display: inline-grid;
	grid-auto-flow: column;
	align-items: center;
	grid-gap: 9px;
	${headingH5CSS};
	color: ${(props) => props.theme.colors.fontPrimary};
	padding-bottom: 14px;
`;

const StyledCurrencyName = styled(Currency.Name)`
	${headingH5CSS};
	color: ${darkTheme.colors.accentL1};
`;

const StrikePrice = styled.div``;

const PreviewDatesRow = styled.div`
	${formLabelSmallCSS};
	color: ${(props) => props.theme.colors.fontSecondary};
	padding-bottom: 11px;
	display: grid;
	grid-gap: 4px;
	text-transform: none;
`;
const PreviewMarketPriceRow = styled.div`
	padding-bottom: 18px;
`;
const PreviewFeesRow = styled.div`
	${formDataCSS};
	display: grid;
	padding: 12px 0;
	border-top: 1px solid ${(props) => props.theme.colors.surfaceL1};
	border-bottom: 1px solid ${(props) => props.theme.colors.surfaceL1};
	color: ${(props) => props.theme.colors.fontSecondary};
	margin-bottom: 18px;
	grid-gap: 4px;
`;
const CreateMarketButton = styled(Button)`
	width: 100%;
`;

const CloseButton = styled.button`
	${resetButtonCSS};
	position: absolute;
	right: 5%;
	top: 5%;
	color: ${({ theme }) => theme.colors.fontTertiary};
`;

const StyledDatePicker = styled(DatePicker)`
	.react-datepicker__input-container input {
		border-color: transparent;
	}
`;

const StyledNumericInput = styled(NumericInput)`
	border-color: transparent;
`;

const StyledNumericInputWithCurrency = styled(NumericInputWithCurrency)`
	.input {
		border-top-color: transparent;
		border-bottom-color: transparent;
		border-right-color: transparent;
		border-left-color: ${(props) => props.theme.colors.accentL1};
	}

	.currency-container {
		border-color: transparent;
	}
`;

const SelectContainer = styled.div`
	.react-select__control {
		border-color: transparent;
		&:hover {
			border-color: transparent;
		}
	}
`;

export default connector(CreateMarketModal);
