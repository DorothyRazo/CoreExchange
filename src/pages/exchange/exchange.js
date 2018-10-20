import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Header from '../../components/header';
import Container from '../../components/container';
import BalanceChecker from '../../components/balance-checker';
import WalletConnector from '../../components/wallet-connector';
import LoadingScreen from '../../components/loading-screen';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import RateList from '../../components/rate-list';
import WalletSelectorPopup from '../../components/wallet-selector-popup';
import TransactionStatusPopup from '../../components/transaction-status-popup';
import TestnetPopup from '../../components/testnet-popup';
import DepotPopup from '../../components/depot-popup';
import FeedbackPopup from '../../components/feedback-popup';
import WalkthroughPopup from '../../components/walkthrough-popup';
import TradingWidget from '../../components/trading-widget';

import {
  walletSelectorPopupIsVisible,
  transactionStatusPopupIsVisible,
  testnetPopupIsVisible,
  depotPopupIsVisible,
  feedbackPopupIsVisible,
  walkthroughPopupIsVisible,
  loadingScreenIsVisible,
  getCurrentWalletInfo,
  getAvailableSynths,
  getSynthToExchange,
  getSynthToBuy,
} from '../../ducks/';
import { setAvailableSynths } from '../../ducks/synths';

import { CURRENCY_TABLE } from '../../synthsList';

import styles from './exchange.module.scss';

class Exchange extends Component {
  renderWalletConnectorOrTradingWidget() {
    const { currentWalletInfo } = this.props;
    return currentWalletInfo && currentWalletInfo.selectedWallet ? (
      <TradingWidget />
    ) : (
      <WalletConnector />
    );
  }

  getSymbol() {
    const { synthToBuy, synthToExchange } = this.props;
    if (
      synthToBuy == 'sXAU' ||
      synthToBuy === 'sBTC' ||
      synthToBuy === 'sXAG'
    ) {
      return CURRENCY_TABLE[synthToBuy] + CURRENCY_TABLE[synthToExchange];
    } else return CURRENCY_TABLE[synthToExchange] + CURRENCY_TABLE[synthToBuy];
  }

  render() {
    const {
      walletSelectorPopupIsVisible,
      transactionStatusPopupIsVisible,
      loadingScreenIsVisible,
      testnetPopupIsVisible,
      depotPopupIsVisible,
      feedbackPopupIsVisible,
      walkthroughPopupIsVisible,
    } = this.props;
    const symbol = this.getSymbol();
    return (
      <div className={styles.exchange}>
        <div className={styles.exchangeInner}>
          <Header />
          <div className={styles.exchangeLayout}>
            <div
              className={`${styles.exchangeLayoutColumn} ${
                styles.exchangeLayoutColumnSmall
              }`}
            >
              <Container fullHeight={true}>
                <BalanceChecker />
              </Container>
              <Container>
                {this.renderWalletConnectorOrTradingWidget()}
              </Container>
            </div>
            <div className={styles.exchangeLayoutColumn}>
              <Container>
                <div className={styles.chartWrapper}>
                  <div className={styles.mask} />
                  <TradingViewWidget
                    symbol={symbol}
                    theme={Themes.DARK}
                    autosize
                    allow_symbol_change={false}
                    hide_legend={false}
                    save_image={false}
                  />
                </div>
                <RateList />
              </Container>
            </div>
          </div>
        </div>
        <WalletSelectorPopup isVisible={walletSelectorPopupIsVisible} />
        <TransactionStatusPopup isVisible={transactionStatusPopupIsVisible} />
        <TestnetPopup isVisible={testnetPopupIsVisible} />
        <DepotPopup isVisible={depotPopupIsVisible} />
        <FeedbackPopup isVisible={feedbackPopupIsVisible} />
        <LoadingScreen isVisible={loadingScreenIsVisible} />
        {walkthroughPopupIsVisible ? (
          <WalkthroughPopup isVisible={walkthroughPopupIsVisible} />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    walletSelectorPopupIsVisible: walletSelectorPopupIsVisible(state),
    transactionStatusPopupIsVisible: transactionStatusPopupIsVisible(state),
    testnetPopupIsVisible: testnetPopupIsVisible(state),
    depotPopupIsVisible: depotPopupIsVisible(state),
    feedbackPopupIsVisible: feedbackPopupIsVisible(state),
    walkthroughPopupIsVisible: walkthroughPopupIsVisible(state),
    loadingScreenIsVisible: loadingScreenIsVisible(state),
    currentWalletInfo: getCurrentWalletInfo(state),
    availableSynths: getAvailableSynths(state),
    synthToBuy: getSynthToBuy(state),
    synthToExchange: getSynthToExchange(state),
  };
};

const mapDispatchToProps = {
  setAvailableSynths,
};

Exchange.propTypes = {
  walletSelectorPopupIsVisible: PropTypes.bool.isRequired,
  transactionStatusPopupIsVisible: PropTypes.bool.isRequired,
  testnetPopupIsVisible: PropTypes.bool.isRequired,
  depotPopupIsVisible: PropTypes.bool.isRequired,
  feedbackPopupIsVisible: PropTypes.bool.isRequired,
  walkthroughPopupIsVisible: PropTypes.bool.isRequired,
  loadingScreenIsVisible: PropTypes.bool.isRequired,
  currentWalletInfo: PropTypes.object.isRequired,
  setAvailableSynths: PropTypes.func.isRequired,
  availableSynths: PropTypes.array.isRequired,
  synthToBuy: PropTypes.string,
  synthToExchange: PropTypes.string,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Exchange);
