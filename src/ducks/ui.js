import { persistState, getPersistedState } from '../config/store';

const CHANGE_SCREEN = 'UI/CHANGE_SCREEN';
const TOGGLE_WALLET_POPUP = 'UI/TOGGLE_WALLET_SELECTOR_POPUP';
const TOGGLE_GWEI_POPUP = 'UI/TOGGLE_GWEI_SELECTOR_POPUP';
const TOGGLE_DEPOT_POPUP = 'UI/TOGGLE_DEPOT_POPUP';
const TOGGLE_THEME = 'UI/TOGGLE_THEME';
const SET_SYNTH_SEARCH = 'UI/SET_SYNTH_SEARCH';

const persistedState = getPersistedState('ui');
const defaultState = Object.assign(
	{
		theme: 'dark',
		walletPopupIsVisible: false,
		gweiPopupIsVisibile: false,
		depotPopupIsVisible: false,
		synthSearch: '',
	},
	persistedState
);
const reducer = (state = defaultState, action = {}) => {
	switch (action.type) {
		case CHANGE_SCREEN:
			return {
				...state,
				currentScreen: action.payload,
				walletPopupIsVisible: false,
			};
		case TOGGLE_WALLET_POPUP:
			return {
				...state,
				walletPopupIsVisible: action.payload,
			};
		case TOGGLE_GWEI_POPUP:
			return {
				...state,
				gweiPopupIsVisible: action.payload,
			};
		case TOGGLE_DEPOT_POPUP:
			return {
				...state,
				depotPopupIsVisible: action.payload,
			};
		case TOGGLE_THEME: {
			const theme = state.theme === 'light' ? 'dark' : 'light';
			persistState('ui', { theme });
			return {
				...state,
				theme,
			};
		}
		case SET_SYNTH_SEARCH: {
			return {
				...state,
				synthSearch: action.payload,
			};
		}
		default:
			return state;
	}
};

export const changeScreen = screen => {
	return { type: CHANGE_SCREEN, payload: screen };
};

export const toggleWalletPopup = isVisible => {
	return { type: TOGGLE_WALLET_POPUP, payload: isVisible };
};

export const toggleGweiPopup = isVisible => {
	return { type: TOGGLE_GWEI_POPUP, payload: isVisible };
};

export const toggleTheme = () => {
	return { type: TOGGLE_THEME };
};

export const setSynthSearch = search => {
	return { type: SET_SYNTH_SEARCH, payload: search };
};

export default reducer;
