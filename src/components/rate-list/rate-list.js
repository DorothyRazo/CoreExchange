import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import numbro from 'numbro';

import { getAvailableSynths } from '../../ducks/';

import { setSynthToBuy } from '../../ducks/synths';
import {
  getSynthToExchange,
  getSynthToBuy,
  getExchangeRates,
} from '../../ducks';

import styles from './rate-list.module.scss';

class RateList extends Component {
  constructor() {
    super();
    this.selectSynthToBuy = this.selectSynthToBuy.bind(this);
  }

  selectSynthToBuy(currency) {
    return () => {
      const { setSynthToBuy, synthToBuy } = this.props;
      if (currency === synthToBuy) return;
      setSynthToBuy(currency);
    };
  }

  renderTableBody() {
    const {
      exchangeRates,
      synthToExchange,
      synthToBuy,
      availableSynths,
    } = this.props;
    if (!exchangeRates) return;

    const filteredSynths = availableSynths.filter(synth => {
      return synth.name !== synthToExchange.name && synth.name !== 'XDR';
    });

    return filteredSynths.map((synth, i) => {
      // Small fix to avoid price like 0.0000 when sKRW/sJPY against sXAU
      const precision =
        synth.name === 'sXAU' &&
        (synthToExchange.name === 'sKRW' || synthToExchange.name === 'sJPY')
          ? '0,0.00000000'
          : '0,0.00000';
      const rates = exchangeRates[synth.name];
      return (
        <tr
          key={i}
          className={
            synthToBuy && synthToBuy.name === synth.name
              ? styles.tableRowActive
              : ''
          }
          onClick={this.selectSynthToBuy(synth)}
        >
          <td className={styles.tableBodySynth}>
            <span>
              {synthToExchange.name}/{synth.name}
            </span>
          </td>
          <td className={styles.rate}>
            {synthToExchange.sign}
            {numbro(rates[synthToExchange.name]).format(precision)}
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div className={styles.rateList}>
        <table cellSpacing="0" className={styles.rateListTable}>
          <thead>
            <tr>
              <th>
                <h3>Pair</h3>
              </th>
              <th className={styles.rate}>
                <h3>Last Price</h3>
              </th>
            </tr>
          </thead>
          <tbody>{this.renderTableBody()}</tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    availableSynths: getAvailableSynths(state),
    synthToExchange: getSynthToExchange(state),
    synthToBuy: getSynthToBuy(state),
    exchangeRates: getExchangeRates(state),
  };
};

const mapDispatchToProps = {
  setSynthToBuy,
};

RateList.propTypes = {
  availableSynths: PropTypes.array.isRequired,
  synthToExchange: PropTypes.object,
  synthToBuy: PropTypes.object,
  setSynthToBuy: PropTypes.func.isRequired,
  exchangeRates: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RateList);
