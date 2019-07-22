import React from 'react';
import styled, { withTheme } from 'styled-components';

import { HeadingSmall, DataMedium, DataSmall } from '../Typography';
import { ButtonFilter, ButtonPrimary } from '../Button';
import { TradeInput } from '../Input';

const TradeBox = ({ theme: { colors } }) => {
	return (
		<Container>
			<Header>
				<HeadingSmall>sBTC/sETH</HeadingSmall>
				<ButtonFilter height={'22px'}>
					<ButtonIcon src={'/images/reverse-arrow.svg'}></ButtonIcon>
				</ButtonFilter>
			</Header>
			<Body>
				<InputBlock>
					<InputInfo>
						<DataMedium color={colors.fontSecondary} fontFamily={'apercu-medium'}>
							Sell:
						</DataMedium>
						<Balance>Balance: 0.14 sETH</Balance>
					</InputInfo>
					<TradeInput></TradeInput>
				</InputBlock>
				<InputBlock>
					<InputInfo>
						<DataMedium color={colors.fontSecondary} fontFamily={'apercu-medium'}>
							Buy:
						</DataMedium>
						<Balance>Balance: 0.14 sETH</Balance>
					</InputInfo>
					<TradeInput></TradeInput>
				</InputBlock>
				<ButtonRow>
					{['25', '50', '75', '100'].map(amount => {
						return (
							<ButtonAmount>
								<DataSmall color={colors.fontTertiary}>{amount}%</DataSmall>
							</ButtonAmount>
						);
					})}
				</ButtonRow>
				<NetworkInfo>
					{['Price', '$USD Value', 'Volume', 'Fee', 'Gas'].map(data => {
						return (
							<NetworkDataRow>
								<NetworkData>{data}</NetworkData>
								<NetworkData>$100,000,000</NetworkData>
							</NetworkDataRow>
						);
					})}
				</NetworkInfo>
				<ButtonPrimary>Confirm Trade</ButtonPrimary>
			</Body>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	height: 100%;
	background-color: ${props => props.theme.colors.surfaceL2};
`;

const Header = styled.div`
	background-color: ${props => props.theme.colors.surfaceL3};
	width: 100%;
	height: 54px;
	display: flex;
	align-items: center;
	padding: 0 18px;
	justify-content: flex-start;
	& > button {
		margin-left: 12px;
	}
`;

const ButtonIcon = styled.img`
	width: 16px;
	height: 12px;
`;

const Body = styled.div`
	padding: 0 12px 18px 12px;
`;

const InputBlock = styled.div`
	width: 100%;
	margin-top: 24px;
`;

const InputInfo = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
`;

const Balance = styled(DataSmall)`
	text-transform: none;
	color: ${props => props.theme.colors.fontTertiary};
	font-family: 'apercu-light';
`;

const ButtonRow = styled.div`
	display: flex;
	margin: 24px 0;
	& > :first-child {
		margin-left: 0;
	}
	& > :last-child {
		margin-right: 0;
	}
`;

const ButtonAmount = styled.button`
	border-radius: 1px;
	cursor: pointer;
	flex: 1;
	margin: 0 8px;
	border: none;
	background-color: ${props => props.theme.colors.accentLight};
	height: 32px;
`;

const NetworkInfo = styled.div`
	margin: 32px 0;
`;

const NetworkDataRow = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 18px;
`;

const NetworkData = styled(DataSmall)`
	color: ${props => props.theme.colors.fontTertiary};
`;
export default withTheme(TradeBox);
