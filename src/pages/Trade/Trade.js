import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { getAvailableSynths } from '../../ducks';

import Header from '../../components/Header';
import PairList from '../../components/PairList';
import ChartPanel from '../../components/ChartPanel';
import OrderBook from '../../components/OrderBook';
import TradeBox from '../../components/TradeBox';
import WalletBox from '../../components/WalletBox';

import WalletPopup from '../../components/WalletPopup';

const Trade = () => {
	return (
		<MainLayout>
			<WalletPopup />
			<Header />
			<TradeLayout>
				<Container>
					<BoxContainer>
						<PairList />
					</BoxContainer>
				</Container>
				<CentralContainer>
					<BoxContainer margin="0 0 8px 0">
						<ChartPanel />
					</BoxContainer>
					<BoxContainer style={{ flex: 1 }}>
						<OrderBook />
					</BoxContainer>
				</CentralContainer>
				<SmallContainer>
					<BoxContainer margin="0 0 8px 0">
						<TradeBox />
					</BoxContainer>
					<BoxContainer style={{ flex: 1 }}>
						<WalletBox />
					</BoxContainer>
				</SmallContainer>
			</TradeLayout>
		</MainLayout>
	);
};

const mapStateToProps = state => {
	return {
		synths: getAvailableSynths(state),
	};
};

const MainLayout = styled.div`
	display: flex;
	flex-flow: column;
	width: 100%;
	height: 100%;
	color: white;
	position: relative;
`;

const TradeLayout = styled.div`
	display: flex;
	width: 100%;
	flex: 1;
`;

const Container = styled.div`
	width: 25%;
	min-width: 300px;
	max-width: 400px;
	display: flex;
	flex-direction: column;
	margin: 8px;
`;

const SmallContainer = styled(Container)`
	width: 15%;
	min-width: 300px;
`;

const CentralContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	margin: 8px 0;
`;

const BoxContainer = styled.div`
	margin: ${props => (props.margin ? props.margin : '0')}
	height: ${props => (props.height ? props.height : 'auto')};
`;

export default connect(mapStateToProps, null)(Trade);
