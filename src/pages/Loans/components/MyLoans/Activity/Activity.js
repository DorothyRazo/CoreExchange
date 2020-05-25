import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTable, useFlexLayout, useSortBy } from 'react-table';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { LinkTextSmall, TableNoResults } from 'shared/commonStyles';

import { formatCurrencyWithKey } from 'utils/formatters';

import { CARD_HEIGHT } from 'constants/ui';
import { getLoansCollateralPair } from 'ducks/loans/contractInfo';

const Activity = ({ partialLiquidations, collateralPair }) => {
	const { t } = useTranslation();
	const { collateralCurrencyKey, loanCurrencyKey } = collateralPair;

	const columns = useMemo(
		() => [
			{
				Header: <>{t('loans.liquidations.sub-table.collateral-col')}</>,
				accessor: 'liquidatedCollateral',
				Cell: (cellProps) => formatCurrencyWithKey(collateralCurrencyKey, cellProps.cell.value),
				width: 150,
				sortable: true,
			},
			{
				Header: <>{t('loans.liquidations.sub-table.penalty-col')}</>,
				accessor: 'penaltyAmount',
				Cell: (cellProps) => formatCurrencyWithKey(collateralCurrencyKey, cellProps.cell.value),
				width: 150,
				sortable: true,
			},
			{
				Header: <>{t('loans.liquidations.sub-table.repaid-col')}</>,
				accessor: 'liquidatedAmount',
				Cell: (cellProps) => formatCurrencyWithKey(loanCurrencyKey, cellProps.cell.value),
				width: 150,
				sortable: true,
			},
			{
				Header: <>{t('loans.liquidations.sub-table.liquidator-col')}</>,
				accessor: 'liquidator',
				Cell: (cellProps) => cellProps.cell.value,
				width: 150,
				sortable: true,
			},
			{
				id: 'verify',
				Header: <>{t('loans.liquidations.sub-table.verify-col')}</>,
				accessor: 'txHash',
				Cell: (cellProps) => {
					console.log(cellProps.cell);
					return (
						<LinkTextSmall
							as="a"
							target="_blank"
							href={`https://etherscan.io/tx/${cellProps.cell.value}`}
						>
							{t('loans.liquidations.sub-table.view')}
						</LinkTextSmall>
					);
				},
				width: 150,
			},
		],
		[collateralCurrencyKey, t, loanCurrencyKey]
	);

	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
		{
			columns,
			data: partialLiquidations,
			initialState: {
				sortBy: [{ id: 'timeCreated', desc: true }],
			},
		},
		useFlexLayout,
		useSortBy
	);

	return (
		<Table {...getTableProps()}>
			{headerGroups.map((headerGroup) => (
				<TableRow {...headerGroup.getHeaderGroupProps()}>
					{headerGroup.headers.map((column) => (
						<TableCellHead {...column.getHeaderProps(column.getSortByToggleProps())} className="th">
							{column.render('Header')}
						</TableCellHead>
					))}
				</TableRow>
			))}
			{rows.length > 0 ? (
				<TableBody {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);
						return (
							<TableBodyRow {...row.getRowProps()} className="tr">
								{row.cells.map((cell) => (
									<TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
								))}
							</TableBodyRow>
						);
					})}
				</TableBody>
			) : (
				rows.length === 0 && (
					<StyledTableNoResults>
						{t('loans.liquidations.table.no-partial-liquidations')}
					</StyledTableNoResults>
				)
			)}
		</Table>
	);
};

const Table = styled.div`
	width: 100%;
	height: 100%;
	overflow-x: auto;
	position: relative;
`;

const TableRow = styled.div`
	background-color: ${(props) => props.theme.colors.surfaceL3};
	margin-bottom: 8px;
	padding-left: 24px;
`;

const TableBody = styled.div`
	max-height: calc(100% - 40px);
	overflow-y: auto;
	overflow-x: hidden;
`;

const TableBodyRow = styled(TableRow)`
	background-color: ${(props) => props.theme.colors.surfaceL3};
	&:hover {
		background-color: ${(props) => props.theme.colors.accentL1};
		> * {
			transition: transform 0.2s ease-out;
			transform: scale(1.02);
		}
	}
`;

const TableCell = styled.div`
	display: flex;
	align-items: center;
	color: ${(props) => props.theme.colors.fontPrimary};
	font-size: 12px;
	padding: 10px 0;
	height: ${CARD_HEIGHT};
	box-sizing: border-box;
	&:first-child {
		padding-left: 18px;
	}
	&:last-child {
		justify-content: flex-end;
		padding-right: 18px;
	}
`;

const TableCellHead = styled(TableCell)`
	color: ${(props) => props.theme.colors.fontTertiary};
	user-select: none;
	text-transform: uppercase;
	background-color: ${(props) => props.theme.colors.surfaceL3};
`;

const StyledTableNoResults = styled(TableNoResults)`
	padding-left: 24px;
`;

const mapStateToProps = (state) => ({
	collateralPair: getLoansCollateralPair(state),
});

export default connect(mapStateToProps, null)(Activity);
