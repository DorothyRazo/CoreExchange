import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import keyBy from 'lodash/keyBy';

import { synthWeight } from '../utils/synthOrdering';

import { SYNTHS_MAP, ASSETS_MAP, CurrencyKeys, CurrencyKey } from '../constants/currency';

import { RootState } from './types';

const FROZEN_SYNTHS = [SYNTHS_MAP.sMKR, SYNTHS_MAP.iMKR];

export interface SynthDefinition {
	name: CurrencyKey;
	asset: string;
	category: string;
	sign: string;
	desc: string;
	aggregator: string;
	inverted: boolean;
	isFrozen?: boolean;
}

const sortSynths = (a: SynthDefinition, b: SynthDefinition): number => {
	if (a.category === ASSETS_MAP.crypto && b.category === ASSETS_MAP.crypto) {
		// @ts-ignore
		const nameOrder = synthWeight[a.name.slice(1)] - synthWeight[b.name.slice(1)];
		if (!a.inverted && b.inverted) {
			return nameOrder - 1;
		} else if ((a.inverted && b.inverted) || (!a.inverted && !b.inverted)) {
			return nameOrder;
		} else return 0;
	}
	if (a.category === ASSETS_MAP.crypto && b.category !== ASSETS_MAP.crypto) {
		return -1;
	}
	return 0;
};

const DEFAULT_BASE_SYNTH = SYNTHS_MAP.sBTC;
const DEFAULT_QUOTE_SYNTH = SYNTHS_MAP.sUSD;

type SynthDefinitionMap = Record<string, SynthDefinition>;

export interface SynthsSliceState {
	availableSynths: SynthDefinitionMap;
	baseSynth: SynthDefinition;
	quoteSynth: SynthDefinition;
}

const initialState: SynthsSliceState = {
	availableSynths: {},
	baseSynth: { name: DEFAULT_BASE_SYNTH, category: ASSETS_MAP.crypto } as SynthDefinition,
	quoteSynth: { name: DEFAULT_QUOTE_SYNTH, category: ASSETS_MAP.forex } as SynthDefinition,
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

			frozenSynths.forEach((synth: CurrencyKey) => {
				if (state.availableSynths[synth]) {
					state.availableSynths[synth].isFrozen = true;
				}
			});
		},
	},
});

export const getSynthsState = (state: RootState) => state[sliceName];
export const getAvailableSynthsMap = (state: RootState) => getSynthsState(state).availableSynths;
export const getSortedAvailableList = createSelector(getAvailableSynthsMap, (availableSynths) =>
	Object.values(availableSynths)
);

export const getSortedAvailableSynths = createSelector(getSortedAvailableList, (availableSynths) =>
	availableSynths.sort(sortSynths)
);

export const getAvailableSynths = createSelector(getSortedAvailableSynths, (availableSynths) =>
	availableSynths.filter((synth: SynthDefinition) => !synth.isFrozen)
);
export const getSynthPair = (state: RootState) => ({
	base: getSynthsState(state).baseSynth,
	quote: getSynthsState(state).quoteSynth,
});

export const { setAvailableSynths, setSynthPair, updateFrozenSynths } = synthsSlice.actions;

export default synthsSlice.reducer;
