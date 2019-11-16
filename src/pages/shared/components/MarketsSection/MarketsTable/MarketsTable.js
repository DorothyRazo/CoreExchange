import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getAvailableSynthsMap } from 'src/ducks/synths';
import { navigateToTrade } from 'src/constants/routes';

import { EMPTY_VALUE } from 'src/constants/placeholder';
import ChangePercent from 'src/components/ChangePercent';
import Table from 'src/components/Table';
import { TABLE_PALETTE } from 'src/components/Table/constants';

import Currency from 'src/components/Currency';

import { formatCurrencyWithSign } from 'src/utils/formatters';

const NullableCell = ({ cellProps, children }) =>
	cellProps.cell.value == null ? <span>{EMPTY_VALUE}</span> : children;

const CurrencyCol = ({ synthsMap, cellProps }) => {
	const quoteCurrencyKey = cellProps.row.original.quoteCurrencyKey;
	const sign = synthsMap[quoteCurrencyKey] && synthsMap[quoteCurrencyKey].sign;

	if (cellProps.cell.value == null || !sign) {
		return <span>{EMPTY_VALUE}</span>;
	}

	return (
		<NullableCell cellProps={cellProps}>
			<span>{formatCurrencyWithSign(sign, cellProps.cell.value)}</span>
		</NullableCell>
	);
};

export const MarketsTable = memo(({ markets, synthsMap, marketsLoaded }) => {
	const { t } = useTranslation();

	return (
		<Table
			palette={TABLE_PALETTE.LIGHT}
			columns={[
				{
					Header: t('markets.table.pair-col'),
					accessor: 'pair',
					Cell: cellProps => (
						<Currency.Pair
							baseCurrencyKey={cellProps.row.original.baseCurrencyKey}
							quoteCurrencyKey={cellProps.row.original.quoteCurrencyKey}
							showIcon={true}
						/>
					),
					width: 150,
					sortable: true,
				},
				{
					Header: t('markets.table.last-price-col'),
					accessor: 'lastPrice',
					Cell: cellProps => <CurrencyCol synthsMap={synthsMap} cellProps={cellProps} />,
					width: 150,
					sortable: true,
				},
				{
					Header: t('markets.table.24h-change-col'),
					accessor: 'rates24hChange',
					Cell: cellProps => (
						<NullableCell cellProps={cellProps}>
							{cellProps.cell.value != null && (
								<ChangePercent isLabel={true} value={cellProps.cell.value} />
							)}
						</NullableCell>
					),
					width: 150,
					sortable: true,
				},
				{
					Header: t('markets.table.24h-low-col'),
					accessor: 'rates24hLow',
					Cell: cellProps => <CurrencyCol synthsMap={synthsMap} cellProps={cellProps} />,
					width: 150,
					sortable: true,
				},
				{
					Header: t('markets.table.24h-high-col'),
					accessor: 'rates24hHigh',
					Cell: cellProps => <CurrencyCol synthsMap={synthsMap} cellProps={cellProps} />,
					width: 150,
					sortable: true,
				},
				{
					Header: t('markets.table.24h-volume-col'),
					accessor: 'rates24hVol',
					Cell: cellProps => <CurrencyCol synthsMap={synthsMap} cellProps={cellProps} />,
					width: 150,
					sortable: true,
				},
			]}
			columnsDeps={[synthsMap]}
			data={markets}
			onTableRowClick={row =>
				navigateToTrade(row.original.baseCurrencyKey, row.original.quoteCurrencyKey)
			}
			options={{
				initialState: {
					sortBy: marketsLoaded ? [{ id: 'rates24hVol', desc: true }] : [],
				},
			}}
		/>
	);
});

MarketsTable.propTypes = {
	markets: PropTypes.array.isRequired,
	synthsMap: PropTypes.object,
};

const mapStateToProps = state => ({
	synthsMap: getAvailableSynthsMap(state),
});

export default connect(mapStateToProps, null)(MarketsTable);
