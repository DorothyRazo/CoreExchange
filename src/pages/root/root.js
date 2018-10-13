import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Exchange from '../exchange';
import ConnectToWallet from '../connect-to-wallet';

import Overlay from '../../components/overlay';

import {
  getCurrentScreen,
  getAvailableSynths,
  transactionStatusPopupIsVisible,
  depotPopupIsVisible,
  testnetPopupIsVisible,
  loadingScreenIsVisible,
  walletSelectorPopupIsVisible,
} from '../../ducks/';
import { updateExchangeRates } from '../../ducks/synths';
import { toggleLoadingScreen } from '../../ducks/ui';
import { connectToWallet } from '../../ducks/wallet';
import { getEthereumNetwork } from '../../utils/metamaskTools';
import synthetixJsTools from '../../synthetixJsTool';

import styles from './root.module.scss';

class Root extends Component {
  constructor() {
    super();
    this.updatePrices = this.updatePrices.bind(this);
  }

  async updatePrices() {
    const {
      availableSynths,
      updateExchangeRates,
      toggleLoadingScreen,
    } = this.props;
    if (!availableSynths) return;
    let formattedSynthRates = {};
    const [synthRates, ethRate] = await Promise.all([
      synthetixJsTools.havvenJs.ExchangeRates.ratesForCurrencies(
        availableSynths.map(synth => synthetixJsTools.utils.toUtf8Bytes(synth))
      ),
      synthetixJsTools.havvenJs.Depot.usdToEthPrice(),
    ]);
    synthRates.forEach((rate, i) => {
      formattedSynthRates[availableSynths[i]] = Number(
        synthetixJsTools.havvenJs.utils.formatEther(rate)
      );
    });
    const formattedEthRate = synthetixJsTools.havvenJs.utils.formatEther(
      ethRate
    );
    updateExchangeRates(formattedSynthRates, formattedEthRate);
    toggleLoadingScreen(false);
  }

  async componentDidMount() {
    const { toggleLoadingScreen, connectToWallet } = this.props;
    toggleLoadingScreen(true);
    this.updatePrices();
    setInterval(this.updatePrices, 60 * 1000);
    const { networkId } = await getEthereumNetwork();
    connectToWallet({
      networkId,
    });
  }

  componentWillMount() {
    synthetixJsTools.setContractSettings();
  }

  renderScreen() {
    const { currentScreen } = this.props;
    switch (currentScreen) {
      case 'exchange':
        return <Exchange />;
      case 'connectToWallet':
        return <ConnectToWallet />;
      default:
        return <Exchange />;
    }
  }

  hasOpenPopup() {
    const {
      transactionStatusPopupIsVisible,
      depotPopupIsVisible,
      testnetPopupIsVisible,
      loadingScreenIsVisible,
      walletSelectorPopupIsVisible,
    } = this.props;
    return (
      transactionStatusPopupIsVisible ||
      depotPopupIsVisible ||
      testnetPopupIsVisible ||
      loadingScreenIsVisible ||
      walletSelectorPopupIsVisible
    );
  }
  render() {
    const overlayIsVisible = this.hasOpenPopup();
    return (
      <div className={styles.root}>
        <Overlay isVisible={overlayIsVisible} />
        {this.renderScreen()}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentScreen: getCurrentScreen(state),
    availableSynths: getAvailableSynths(state),
    transactionStatusPopupIsVisible: transactionStatusPopupIsVisible(state),
    depotPopupIsVisible: depotPopupIsVisible(state),
    testnetPopupIsVisible: testnetPopupIsVisible(state),
    loadingScreenIsVisible: loadingScreenIsVisible(state),
    walletSelectorPopupIsVisible: walletSelectorPopupIsVisible(state),
  };
};

const mapDispatchToProps = {
  updateExchangeRates,
  toggleLoadingScreen,
  connectToWallet,
};

Root.propTypes = {
  currentScreen: PropTypes.string.isRequired,
  availableSynths: PropTypes.array.isRequired,
  toggleLoadingScreen: PropTypes.func.isRequired,
  connectToWallet: PropTypes.func.isRequired,
  transactionStatusPopupIsVisible: PropTypes.bool.isRequired,
  depotPopupIsVisible: PropTypes.bool.isRequired,
  testnetPopupIsVisible: PropTypes.bool.isRequired,
  loadingScreenIsVisible: PropTypes.bool.isRequired,
  walletSelectorPopupIsVisible: PropTypes.bool.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Root);
