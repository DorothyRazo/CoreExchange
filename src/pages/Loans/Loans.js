import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { CenteredPageLayout, SectionVerticalSpacer } from '../../shared/commonStyles';

import CreateLoanCard from './components/LoanCards/CreateLoanCard/CreateLoanCard';
import CreateLoanCardsUSD from './components/LoanCards/CreateLoanCard/CreateLoanCardsUSD';

import CloseLoanCard from './components/LoanCards/CloseLoanCard';

import Dashboard from './components/Dashboard';
import MyLoans from './components/MyLoans';

import Spinner from '../../components/Spinner';

import {
	fetchLoansContractInfo,
	getContractType,
	getLoansCollateralPair,
} from '../../ducks/loans/contractInfo';
import Actions from './components/Actions';

const Loans = ({ collateralPair, fetchLoansContractInfo, contractType }) => {
	const [selectedLoan, setSelectedLoan] = useState(null);

	const handleSelectLoan = (loanInfo) => setSelectedLoan(loanInfo);

	const clearSelectedLoan = () => {
		setSelectedLoan(null);
	};

	useEffect(() => {
		fetchLoansContractInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contractType]);

	if (collateralPair == null) {
		return <Spinner centered={true} size="sm" />;
	}

	return (
		<CenteredPageLayout>
			<OverviewContainer>
				<Dashboard collateralPair={collateralPair} />
				<SectionVerticalSpacer />
				<MyLoans
					onSelectLoan={handleSelectLoan}
					selectedLoan={selectedLoan}
					collateralPair={collateralPair}
				/>
			</OverviewContainer>
			<LoanCardsContainer>
				{contractType === 'sETH' ? (
					<CreateLoanCard collateralPair={collateralPair} />
				) : (
					<CreateLoanCardsUSD collateralPair={collateralPair} />
				)}
				<SectionVerticalSpacer />
				{contractType === 'sETH' ? (
					<CloseLoanCard
						collateralPair={collateralPair}
						isInteractive={selectedLoan != null}
						selectedLoan={selectedLoan}
						onLoanClosed={clearSelectedLoan}
					/>
				) : (
					<Actions />
				)}
			</LoanCardsContainer>
		</CenteredPageLayout>
	);
};

Loans.propTypes = {
	updateLoan: PropTypes.func,
	fetchLoansContractInfo: PropTypes.func,
	collateralPair: PropTypes.object,
	contractType: PropTypes.string,
};

const OverviewContainer = styled.div`
	flex: 1;
	overflow-x: auto;
	display: flex;
	flex-direction: column;
`;

const LoanCardsContainer = styled.div`
	min-width: 389px;
	max-width: 400px;
`;

const mapStateToProps = (state) => ({
	collateralPair: getLoansCollateralPair(state),
	contractType: getContractType(state),
});

const mapDispatchToProps = {
	fetchLoansContractInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(Loans);
