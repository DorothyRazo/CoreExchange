import React, { memo } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import PropTypes from 'prop-types';

import ChartCard from 'src/components/ChartCard/ChartCard';

import { lightTheme } from 'src/styles/theme';

import { navigateToTrade } from 'src/constants/routes';

import { media } from 'src/shared/media';

import { formatCurrencyWithSign } from 'src/utils/formatters';

const CHART_CARDS = 4;

export const MarketsCharts = memo(({ markets, synthsMap }) => (
	<ThemeProvider theme={lightTheme}>
		<Container>
			{markets
				.slice(0, Math.min(CHART_CARDS, markets.length))
				.map(({ quoteCurrencyKey, pair, baseCurrencyKey, lastPrice, rates24hChange, rates }) => {
					const sign = synthsMap[quoteCurrencyKey] && synthsMap[quoteCurrencyKey].sign;

					return (
						<StyledChartCard
							key={pair}
							baseCurrencyKey={baseCurrencyKey}
							quoteCurrencyKey={quoteCurrencyKey}
							price={lastPrice != null ? formatCurrencyWithSign(sign, lastPrice) : null}
							change={rates24hChange}
							chartData={rates}
							onClick={() => navigateToTrade(baseCurrencyKey, quoteCurrencyKey)}
						/>
					);
				})}
		</Container>
	</ThemeProvider>
));

const Container = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-gap: 24px;
	justify-content: center;

	${media.large`
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-gap: 30px;
	`}
	${media.medium`
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		grid-gap: 30px;
	`}
`;

const StyledChartCard = styled(ChartCard)`
	background-color: ${props => props.theme.colors.white};
`;

MarketsCharts.propTypes = {
	markets: PropTypes.array.isRequired,
	synthsMap: PropTypes.object,
};

export default MarketsCharts;
