import React, { FC, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, Label } from 'recharts';
import format from 'date-fns/format';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import { useQuery } from 'react-query';

import { USD_SIGN } from 'constants/currency';

import { formatCurrencyWithSign } from 'utils/formatters';

import { PeriodLabel, PERIOD_IN_HOURS } from 'constants/period';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';
import Spinner from 'components/Spinner';

import QUERY_KEYS from 'constants/queryKeys';

import { fetchSynthRateUpdate } from 'services/rates/rates';

import { ChartContainer } from '../common';
import { OptionsMarketInfo } from 'pages/Options/types';
import { HistoricalRatesData } from 'ducks/historicalRates';

type PriceChartProps = {
	selectedPeriod: PeriodLabel;
	optionsMarket: OptionsMarketInfo;
};

const PriceChart: FC<PriceChartProps> = ({ selectedPeriod, optionsMarket }) => {
	const theme = useContext(ThemeContext);

	const historicalRatesQuery = useQuery<HistoricalRatesData | null, any>(
		QUERY_KEYS.Synths.HistoricalRates(optionsMarket.currencyKey, selectedPeriod.period),
		() => fetchSynthRateUpdate(optionsMarket.currencyKey, selectedPeriod.value)
	);

	const chartData = get(historicalRatesQuery, 'data.rates', []);
	const isLoading = historicalRatesQuery.isLoading;

	const chartColor = theme.colors.hyperlink;
	const linearGradientId = 'optionsMarketPriceChartArea';

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.fontTertiary,
		fontFamily: theme.fonts.regular,
	};

	const fontStyleMedium = {
		...fontStyle,
		fontFamily: theme.fonts.medium,
	};

	return (
		<>
			<ChartContainer semiTransparent={isLoading}>
				<RechartsResponsiveContainer width="100%" height="100%">
					<AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
						<defs>
							<linearGradient id={linearGradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={chartColor} stopOpacity={0.5} />
								<stop offset="95%" stopColor={chartColor} stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis
							dataKey="timestamp"
							tick={fontStyleMedium}
							axisLine={false}
							tickLine={false}
							tickFormatter={(val) => {
								if (!isNumber(val)) {
									return '';
								}
								const periodOverOneDay =
									selectedPeriod != null && selectedPeriod.value > PERIOD_IN_HOURS.ONE_DAY;

								return format(val, periodOverOneDay ? 'dd MMM' : 'h:mma');
							}}
						/>
						<YAxis
							type="number"
							domain={['auto', (d: number) => Math.max(d, optionsMarket.strikePrice * 1.1)]}
							// domain={['auto', 'auto']}
							tick={fontStyleMedium}
							orientation="right"
							axisLine={false}
							tickLine={false}
							tickFormatter={(val) => formatCurrencyWithSign(USD_SIGN, val)}
						/>
						<Area
							dataKey="rate"
							stroke={chartColor}
							fillOpacity={0.5}
							fill={`url(#${linearGradientId})`}
							isAnimationActive={false}
						/>
						<ReferenceLine
							y={optionsMarket.strikePrice}
							stroke={theme.colors.fontSecondary}
							strokeDasharray="5 2"
						>
							<Label
								position="insideBottomRight"
								className="ref-line-label ref-line-label-strike-price"
							>
								{formatCurrencyWithSign(USD_SIGN, optionsMarket.strikePrice)}
							</Label>
						</ReferenceLine>
						<Tooltip
							className="tooltip"
							// @ts-ignore
							cursor={{ strokeWidth: 1, stroke: theme.colors.fontTertiary }}
							contentStyle={{
								border: 'none',
								borderRadius: '3px',
								backgroundColor: theme.colors.surfaceL1,
							}}
							itemStyle={{
								...fontStyle,
								textTransform: 'capitalize',
							}}
							labelStyle={fontStyle}
							formatter={(val: string | number) => formatCurrencyWithSign(USD_SIGN, val)}
							labelFormatter={(label) => {
								if (!isNumber(label)) {
									return '';
								}
								return format(label, 'do MMM yy | HH:mm');
							}}
						/>
					</AreaChart>
				</RechartsResponsiveContainer>
			</ChartContainer>
			{isLoading && <Spinner size="sm" centered={true} />}
		</>
	);
};

export default PriceChart;
