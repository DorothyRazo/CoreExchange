import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  getCurrentWalletInfo,
  getSynthToBuy,
  getSynthToExchange,
  getExchangeRates,
} from '../../ducks/';
import { toggleTransactionStatusPopup } from '../../ducks/ui';
import {
  setTransactionStatusToConfirm,
  setTransactionStatusToProgress,
  setTransactionStatusToSuccess,
  setTransactionStatusToCleared,
  setTransactionPair,
} from '../../ducks/wallet';

import synthetixJsTools from '../../synthetixJsTool';

import styles from './trading-widget.module.scss';

class TradingWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValues: {},
    };
    this.onFromSynthChange = this.onFromSynthChange.bind(this);
    this.onToSynthChange = this.onToSynthChange.bind(this);
    this.tradeMax = this.tradeMax.bind(this);
    this.confirmTrade = this.confirmTrade.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { synthToBuy, synthToExchange } = this.props;
    if (prevProps.synthToBuy !== synthToBuy) {
      const synthToBuyValue = this.state.inputValues[prevProps.synthToBuy];
      this.setState(
        {
          inputValues: {
            ...this.state.inputValues,
            [synthToBuy]: synthToBuyValue,
          },
        },
        this.onFromSynthChange
      );
    }

    if (prevProps.synthToExchange !== synthToExchange) {
      this.setState({
        inputValues: { [synthToExchange]: 0, [synthToBuy]: 0 },
      });
    }
  }

  tradeMax() {
    const {
      currentWalletInfo,
      synthToExchange,
      synthToBuy,
      exchangeRates,
    } = this.props;
    const { balances } = currentWalletInfo;
    const synthToExchangeBalance = balances[synthToExchange];
    const conversionToMax = this.convert(
      synthToBuy,
      synthToExchangeBalance,
      exchangeRates[synthToExchange]
    );
    this.setState({
      inputValues: {
        [synthToExchange]: synthToExchangeBalance,
        [synthToBuy]: conversionToMax,
      },
    });
  }

  async confirmTrade() {
    const {
      synthToExchange,
      synthToBuy,
      currentWalletInfo,
      toggleTransactionStatusPopup,
      setTransactionStatusToConfirm,
      setTransactionStatusToProgress,
      setTransactionStatusToSuccess,
      setTransactionStatusToCleared,
      setTransactionPair,
    } = this.props;
    const { inputValues } = this.state;
    const { selectedWallet } = currentWalletInfo;
    let transactionResult;
    if (
      !synthetixJsTools.initialized ||
      !currentWalletInfo ||
      !currentWalletInfo.selectedWallet
    )
      return;

    const fromAmount = inputValues[synthToExchange];
    const toAmount = inputValues[synthToBuy];

    try {
      toggleTransactionStatusPopup(true);
      setTransactionStatusToConfirm();
      setTransactionPair({
        fromSynth: synthToExchange,
        toSynth: synthToBuy,
        fromAmount,
        toAmount,
      });
      transactionResult = await synthetixJsTools.havvenJs.Synthetix.exchange(
        synthetixJsTools.utils.toUtf8Bytes(synthToExchange),
        synthetixJsTools.utils.parseEther(fromAmount),
        synthetixJsTools.utils.toUtf8Bytes(synthToBuy),
        selectedWallet
      );
    } catch (e) {
      console.log('Error during exchange', e);
    }
    if (transactionResult) {
      const hash = transactionResult.hash || transactionResult;
      setTransactionStatusToProgress(hash);
      try {
        await synthetixJsTools.util.waitForTransaction(hash);
        setTransactionStatusToSuccess();
        setTimeout(() => {
          toggleTransactionStatusPopup(false);
          setTransactionStatusToCleared();
        }, 2000);
      } catch (e) {
        console.log('Could not get transaction confirmation', e);
      }
    }
  }

  convert(to, value, rates) {
    const toRate = rates.find(rate => rate.synth === to);
    return value * toRate.rate;
  }

  onFromSynthChange(e) {
    const { exchangeRates, synthToExchange, synthToBuy } = this.props;

    const { inputValues } = this.state;
    const currentInputValue = inputValues[synthToExchange] || 0;
    const newInputValue =
      e && e.target.validity.valid ? e.target.value : currentInputValue;

    const convertedInputValue = this.convert(
      synthToBuy,
      Number(newInputValue),
      exchangeRates[synthToExchange]
    );

    this.setState({
      inputValues: {
        [synthToExchange]: newInputValue,
        [synthToBuy]: convertedInputValue,
      },
    });
  }

  onToSynthChange(e) {
    const { exchangeRates, synthToExchange, synthToBuy } = this.props;
    const { inputValues } = this.state;
    const currentInputValue = inputValues[synthToBuy] || 0;
    const newInputValue =
      e && e.target.validity.valid ? e.target.value : currentInputValue;

    const convertedInputValue = this.convert(
      synthToExchange,
      Number(newInputValue),
      exchangeRates[synthToBuy]
    );

    this.setState({
      inputValues: {
        [synthToExchange]: convertedInputValue,
        [synthToBuy]: newInputValue,
      },
    });
  }

  renderInput(synth, handler) {
    const { inputValues } = this.state;
    return (
      <div className={styles.widgetInputWrapper}>
        <input
          className={styles.widgetInputElement}
          type="text"
          value={(inputValues && inputValues[synth]) || ''}
          placeholder={0}
          onChange={handler}
          pattern="^-?[0-9]\d*\.?\d*$"
        />
        <div className={styles.widgetInputSynth}>
          <img src={`images/synths/${synth}-icon.svg`} alt="synth icon" />
          <span>{synth}</span>
        </div>
      </div>
    );
  }

  renderInputs() {
    const { synthToBuy, synthToExchange } = this.props;
    return (
      <div className={styles.widgetInputs}>
        {this.renderInput(synthToExchange, this.onFromSynthChange)}
        {this.renderInput(synthToBuy, this.onToSynthChange)}
      </div>
    );
  }
  render() {
    const { synthToBuy, synthToExchange } = this.props;
    const { inputValues } = this.state;
    const buttonIsEnabled =
      inputValues[synthToBuy] && inputValues[synthToExchange];
    return (
      <div>
        <div className={styles.widgetHeader}>
          <h2>Trade</h2>
          <button onClick={this.tradeMax} className={styles.widgetHeaderButton}>
            Trade Max
          </button>
        </div>
        {this.renderInputs()}
        <button
          disabled={!buttonIsEnabled}
          onClick={this.confirmTrade}
          className={styles.widgetTradingButton}
        >
          Confirm Trade
        </button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentWalletInfo: getCurrentWalletInfo(state),
    synthToBuy: getSynthToBuy(state),
    synthToExchange: getSynthToExchange(state),
    exchangeRates: getExchangeRates(state),
  };
};

const mapDispatchToProps = {
  toggleTransactionStatusPopup,
  setTransactionStatusToConfirm,
  setTransactionStatusToProgress,
  setTransactionStatusToSuccess,
  setTransactionStatusToCleared,
  setTransactionPair,
};

TradingWidget.propTypes = {
  currentWalletInfo: PropTypes.object.isRequired,
  synthToBuy: PropTypes.string,
  synthToExchange: PropTypes.string.isRequired,
  exchangeRates: PropTypes.object.isRequired,
  toggleTransactionStatusPopup: PropTypes.func.isRequired,
  setTransactionStatusToConfirm: PropTypes.func.isRequired,
  setTransactionStatusToProgress: PropTypes.func.isRequired,
  setTransactionStatusToSuccess: PropTypes.func.isRequired,
  setTransactionStatusToCleared: PropTypes.func.isRequired,
  setTransactionPair: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TradingWidget);
