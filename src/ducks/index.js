import { combineReducers } from 'redux';
import ui from './ui';
import wallet from './wallet';
import synths from './synths';

export default combineReducers({
  wallet,
  ui,
  synths,
});

// UI REDUCERS
export const getCurrentScreen = state => {
  return state.ui.currentScreen;
};

export const getCurrentExchangeMode = () => {
  // return state.ui.exchangeMode;
  return 'appDown';
};

export const walletSelectorPopupIsVisible = state => {
  return state.ui.walletSelectorPopupIsVisible;
};

export const transactionStatusPopupIsVisible = state => {
  return state.ui.transactionStatusPopupIsVisible;
};

export const testnetPopupIsVisible = state => {
  return state.ui.testnetPopupIsVisible;
};

export const depotPopupIsVisible = state => {
  return state.ui.depotPopupIsVisible;
};

export const feedbackPopupIsVisible = state => {
  return state.ui.feedbackPopupIsVisible;
};

export const walkthroughPopupIsVisible = state => {
  return state.ui.walkthroughPopupIsVisible;
};

export const loadingScreenIsVisible = state => {
  return state.ui.loadingScreenIsVisible;
};

// WALLET REDUCERS
export const getCurrentWalletInfo = state => {
  return state.wallet;
};

export const getTransactionSettings = state => {
  return {
    transactionSpeed: state.wallet.transactionSpeed,
    gasAndSpeedInfo: state.wallet.gasAndSpeedInfo,
  };
};

export const getExchangeFeeRate = state => {
  return state.wallet.exchangeFeeRate;
};

// SYNTHS REDUCERS
export const getAvailableSynths = state => {
  return state.synths.availableSynths;
};

export const getSynthToBuy = state => {
  return state.synths.toSynth;
};

export const getSynthToExchange = state => {
  return state.synths.fromSynth;
};

export const getExchangeRates = state => {
  return state.synths.exchangeRates;
};

export const getEthRate = state => {
  return state.synths.ethRate;
};

export const getFrozenSynths = state => {
  return state.synths.frozenSynths;
};
