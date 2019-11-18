import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { SearchInput } from '../Input';

import { getSynthSearch } from '../../ducks';
import { getRatesExchangeRates, getIsLoadedRates } from '../../ducks/rates';
import { getAvailableSynths, getSynthPair, getAvailableSynthsMap } from '../../ducks/synths';
import { formatCurrency } from '../../utils/formatters';
import { pairWeight } from '../../utils/synthOrdering';
import { getExchangeRatesForCurrencies } from '../../utils/rates';

import Currency from '../Currency';
import { DataMedium, DataSmall } from '../Typography';
import { ButtonFilter, ButtonFilterWithDropdown } from '../Button';

import { setSynthSearch } from '../../ducks/ui';
import { navigateToTrade } from '../../constants/routes';

const FILTERS = ['sUSD', 'sBTC', 'sETH', 'sFIAT'];

const PairList = ({ synths, synthsMap, exchangeRates, setSynthSearch, search, isLoadedRates }) => {
	const [quote, setQuote] = useState({ name: 'sUSD', category: 'forex' });
	// const [sort, setSort] = useState({});
	const [synthList, setSynthList] = useState([]);
	const [filteredSynths, setFilteredSynths] = useState([]);

	useEffect(() => {
		if (!synths || synths.length === 0) return;
		let listToCompare = synths;
		let list = [];
		synths.forEach(a => {
			listToCompare.forEach(b => {
				const rate = getExchangeRatesForCurrencies(exchangeRates, a.name, b.name) || 0;
				const inverseRate = getExchangeRatesForCurrencies(exchangeRates, b.name, a.name) || 0;
				if (a.name !== b.name) {
					if (pairWeight(b) > pairWeight(a)) {
						list.push({
							base: b,
							quote: a,
							rate: inverseRate,
						});
					} else if (pairWeight(b) === pairWeight(a)) {
						list = list.concat([
							{
								base: a,
								quote: b,
								rate,
							},
							{
								base: b,
								quote: a,
								rate: inverseRate,
							},
						]);
					} else {
						list.push({
							base: a,
							quote: b,
							rate,
						});
					}
				}
			});
			listToCompare = listToCompare.filter(s => s.name !== a.name);
		});
		setSynthList(list);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [synths.length, exchangeRates]);

	useEffect(() => {
		setSynthSearch('');
		setFilteredSynths(synthList.filter(synth => synth.quote.name === quote.name));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quote.name]);

	useEffect(() => {
		let list = [];
		let usdPairCount = 0;
		if (!search) {
			list = synthList.filter(synth => synth.quote.name === quote.name);
		} else {
			list = synthList
				.filter(synth => {
					const hasMatch =
						synth.base.name.toLowerCase().includes(search.toLowerCase()) ||
						synth.quote.name.toLowerCase().includes(search.toLowerCase()) ||
						synth.base.desc.toLowerCase().includes(search.toLowerCase()) ||
						synth.quote.desc.toLowerCase().includes(search.toLowerCase());
					if (hasMatch && synth.quote.name === 'sUSD') usdPairCount += 1;
					return hasMatch;
				})
				// we want to put sBASE/sUSD at the top when a search different than
				// sUSD occurs
				.sort(a => {
					if (usdPairCount <= 2 && a.quote.name === 'sUSD') {
						if (!a.base.inverted) return -2;
						return -1;
					}
					return 0;
				});
		}
		setFilteredSynths(list);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [synthList, search]);

	return (
		<Container>
			<ContainerHeader>
				<SearchInput value={search} onChange={e => setSynthSearch(e.target.value)} />
				<ButtonRow>
					{FILTERS.map((filter, i) => {
						return ['sFIAT'].includes(filter) ? (
							<ButtonFilterWithDropdown
								key={i}
								quote={quote}
								onClick={synth => setQuote(synth)}
								synths={
									filter === 'sFIAT'
										? synths.filter(synth => synth.category === 'forex')
										: synths.filter(synth => synth.category !== 'forex')
								}
							>
								{filter}
							</ButtonFilterWithDropdown>
						) : (
							<ButtonFilter
								key={i}
								active={filter === quote.name}
								onClick={() => setQuote(synths.find(synth => synth.name === filter))}
							>
								{filter}
							</ButtonFilter>
						);
					})}
				</ButtonRow>
				<ListHeader>
					{[
						{ label: 'Pair', value: 'name' },
						{ label: 'Price', value: 'rate' },
					].map((column, i) => {
						return (
							<ListHeaderElement key={i}>
								<ButtonSort
								// onClick={() =>
								// 	setSort(() => {
								// 		if (sort && sort.column === column.value) {
								// 			return { ...sort, isAscending: !sort.isAscending };
								// 		} else return { column: column.value, isAscending: true };
								// 	})
								// }
								>
									<ListHeaderLabel>{column.label}</ListHeaderLabel>
								</ButtonSort>
							</ListHeaderElement>
						);
					})}
				</ListHeader>
			</ContainerHeader>
			<List>
				{filteredSynths.map(pair => (
					<Pair
						isDisabled={!isLoadedRates}
						key={`${pair.base.name}-${pair.quote.name}`}
						onClick={() => navigateToTrade(pair.base.name, pair.quote.name)}
					>
						<PairElement>
							<Currency.Pair baseCurrencyKey={pair.base.name} quoteCurrencyKey={pair.quote.name} />
						</PairElement>
						<PairElement>
							<DataMedium>
								{synthsMap[quote.name].sign}
								{formatCurrency(pair.rate, 6)}
							</DataMedium>
						</PairElement>
					</Pair>
				))}
			</List>
		</Container>
	);
};

const Container = styled.div`
	background-color: ${props => props.theme.colors.surfaceL2};
	display: flex;
	flex-direction: column;
	height: 100%;
`;
const ContainerHeader = styled.div`
	padding: 12px;
	background-color: ${props => props.theme.colors.surfaceL3};
`;
const ButtonRow = styled.div`
	width: 100%;
	display: flex;
	margin: 10px 0;
	& > * {
		margin: 0 5px;
		flex: 1;
		&:first-child {
			margin-left: 0;
		}
		&:last-child {
			margin-right: 0;
		}
	}
`;

const List = styled.ul`
	margin: 0 0 0 10px;
	padding: 0;
	overflow-y: auto;
	overflow-x: hidden;
`;

const Pair = styled.li`
	background: ${props => props.theme.colors.surfaceL3};
	cursor: pointer;
	margin-top: 6px;
	height: 42px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	border-radius: 1px;
	justify-content: space-between;
	transition: transform 0.2s ease-out;
	&:hover {
		background-color: ${props => props.theme.colors.accentL1};
		transform: scale(1.02);
	}
	opacity: ${props => (props.isDisabled ? 0.5 : 1)};
	pointer-events: ${props => (props.isDisabled ? 'none' : 'auto')};
`;

const PairElement = styled.div`
	white-space: nowrap;
	flex: 1;
	justify-content: flex-end;
	display: flex;
	align-items: center;
	&:first-child {
		justify-content: flex-start;
	}
`;

const ListHeader = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 0 12px;
`;

const ListHeaderLabel = styled(DataSmall)`
	font-family: 'apercu-medium', sans-serif;
	color: ${props => props.theme.colors.fontTertiary};
`;

const ListHeaderElement = styled.div`
	flex: 1;
	text-align: right;
	&:first-child {
		text-align: left;
	}
`;

const ButtonSort = styled.button`
	border: none;
	padding: 0;
	cursor: pointer;
	background: transparent;
`;

const mapStateToProps = state => ({
	synths: getAvailableSynths(state),
	synthsMap: getAvailableSynthsMap(state),
	exchangeRates: getRatesExchangeRates(state),
	synthPair: getSynthPair(state),
	search: getSynthSearch(state),
	isLoadedRates: getIsLoadedRates(state),
});

const mapDispatchToProps = {
	setSynthSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(PairList);
