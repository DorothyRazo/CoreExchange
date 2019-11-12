import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import snxJSConnector from 'src/utils/snxJSConnector';
import { GWEI_UNIT } from 'src/utils/networkUtils';
import { normalizeGasLimit } from 'src/utils/transactions';
import { getCurrencyKeyBalance } from 'src/utils/balances';

import { EMPTY_VALUE } from 'src/constants/placeholder';

import { ButtonPrimary } from 'src/components/Button';
import Card from 'src/components/Card';
import { TradeInput } from 'src/components/Input';
import { HeadingSmall } from 'src/components/Typography';
import { getGasInfo } from 'src/ducks/transaction';
import { getWalletInfo } from 'src/ducks/wallet/walletDetails';
import { createLoan, LOAN_STATUS } from 'src/ducks/loans/myLoans';
import { getEthRate } from 'src/ducks/rates';

import { toggleGweiPopup } from 'src/ducks/ui';

import {
	FormInputRow,
	FormInputLabel,
	FormInputLabelSmall,
	CurrencyKey,
} from 'src/shared/commonStyles';

import NetworkInfo from '../NetworkInfo';

import { TxErrorMessage } from '../commonStyles';

export const CreateLoanCard = ({
	toggleGweiPopup,
	gasInfo,
	ethRate,
	walletInfo: { balances, currentWallet },
	createLoan,
	collateralPair,
}) => {
	const { t } = useTranslation();

	const [collateralAmount, setCollateralAmount] = useState('');
	const [loanAmount, setLoanAmount] = useState('');

	const [gasLimit, setLocalGasLimit] = useState(gasInfo.gasLimit);
	const [collateralAmountErrorMessage, setCollateralAmountErrorMessage] = useState(null);
	const [txErrorMessage, setTxErrorMessage] = useState(null);

	const { collateralCurrencyKey, loanCurrencyKey, issuanceRatio, minLoanSize } = collateralPair;

	const handleSubmit = async () => {
		const {
			snxJS: { EtherCollateral },
			utils,
		} = snxJSConnector;

		setTxErrorMessage(null);

		try {
			const openLoanArgs = {
				value: utils.parseEther(collateralAmount),
				gasPrice: gasInfo.gasPrice * GWEI_UNIT,
				gasLimit,
			};

			const gasEstimate = await EtherCollateral.contract.estimate.openLoan(openLoanArgs);
			const updatedGasEstimate = normalizeGasLimit(Number(gasEstimate));

			setLocalGasLimit(updatedGasEstimate);

			const tx = await EtherCollateral.openLoan({
				...openLoanArgs,
				gasLimit: updatedGasEstimate,
			});

			createLoan({
				loan: {
					collateralAmount: Number(collateralAmount),
					loanAmount: Number(loanAmount),
					timeCreated: Date.now(),
					timeClosed: 0,
					feesPayable: 0,
					currentInterest: 0,
					status: LOAN_STATUS.WAITING,
					loanID: null,
					transactionHash: tx.hash,
				},
			});
			setCollateralAmount('');
			setLoanAmount('');
		} catch (e) {
			setTxErrorMessage(t('common.errors.unknown-error-try-again'));
		}
	};

	const showGweiPopup = () => toggleGweiPopup(true);

	const collateralCurrencyBalance = getCurrencyKeyBalance(balances, collateralCurrencyKey);
	const loanCurrencyBalance = getCurrencyKeyBalance(balances, loanCurrencyKey);

	useEffect(() => {
		setCollateralAmountErrorMessage(null);
		if (collateralAmount != '') {
			if (currentWallet && collateralAmount > collateralCurrencyBalance) {
				setCollateralAmountErrorMessage(t('common.errors.amount-exceeds-balance'));
			} else if (collateralAmount < minLoanSize) {
				setCollateralAmountErrorMessage(
					t('loans.loan-card.errors.min-loan-size', {
						currencyKey: collateralCurrencyKey,
						minLoanSize: minLoanSize,
					})
				);
			}
		}
	}, [
		collateralAmount,
		collateralCurrencyBalance,
		t,
		currentWallet,
		collateralCurrencyKey,
		loanCurrencyKey,
		minLoanSize,
	]);

	const hasError = !!collateralAmountErrorMessage;

	return (
		<Card>
			<Card.Header>
				<HeadingSmall>{t('loans.loan-card.create-loan.title')}</HeadingSmall>
			</Card.Header>
			<Card.Body>
				<FormInputRow>
					<TradeInput
						synth={collateralCurrencyKey}
						amount={`${collateralAmount}`}
						label={
							<>
								<FormInputLabel>
									<Trans
										i18nKey="loans.loan-card.create-loan.currency-locked"
										values={{ currencyKey: collateralCurrencyKey }}
										components={[<CurrencyKey />]}
									/>
								</FormInputLabel>
								<FormInputLabelSmall>
									{t('common.wallet.balance-currency', {
										balance: currentWallet ? collateralCurrencyBalance : EMPTY_VALUE,
									})}
								</FormInputLabelSmall>
							</>
						}
						onChange={(_, val) => {
							setCollateralAmount(val);
							setLoanAmount(val * issuanceRatio);
						}}
						errorMessage={collateralAmountErrorMessage}
					/>
				</FormInputRow>
				<FormInputRow>
					<TradeInput
						synth={loanCurrencyKey}
						amount={loanAmount}
						label={
							<>
								<FormInputLabel>
									<Trans
										i18nKey="loans.loan-card.create-loan.currency-borrowed"
										values={{ currencyKey: loanCurrencyKey }}
										components={[<CurrencyKey />]}
									/>
								</FormInputLabel>
								<FormInputLabelSmall>
									{t('common.wallet.balance-currency', {
										balance: currentWallet ? loanCurrencyBalance : EMPTY_VALUE,
									})}
								</FormInputLabelSmall>
							</>
						}
						onChange={(_, val) => {
							setLoanAmount(val);
							setCollateralAmount(val / issuanceRatio);
						}}
					/>
				</FormInputRow>
				<NetworkInfo
					gasPrice={gasInfo.gasPrice}
					gasLimit={gasLimit}
					ethRate={ethRate}
					onEditButtonClick={showGweiPopup}
				/>
				<ButtonPrimary
					onClick={handleSubmit}
					disabled={!collateralAmount || !loanAmount || !currentWallet || hasError}
				>
					{t('common.actions.submit')}
				</ButtonPrimary>
				{txErrorMessage && (
					<TxErrorMessage
						onDismiss={() => setTxErrorMessage(null)}
						type="error"
						size="sm"
						floating={true}
					>
						{txErrorMessage}
					</TxErrorMessage>
				)}
			</Card.Body>
		</Card>
	);
};

CreateLoanCard.propTypes = {
	toggleGweiPopup: PropTypes.func.isRequired,
	gasInfo: PropTypes.object,
	ethRate: PropTypes.number,
	walletInfo: PropTypes.object,
	collateralPair: PropTypes.object,
};

const mapStateToProps = state => ({
	gasInfo: getGasInfo(state),
	ethRate: getEthRate(state),
	walletInfo: getWalletInfo(state),
});

const mapDispatchToProps = {
	toggleGweiPopup,
	createLoan,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateLoanCard);
