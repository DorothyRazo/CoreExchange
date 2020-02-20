import React, { memo, FC, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import snxJSConnector from 'utils/snxJSConnector';

import { OptionsMarketInfo, Phase } from 'ducks/options/types';
import { RootState } from 'ducks/types';

import ROUTES from 'constants/routes';

import { USD_SIGN } from 'constants/currency';
import {
	GridDivCenteredCol,
	CenteredPageLayout,
	GridDivRow,
	FlexDivCentered,
	LoaderContainer,
} from 'shared/commonStyles';

import {
	formatCurrencyWithSign,
	formatShortDate,
	bigNumberFormatter,
	parseBytes32String,
} from 'utils/formatters';

import { getPhaseAndEndDate } from 'ducks/options/constants';
import { getAvailableSynthsMap } from 'ducks/synths';

import Spinner from 'components/Spinner';
import Link from 'components/Link';
import MarketSentiment from '../components/MarketSentiment';
import { captionCSS } from 'components/Typography/General';

import ChartCard from './ChartCard';
import TradeCard from './TradeCard';
import TransactionsCard from './TransactionsCard';

import { useQuery, queryCache } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { BINARY_OPTIONS_EVENTS } from 'constants/events';

import { MarketProvider } from './contexts/MarketContext';
import { useBOMContractContext } from './contexts/BOMContractContext';

const mapStateToProps = (state: RootState) => ({
	synthsMap: getAvailableSynthsMap(state),
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MarketProps = PropsFromRedux & {
	marketAddress: string;
};

const Market: FC<MarketProps> = memo(({ synthsMap, marketAddress }) => {
	const { t } = useTranslation();
	const BOMContract = useBOMContractContext();

	const marketQuery = useQuery(QUERY_KEYS.BinaryOptions.Market(marketAddress), async () => {
		const [marketData, marketParameters] = await Promise.all([
			(snxJSConnector as any).binaryOptionsMarketDataContract.getMarketData(marketAddress),
			(snxJSConnector as any).binaryOptionsMarketDataContract.getMarketParameters(marketAddress),
		]);

		const { key: oracleKey, strikePrice } = marketParameters.oracleDetails;
		const { biddingEnd, maturity, expiry } = marketParameters.times;
		const { long: longPrice, short: shortPrice } = marketData.prices;

		return {
			currencyKey: parseBytes32String(oracleKey),
			strikePrice: bigNumberFormatter(strikePrice),
			biddingEndDate: Number(biddingEnd) * 1000,
			maturityDate: Number(maturity) * 1000,
			expiryDate: Number(expiry) * 1000,
			longPrice: bigNumberFormatter(longPrice),
			shortPrice: bigNumberFormatter(shortPrice),
		};
	});

	useEffect(() => {
		BOMContract.on(BINARY_OPTIONS_EVENTS.BID, () =>
			queryCache.invalidateQueries(QUERY_KEYS.BinaryOptions.Market(marketAddress))
		);
		BOMContract.on(BINARY_OPTIONS_EVENTS.REFUND, () =>
			queryCache.invalidateQueries(QUERY_KEYS.BinaryOptions.Market(marketAddress))
		);
		return () => {
			BOMContract.removeAllListeners(BINARY_OPTIONS_EVENTS.BID);
			BOMContract.removeAllListeners(BINARY_OPTIONS_EVENTS.REFUND);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let optionsMarket: OptionsMarketInfo | null = null;

	if (marketQuery.isSuccess && marketQuery.data) {
		const {
			currencyKey,
			strikePrice,
			biddingEndDate,
			maturityDate,
			expiryDate,
			longPrice,
			shortPrice,
		} = marketQuery.data;

		const { phase, timeRemaining } = getPhaseAndEndDate(biddingEndDate, maturityDate, expiryDate);

		optionsMarket = {
			address: marketAddress,
			biddingEndDate,
			maturityDate,
			expiryDate,
			currencyKey,
			asset: synthsMap[currencyKey]?.asset || currencyKey,
			strikePrice,
			longPrice,
			shortPrice,
			phase,
			timeRemaining,
		};
	}

	return optionsMarket ? (
		<MarketProvider optionsMarket={optionsMarket}>
			<StyledCenteredPageLayout>
				<LeftCol>
					<Heading>
						<HeadingItem>
							<AllMarketsLink to={ROUTES.Options.Home}>
								{t('options.market.heading.all-markets')}
							</AllMarketsLink>
							{' | '}
							<HeadingTitle>
								{optionsMarket.asset} &gt;{' '}
								{formatCurrencyWithSign(USD_SIGN, optionsMarket.strikePrice)} @{' '}
								{formatShortDate(optionsMarket.maturityDate)}
							</HeadingTitle>
						</HeadingItem>
						<StyledHeadingItem>
							<HeadingTitle>{t('options.market.heading.market-sentiment')}</HeadingTitle>
							<StyledMarketSentiment
								short={optionsMarket.shortPrice}
								long={optionsMarket.longPrice}
								display="col"
							/>
						</StyledHeadingItem>
					</Heading>
					<ChartCard />
					<TransactionsCard />
				</LeftCol>
				<RightCol>
					<Phases>
						{(['bidding', 'trading', 'maturity'] as Phase[]).map((phase) => (
							<PhaseItem key={phase} isActive={phase === optionsMarket!.phase}>
								{t(`options.phases.${phase}`)}
							</PhaseItem>
						))}
					</Phases>
					<TradeCard />
				</RightCol>
			</StyledCenteredPageLayout>
		</MarketProvider>
	) : (
		<LoaderContainer>
			<Spinner size="sm" centered={true} />
		</LoaderContainer>
	);
});

const StyledCenteredPageLayout = styled(CenteredPageLayout)`
	display: grid;
	grid-template-columns: 1fr auto;
`;

const LeftCol = styled(GridDivRow)`
	grid-gap: 8px;
	align-content: start;
	grid-template-rows: auto auto 1fr;
`;

const Heading = styled(GridDivCenteredCol)`
	grid-gap: 8px;
	font-size: 12px;
	grid-template-columns: auto 1fr;
`;

const HeadingItem = styled(GridDivCenteredCol)`
	grid-gap: 8px;
	background-color: ${(props) => props.theme.colors.surfaceL3};
	height: 30px;
	padding: 0 12px;
`;

const StyledHeadingItem = styled(HeadingItem)`
	grid-template-columns: auto 1fr;
`;

const StyledMarketSentiment = styled(MarketSentiment)`
	font-size: 10px;
	font-family: ${(props) => props.theme.fonts.regular};
	.longs,
	.shorts {
		color: ${(props) => props.theme.colors.brand};
	}
	.percent {
		height: 8px;
	}
`;

const AllMarketsLink = styled(Link)`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.fontSecondary};
`;

const HeadingTitle = styled.div`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.fontPrimary};
`;

const RightCol = styled(GridDivRow)`
	grid-gap: 8px;
	align-content: start;
	width: 414px;
	grid-template-rows: auto 1fr;
`;

const Phases = styled(GridDivCenteredCol)`
	border: 1px solid ${(props) => props.theme.colors.accentL2};
`;

const PhaseItem = styled(FlexDivCentered)<{ isActive: boolean }>`
	${captionCSS};
	background-color: ${(props) => props.theme.colors.surfaceL3};
	color: ${(props) => props.theme.colors.fontSecondary};
	height: 30px;
	justify-content: center;
	${(props) =>
		props.isActive &&
		css`
			background-color: ${(props) => props.theme.colors.accentL2};
			color: ${(props) => props.theme.colors.fontPrimary};
		`}
`;

export default connector(Market);
