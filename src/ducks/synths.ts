import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import keyBy from 'lodash/keyBy';
import orderBy from 'lodash/orderBy';

import { synthWeight } from '../utils/synthOrdering';

import { SYNTHS_MAP, CATEGORY_MAP, CurrencyKeys, CurrencyKey } from '../constants/currency';

import { RootState } from './types';
import {
	getHistoricalRatesState,
	HistoricalRates,
	getHistoricalRatesIsOneDayPeriodLoaded,
} from './historicalRates';
import { getRatesExchangeRates } from './rates';
import { Period } from 'constants/period';
import { getSynthsCategoryFilter } from './ui';

const FROZEN_SYNTHS = [SYNTHS_MAP.sMKR, SYNTHS_MAP.iMKR];

export type SynthDefinition = {
	name: CurrencyKey;
	asset: string;
	category: string;
	sign: string;
	desc: string;
	aggregator: string;
	inverted: {
		entryPoint: number;
		upperLimit: number;
		lowerLimit: number;
	};
	isFrozen?: boolean;
};

export type SynthDefinitionWithRates = SynthDefinition & {
	historicalRates: Record<Period, Partial<HistoricalRates>> | null;
	lastPrice: number | null;
};

const sortSynths = (a: SynthDefinition, b: SynthDefinition): number => {
	if (a.category === CATEGORY_MAP.crypto && b.category === CATEGORY_MAP.crypto) {
		// @ts-ignore
		const nameOrder = synthWeight[a.name.slice(1)] - synthWeight[b.name.slice(1)];
		if (!a.inverted && b.inverted) {
			return nameOrder - 1;
		} else if ((a.inverted && b.inverted) || (!a.inverted && !b.inverted)) {
			return nameOrder;
		} else return 0;
	}
	if (a.category === CATEGORY_MAP.crypto && b.category !== CATEGORY_MAP.crypto) {
		return -1;
	}
	return 0;
};

const DEFAULT_BASE_SYNTH = SYNTHS_MAP.sBTC;
const DEFAULT_QUOTE_SYNTH = SYNTHS_MAP.sUSD;

export type SynthDefinitionMap = Record<string, SynthDefinition>;

export type SynthsSliceState = {
	availableSynths: SynthDefinitionMap;
	baseSynth: SynthDefinition;
	quoteSynth: SynthDefinition;
};

const initialState: SynthsSliceState = {
	availableSynths: {},
	baseSynth: { name: DEFAULT_BASE_SYNTH, category: CATEGORY_MAP.crypto } as SynthDefinition,
	quoteSynth: { name: DEFAULT_QUOTE_SYNTH, category: CATEGORY_MAP.forex } as SynthDefinition,
};

const sliceName = 'synths';

export const synthsSlice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setAvailableSynths: (state, action: PayloadAction<{ synths: SynthDefinition[] }>) => {
			const { synths } = action.payload;

			const availableSynths: SynthDefinitionMap = keyBy(
				synths.map((synth) => ({
					...synth,
					isFrozen: FROZEN_SYNTHS.includes(synth.name),
				})),
				'name'
			);

			const baseSynth = availableSynths[DEFAULT_BASE_SYNTH];
			const quoteSynth = availableSynths[DEFAULT_QUOTE_SYNTH];

			if (baseSynth) {
				state.baseSynth = baseSynth;
			}
			if (quoteSynth) {
				state.quoteSynth = quoteSynth;
			}

			state.availableSynths = availableSynths;
		},
		setSynthPair: (
			state,
			action: PayloadAction<{ baseCurrencyKey: CurrencyKey; quoteCurrencyKey: CurrencyKey }>
		) => {
			const { baseCurrencyKey, quoteCurrencyKey } = action.payload;

			state.baseSynth = state.availableSynths[baseCurrencyKey];
			state.quoteSynth = state.availableSynths[quoteCurrencyKey];
		},
		updateFrozenSynths: (state, action: PayloadAction<{ frozenSynths: CurrencyKeys }>) => {
			const { frozenSynths } = action.payload;

			Object.values(state.availableSynths).forEach((synth) => {
				state.availableSynths[synth.name].isFrozen = frozenSynths.includes(synth.name);
			});
		},
	},
});

export const { setAvailableSynths, setSynthPair, updateFrozenSynths } = synthsSlice.actions;

export const getSynthsState = (state: RootState) => state[sliceName];
export const getAvailableSynthsMap = (state: RootState) => getSynthsState(state).availableSynths;
export const getAvailableSynths = createSelector(getAvailableSynthsMap, (availableSynths) =>
	Object.values(availableSynths).sort(sortSynths)
);

export const getSynthsWithRates = createSelector(
	getAvailableSynths,
	getHistoricalRatesState,
	getRatesExchangeRates,
	(availableSynths, historicalRates, exchangeRates) =>
		availableSynths.map((synth) => ({
			...synth,
			historicalRates: historicalRates[synth.name] || null,
			lastPrice: exchangeRates != null ? exchangeRates[synth.name] : null,
		}))
);

export const getOrderedSynthsWithRates = createSelector(
	getSynthsWithRates,
	getHistoricalRatesIsOneDayPeriodLoaded,
	(synthsWithRates, historicalRatesIsOneDayPeriodLoaded) =>
		historicalRatesIsOneDayPeriodLoaded
			? orderBy(synthsWithRates, (synth) => synth.historicalRates.ONE_DAY.data?.change, 'desc')
			: synthsWithRates
);

export const getFilteredSynthsWithRates = createSelector(
	getOrderedSynthsWithRates,
	getSynthsCategoryFilter,
	(availableSynths, synthsCategoryFilter) =>
		synthsCategoryFilter != null
			? availableSynths.filter((synth) => {
					let normalizedCategory;

					// map certain categories to a larger top group category. (might need a "switch" if this list grows large)
					if (synth.category === CATEGORY_MAP.index) {
						normalizedCategory = CATEGORY_MAP.crypto;
					} else {
						normalizedCategory = synth.category;
					}

					return normalizedCategory === synthsCategoryFilter;
			  })
			: availableSynths
);

export const getSynthPair = (state: RootState) => ({
	base: getSynthsState(state).baseSynth,
	quote: getSynthsState(state).quoteSynth,
});

export default synthsSlice.reducer;
