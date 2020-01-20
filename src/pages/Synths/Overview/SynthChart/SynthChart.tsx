import React, { memo, FC, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';

import {
	SynthDefinition,
	getSynthsWithRatesMap,
	SynthDefinitionWithRatesMap,
	getAvailableSynthsMap,
	SynthDefinitionMap,
} from 'ducks/synths';
import { RootState } from 'ducks/types';
import { fetchHistoricalRatesRequest, HistoricalRatesData } from 'ducks/historicalRates';

import { SYNTHS_MAP, sUSD_EXCHANGE_RATE } from 'constants/currency';
import { BaseRateUpdates } from 'constants/rates';
import { DEFAULT_REQUEST_REFRESH_INTERVAL } from 'constants/ui';
import { PeriodLabel, PERIOD_LABELS_MAP } from 'constants/period';

import ChartCard from 'components/ChartCard';
import useInterval from 'shared/hooks/useInterval';

import { formatCurrencyWithSign } from 'utils/formatters';

import { darkTheme } from 'styles/theme';
import { media } from 'shared/media';

import Currency from 'components/Currency';
import { mockRates } from 'pages/Synths/mockData';

type StateProps = {
	synthsMap: SynthDefinitionMap;
	synthsWithRatesMap: SynthDefinitionWithRatesMap;
};

type DispatchProps = {
	fetchHistoricalRatesRequest: typeof fetchHistoricalRatesRequest;
};

type Props = {
	synth: SynthDefinition;
};

type SynthChartProps = StateProps & DispatchProps & Props;

export const SynthChart: FC<SynthChartProps> = memo(
	({ synth, fetchHistoricalRatesRequest, synthsWithRatesMap, synthsMap }) => {
		const { t } = useTranslation();
		const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabel>(PERIOD_LABELS_MAP.ONE_DAY);
		const [historicalRateUpdates, setHistoricalRatesUpdates] = useState<BaseRateUpdates>([]);
		const [historicalRateChange, setHistoricalRatesChange] = useState<number | null>(0);
		const [loading, setLoading] = useState<boolean>(true);

		const isUSD = synth.name === SYNTHS_MAP.sUSD;

		useEffect(() => {
			if (!isUSD) {
				fetchHistoricalRatesRequest({ synths: [synth], periods: [selectedPeriod.period] });
			}
		}, [fetchHistoricalRatesRequest, synth, selectedPeriod.period, isUSD]);

		useInterval(
			() => {
				fetchHistoricalRatesRequest({ synths: [synth], periods: [selectedPeriod.period] });
			},
			isUSD ? null : DEFAULT_REQUEST_REFRESH_INTERVAL
		);

		useEffect(() => {
			if (isUSD) {
				const rates = mockRates(selectedPeriod.value, sUSD_EXCHANGE_RATE);

				setLoading(false);
				setHistoricalRatesUpdates(rates);
			} else {
				const historicalRates: HistoricalRatesData | null = get(
					synthsWithRatesMap,
					[synth.name, 'historicalRates', selectedPeriod.period, 'data'],
					null
				);

				if (historicalRates != null) {
					setLoading(false);
					setHistoricalRatesUpdates(historicalRates?.rates || []);
					setHistoricalRatesChange(historicalRates?.change || 0);
				} else {
					setLoading(true);
				}
			}
		}, [synthsWithRatesMap, selectedPeriod, synth.name, isUSD]);

		const lastPrice = get(synthsWithRatesMap, [synth.name, 'lastPrice'], null);
		const synthSign = synthsMap[SYNTHS_MAP.sUSD].sign;

		return (
			<StyledChartCard
				tooltipVisible={true}
				currencyLabel={
					<Currency.Name
						currencyKey={synth.name}
						showIcon={true}
						iconProps={{ width: '24px', height: '24px' }}
					/>
				}
				price={lastPrice != null ? formatCurrencyWithSign(synthSign, lastPrice) : null}
				change={historicalRateChange}
				chartData={historicalRateUpdates}
				variableGradient={false}
				selectedPeriod={selectedPeriod}
				onPeriodClick={setSelectedPeriod}
				showLoader={loading}
				synthSign={synthSign}
				xAxisVisible={true}
				yAxisDomain={
					synth.inverted ? [synth.inverted.lowerLimit, synth.inverted.upperLimit] : undefined
				}
				yAxisRefLines={
					synth.inverted
						? [
								{
									label: t('common.currency.lower-limit-price', {
										price: `${synthSign}${synth.inverted.lowerLimit}`,
									}),
									value: synth.inverted.lowerLimit,
								},
								{
									label: t('common.currency.entry-limit-price', {
										price: `${synthSign}${synth.inverted.entryPoint}`,
									}),
									value: synth.inverted.entryPoint,
								},
								{
									label: t('common.currency.upper-limit-price', {
										price: `${synthSign}${synth.inverted.upperLimit}`,
									}),
									value: synth.inverted.upperLimit - synth.inverted.upperLimit * 0.05,
								},
						  ]
						: undefined
				}
				overlayMessage={synth.isFrozen ? t('common.currency.frozen-synth') : undefined}
			/>
		);
	}
);

const StyledChartCard = styled(ChartCard)`
	height: 450px;
	padding: 0;
	${media.large`
		border-radius: 0;
		height: 340px;
	`}
	.labels-container {
		padding: 24px 24px 0 24px;
	}
	.chart-data {
		padding: 0 24px 24px 24px;
		${media.large`
		padding: 0 0 10px 0;
		`}
	}
	.currency-price,
	.currency-key > * {
		font-size: 24px;
		${media.large`
			font-size: 20px;
		`}
	}
	.currency-key > * {
		color: ${darkTheme.colors.accentL1};
	}
	.change-percent {
		min-width: 60px;
		text-align: center;
	}
	.recharts-default-tooltip {
		background: ${darkTheme.colors.surfaceL1} !important;
	}
	.recharts-tooltip-label,
	.recharts-tooltip-item {
		color: ${darkTheme.colors.white} !important;
	}

	.recharts-reference-line .recharts-label {
		font-size: 10px;
		fill: ${darkTheme.colors.fontTertiary};
		font-family: ${(props) => props.theme.fonts.regular};
		text-transform: uppercase;
	}
`;

const mapStateToProps = (state: RootState): StateProps => ({
	synthsMap: getAvailableSynthsMap(state),
	synthsWithRatesMap: getSynthsWithRatesMap(state),
});

const mapDispatchToProps: DispatchProps = {
	fetchHistoricalRatesRequest,
};

export default connect<StateProps, DispatchProps, Props, RootState>(
	mapStateToProps,
	mapDispatchToProps
)(SynthChart);
