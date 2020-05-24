import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { connect } from 'react-redux';
import Card from 'components/Card';
import { ButtonPrimary } from 'components/Button';
import { TxErrorMessage } from '../LoanCards/commonStyles';
import { HeadingSmall } from 'components/Typography';
import { getEthRate } from 'ducks/rates';
import { getWalletInfo } from 'ducks/wallet/walletDetails';
import { useTranslation, Trans } from 'react-i18next';
import {
	InfoBox,
	InfoBoxLabel,
	InfoBoxValue,
	FormInputLabel,
	FormInputLabelSmall,
	CurrencyKey,
} from 'shared/commonStyles';
import NetworkInfo from 'components/NetworkInfo';
import { getLoansCollateralPair } from 'ducks/loans/contractInfo';
import { getGasInfo } from 'ducks/transaction';
import NumericInputWithCurrency from 'components/Input/NumericInputWithCurrency';
import { getCurrencyKeyBalance } from 'utils/balances';
import snxJSConnector from 'utils/snxJSConnector';
import { GWEI_UNIT } from 'utils/networkUtils';
import { normalizeGasLimit } from 'utils/transactions';

const LiquidateCard = ({
	collateralPair,
	walletInfo: { currentWallet },
	walletBalance,
	gasInfo,
	ethRate,
	selectedLiquidation,
}) => {
	const { t } = useTranslation();
	const [liquidateAmount, setLiquidateAmount] = useState('');
	const [liquidateAmountErrorMessage, setLiquidateAmountErrorMessage] = useState(null);
	const { collateralCurrencyKey, loanCurrencyKey } = collateralPair;
	const loanCurrencyBalance = getCurrencyKeyBalance(walletBalance, loanCurrencyKey);
	const [gasLimit, setLocalGasLimit] = useState(gasInfo.gasLimit);
	const [txErrorMessage, setTxErrorMessage] = useState(null);

	// let collateralAmount = null;
	let loanAmount = null;
	let currentInterest = null;
	let loanID = null;
	let minimumAmountToClose = null;

	if (selectedLiquidation != null) {
		// collateralAmount = selectedLiquidation.collateralAmount;
		loanAmount = selectedLiquidation.loanAmount;
		currentInterest = selectedLiquidation.currentInterest;
		loanID = selectedLiquidation.id;
		minimumAmountToClose = loanAmount + currentInterest;
	}

	const handleSubmit = async () => {
		const {
			snxJS: { EtherCollateralsUSD },
		} = snxJSConnector;

		setTxErrorMessage(null);

		try {
			const loanIDStr = loanID.toString();

			const gasEstimate = await EtherCollateralsUSD.estimate.liquidateLoan(loanIDStr);
			const updatedGasEstimate = normalizeGasLimit(Number(gasEstimate));
			setLocalGasLimit(updatedGasEstimate);

			await EtherCollateralsUSD.closeLoan(loanIDStr, {
				gasPrice: gasInfo.gasPrice * GWEI_UNIT,
				gasLimit: updatedGasEstimate,
			});

			// updateLoan({
			// 	loanID,
			// 	loanInfo: {
			// 		status: LOAN_STATUS.CLOSING,
			// 	},
			// });
			// onLoanLiquidated();
		} catch (e) {
			setTxErrorMessage(t('common.errors.unknown-error-try-again'));
		}
	};

	useEffect(() => {
		setLiquidateAmountErrorMessage(null);
		if (liquidateAmount !== '') {
			if (currentWallet && liquidateAmount > loanCurrencyBalance) {
				setLiquidateAmountErrorMessage(t('common.errors.amount-exceeds-balance'));
			}
		}
	}, [liquidateAmount, t, currentWallet, loanCurrencyBalance]);

	return (
		<StyledCard isInteractive={selectedLiquidation}>
			<Card.Header>
				<HeadingSmall>{t('loans.liquidations.card.title')}</HeadingSmall>
			</Card.Header>
			<Card.Body>
				<LoanInfoContainer>
					<NumericInputWithCurrency
						currencyKey={loanCurrencyKey}
						value={`${liquidateAmount}`}
						label={
							<>
								<FormInputLabel>
									<Trans
										i18nKey="loans.liquidations.card.amount"
										values={{ currencyKey: loanCurrencyKey }}
										components={[<CurrencyKey />]}
									/>
								</FormInputLabel>
								<FormInputLabelSmall>
									{t('loans.liquidations.card.total', {
										debtAmount: loanCurrencyBalance,
									})}
								</FormInputLabelSmall>
							</>
						}
						onChange={(_, val) => {
							setLiquidateAmount(val);
						}}
						errorMessage={liquidateAmountErrorMessage}
					/>
					<InfoBox>
						<InfoBoxLabel>
							<Trans i18nKey="loans.liquidations.card.receive" components={[<CurrencyKey />]} />
						</InfoBoxLabel>
						<InfoBoxValue>{`${minimumAmountToClose} ${collateralCurrencyKey}`}</InfoBoxValue>
					</InfoBox>
					<InfoBox>
						<InfoBoxLabel>
							<Trans i18nKey="loans.liquidations.card.bonus" components={[<CurrencyKey />]} />
						</InfoBoxLabel>
						<InfoBoxValue>{`${minimumAmountToClose} ${collateralCurrencyKey}`}</InfoBoxValue>
					</InfoBox>
				</LoanInfoContainer>
				<NetworkInfo gasPrice={gasInfo.gasPrice} gasLimit={gasLimit} ethRate={ethRate} />
				<ButtonPrimary onClick={handleSubmit} disabled={!selectedLiquidation || !currentWallet}>
					{t('common.actions.confirm')}
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
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	${(props) =>
		!props.isInteractive &&
		css`
			opacity: 0.3;
			pointer-events: none;
		`}
`;

const LoanInfoContainer = styled.div`
	display: grid;
	grid-row-gap: 15px;
`;

const mapStateToProps = (state) => ({
	collateralPair: getLoansCollateralPair(state),
	walletInfo: getWalletInfo(state),
	gasInfo: getGasInfo(state),
	ethRate: getEthRate(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(LiquidateCard);
