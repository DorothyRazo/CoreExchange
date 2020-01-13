import React, { FC, memo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { CellProps } from 'react-table';
import Popover from '@material-ui/core/Popover';

import { SynthDefinitionMap, getAvailableSynthsMap, SynthDefinitionWithRates } from 'ducks/synths';

import { RootState } from 'ducks/types';

import { SYNTHS_MAP, CurrencyKey } from 'constants/currency';
import { RateUpdates } from 'constants/rates';
import { EMPTY_VALUE } from 'constants/placeholder';

import Table from 'components/Table';
import Currency from 'components/Currency';
import { CurrencyCol } from 'components/Table/common';
import ChangePercent from 'components/ChangePercent';

import TrendLineChart from 'components/TrendLineChart';
import { Button } from 'components/Button';
import { TableOverflowContainer } from 'shared/commonStyles';

import BaseTradingPairs from 'components/BaseTradingPairs';

type StateProps = {
	synthsMap: SynthDefinitionMap;
};

type Props = {
	synthsWithRates: SynthDefinitionWithRates[];
	noResultsMessage?: React.ReactNode;
};

type SynthsTableProps = StateProps & Props;

export const SynthsTable: FC<SynthsTableProps> = memo(
	({ synthsMap, synthsWithRates, noResultsMessage }) => {
		const { t } = useTranslation();
		const [selectedSynth, setSelectedSynth] = useState<CurrencyKey | null>(null);
		const [tradeButtonAnchorEl, setTradeButtonAnchorEl] = useState<HTMLButtonElement | null>(null);

		const handleTradeButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			setTradeButtonAnchorEl(event.currentTarget);
		};

		const handleTradePopoverClose = () => {
			setTradeButtonAnchorEl(null);
			setSelectedSynth(null);
		};

		const tradeButtonPopoverOpen = Boolean(tradeButtonAnchorEl);
		const id = tradeButtonPopoverOpen ? 'trade-button-popover' : undefined;

		return (
			<>
				<TableOverflowContainer>
					<StyledTable
						palette="light-secondary"
						columns={[
							{
								Header: <>{t('synths.table.synth-col')}</>,
								accessor: 'name',
								Cell: (
									cellProps: CellProps<SynthDefinitionWithRates, SynthDefinitionWithRates['name']>
								) => (
									<Currency.Name
										currencyKey={cellProps.cell.value}
										currencyDesc={cellProps.row.original.desc}
										showIcon={true}
									/>
								),
								width: 200,
								sortable: true,
							},
							{
								Header: <>{t('synths.table.last-price-col')}</>,
								accessor: 'lastPrice',
								sortType: 'basic',
								Cell: (
									cellProps: CellProps<
										SynthDefinitionWithRates,
										SynthDefinitionWithRates['lastPrice']
									>
								) => (
									<CurrencyCol
										currencyKey={SYNTHS_MAP.sUSD}
										synthsMap={synthsMap}
										cellProps={cellProps}
									/>
								),
								width: 100,
								sortable: true,
							},
							{
								Header: <>{t('synths.table.24h-change-col')}</>,
								sortType: 'basic',
								id: '24change-col',
								Cell: (cellProps: CellProps<SynthDefinitionWithRates>) => {
									const change = cellProps.row.original.historicalRates?.ONE_DAY.data?.change;

									return change ? (
										<ChangePercent isLabel={true} value={change} />
									) : (
										<span>{EMPTY_VALUE}</span>
									);
								},

								sortable: true,
								width: 100,
							},
							{
								Header: <>{t('synths.table.24h-trend-col')}</>,
								id: '24trend-col',
								Cell: (cellProps: CellProps<SynthDefinitionWithRates>) => {
									const data = cellProps.row.original.historicalRates?.ONE_DAY?.data;
									if (!data || data.rates.length === 0) {
										return <span>{EMPTY_VALUE}</span>;
									}
									return (
										<TrendLineChart
											change={data.change as number}
											chartData={data.rates as RateUpdates}
										/>
									);
								},
								width: 150,
							},
							{
								Header: <>{t('synths.table.trade-now-col')}</>,
								id: 'trade-col',
								Cell: (cellProps: CellProps<SynthDefinitionWithRates>) => (
									<Button
										size="sm"
										palette="outline"
										onClick={(e) => {
											handleTradeButtonClick(e);
											setSelectedSynth(cellProps.row.original.name);
										}}
									>
										{t('common.actions.trade')}
									</Button>
								),
							},
						]}
						columnsDeps={[synthsMap]}
						data={synthsWithRates}
						noResultsMessage={noResultsMessage}
					/>
				</TableOverflowContainer>
				<StyledPopover
					classes={{
						paper: 'paper',
					}}
					id={id}
					open={tradeButtonPopoverOpen}
					anchorEl={tradeButtonAnchorEl}
					onClose={handleTradePopoverClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
				>
					<PopoverContent>
						{selectedSynth && <BaseTradingPairs currencyKey={selectedSynth} />}
					</PopoverContent>
				</StyledPopover>
			</>
		);
	}
);

const StyledTable = styled(Table)`
	.table-row {
		& > :last-child {
			justify-content: flex-end;
		}
	}

	.table-body-row {
		& > :last-child {
			justify-content: flex-end;
		}
		&:hover {
			box-shadow: none;
		}
	}
`;

const StyledPopover = styled(Popover)`
	margin-top: 8px;
	.paper {
		box-shadow: 0px 4px 11px rgba(188, 99, 255, 0.15442);
		border: 1px solid #f2f2f6;
	}
`;

const PopoverContent = styled.div`
	display: grid;
	> * {
		padding: 10px 15px;
		&:hover {
			background-color: ${({ theme }) => theme.colors.accentL1};
		}
	}
`;

const mapStateToProps = (state: RootState): StateProps => ({
	synthsMap: getAvailableSynthsMap(state),
});

export default connect<StateProps, {}, {}, RootState>(mapStateToProps)(SynthsTable);
