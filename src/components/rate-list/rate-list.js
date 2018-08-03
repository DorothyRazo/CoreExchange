import React, { Component } from 'react';
import styles from './rate-list.module.scss';

class RateList extends Component {
  render() {
    const currencies = ['sEUR', 'sAUD', 'sJPY', 'sKRW', 'sXAU'];
    return (
      <div className={styles.rateList}>
        <table>
          <thead>
            <tr>
              <th>Current Rate</th>
              <th>Rate</th>
              <th>Low</th>
              <th>High</th>
              <th>Volume(sUSD)</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency, i) => {
              return (
                <tr key={i}>
                  <td>{currency}</td>
                  <td>--</td>
                  <td>--</td>
                  <td>--</td>
                  <td>--</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default RateList;
