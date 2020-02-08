import React, { memo, FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';

import { OptionsMarkets } from 'ducks/options/types';
import { RootState } from 'ducks/types';
import { getAvailableSynthsMap } from 'ducks/synths';

import Currency from 'components/Currency';
import { labelSmallCSS } from 'components/Typography/Label';
import { headingH5CSS } from 'components/Typography/Heading';

import { media } from 'shared/media';
import { darkTheme } from 'styles/theme';

import { FIAT_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import { formatCurrencyWithSign, formatShortDate } from 'utils/formatters';

import { GridDivCentered, FlexDivRow, FlexDivCol } from 'shared/commonStyles';

import TimeRemaining from '../components/TimeRemaining';
import MarketPriceRow from '../../components/MarketPriceRow';

const mapStateToProps = (state: RootState) => ({
	synthsMap: getAvailableSynthsMap(state),
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type HotMarketsProps = PropsFromRedux & {
	optionsMarkets: OptionsMarkets;
};

export const HotMarkets: FC<HotMarketsProps> = memo(({ optionsMarkets, synthsMap }) => {
	const { t } = useTranslation();

	const usdSign = synthsMap[SYNTHS_MAP.sUSD]?.sign;

	return (
		<Cards>
			{optionsMarkets.map((optionsMarket) => (
				<Card key={optionsMarket.marketAddress}>
					<MarketHeadingRow>
						<StyledCurrencyName
							currencyKey={optionsMarket.currencyKey}
							showIcon={true}
							iconProps={{ width: '24px', height: '24px', type: 'crypto' }}
						/>
						<StyledTimeRemaining end={optionsMarket.endOfBidding} />
					</MarketHeadingRow>
					<MarketDetailsRow>
						<StrikePrice>
							{formatCurrencyWithSign(usdSign, optionsMarket.strikePrice)} {FIAT_CURRENCY_MAP.USD}
						</StrikePrice>
						<MaturityDate>
							{t('common.by-date', { date: formatShortDate(optionsMarket.maturityDate) })}
						</MaturityDate>
					</MarketDetailsRow>
					<MarketPriceRow long={optionsMarket.prices.long} short={optionsMarket.prices.short} />
				</Card>
			))}
		</Cards>
	);
});

const Cards = styled(GridDivCentered)`
	grid-gap: 24px;
	grid-template-columns: 1fr 1fr 1fr 1fr;

	${media.large`
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-gap: 30px;
	`}
	${media.small`
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		grid-gap: 30px;
	`}
`;

const MarketHeadingRow = styled(FlexDivRow)`
	align-items: center;
`;

const Card = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.accentL1};
	border-radius: 3px;
	box-shadow: 0px 4px 11px rgba(188, 99, 255, 0.15442);
	width: 100%;
	height: 180px;
	padding: 16px;
	justify-content: space-between;
`;

const StyledCurrencyName = styled(Currency.Name)`
	${headingH5CSS};
	line-height: normal;
	color: ${darkTheme.colors.accentL1};
`;

const MarketDetailsRow = styled(GridDivCentered)`
	grid-gap: 7px;
`;

const StrikePrice = styled.div`
	${headingH5CSS};
	${(props) => props.theme.colors.fontPrimary};
`;

// TODO: this needs to be a typography
const MaturityDate = styled.div`
	font-family: ${(props) => props.theme.fonts.medium};
	font-size: 14px;
	line-height: 17px;
	text-align: center;
	letter-spacing: 0.2px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.fontSecondary};
`;

const StyledTimeRemaining = styled(TimeRemaining)`
	${labelSmallCSS};
	padding: 2px 10px;
	width: 90px;
`;

export default connector(HotMarkets);
