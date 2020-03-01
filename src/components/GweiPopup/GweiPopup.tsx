import React, { FC, memo, useContext, useState, useEffect } from 'react';
import styled, { createGlobalStyle, ThemeContext } from 'styled-components';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { toggleGweiPopup, gweiPopupIsVisible } from 'ducks/ui';
import { getAvailableSynthsMap } from 'ducks/synths';
import { setGasPrice, getGasInfo } from 'ducks/transaction';
import { getEthRate } from 'ducks/rates';
import { RootState } from 'ducks/types';
import { SynthDefinitionMap } from 'ducks/synths';

import { formatCurrency } from 'utils/formatters';
import { getTransactionPrice } from 'utils/networkUtils';

import { Z_INDEX } from 'constants/ui';

import { ReactComponent as CloseCrossIcon } from 'assets/images/close-cross.svg';

import { FullScreenModal, FullScreenModalCloseButton } from 'shared/commonStyles';

import { DataSmall } from '../Typography';
import { headingH3CSS } from 'components/Typography/Heading';
import { bodyCSS } from '../Typography/General';
import Slider from '../Slider';

import { Table, Tr, Th, Td, Thead, Tbody, DataLabel } from '../deprecated/Table';
import { ButtonPrimary } from '../Button';

type StateProps = {
	popupIsVisible: boolean;
	gasInfo: {
		gasPrice: number;
		gasLimit: number;
		gasSpeed: {
			fastestAllowed: number;
			averageAllowed: number;
			slowAllowed: number;
		};
	};
	ethRate: number | null;
	synthsMap: SynthDefinitionMap;
};

type DispatchProps = {
	toggleGweiPopup: typeof toggleGweiPopup;
	setGasPrice: typeof setGasPrice;
};

type GweiPopupProps = StateProps & DispatchProps;

const GweiPopup: FC<GweiPopupProps> = memo(
	({
		popupIsVisible,
		toggleGweiPopup,
		setGasPrice,
		gasInfo: { gasPrice = 1, gasLimit, gasSpeed },
		ethRate,
	}) => {
		const [gasSettings, setGasSettings] = useState<{
			gasPrice?: number;
			usdPrice?: number;
		}>({});

		const { colors } = useContext(ThemeContext);
		const { t } = useTranslation();

		useEffect(() => {
			if (!gasPrice || !gasLimit || !ethRate) return;

			setGasSettings({
				gasPrice,
				usdPrice: getTransactionPrice(gasPrice, gasLimit, ethRate),
			});
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [gasPrice, gasLimit, ethRate]);

		return (
			<>
				<GlobalStyle />
				<FullScreenModal open={popupIsVisible}>
					<Container>
						<FullScreenModalCloseButton onClick={() => toggleGweiPopup(false)}>
							<CloseCrossIcon />
						</FullScreenModalCloseButton>
						<Body>
							<Title>{t('modals.gwei.title')}</Title>
							<BodyMedium>{t('modals.gwei.desc')}</BodyMedium>
							<SliderContainer>
								<Slider
									min={0}
									max={100}
									value={gasSettings.gasPrice}
									tooltipRenderer={() => (
										<TooltipInner>
											<TooltipValue>{gasSettings.gasPrice} GWEI</TooltipValue>
											{/* <TooltipValue>
												{formatCurrencyWithSign(usdPriceSign, gasSettings.usdPrice || 0)}
											</TooltipValue> */}
										</TooltipInner>
									)}
									onChange={(newPrice: number) => {
										setGasSettings({
											gasPrice: newPrice,
											usdPrice: getTransactionPrice(newPrice, gasLimit, ethRate),
										});
									}}
								/>
							</SliderContainer>
							<Table style={{ height: 'auto' }}>
								<Thead>
									<Tr>
										<Th>
											<DataSmall color={colors.fontTertiary}>
												{t('modals.gwei.table.speed-allowed')}
											</DataSmall>
										</Th>
										<Th>
											<DataSmall color={colors.fontTertiary}>
												{t('modals.gwei.table.slow')}
											</DataSmall>
										</Th>
										<Th>
											<DataSmall color={colors.fontTertiary}>
												{t('modals.gwei.table.average')}
											</DataSmall>
										</Th>
										<Th>
											<DataSmall color={colors.fontTertiary}>
												{t('modals.gwei.table.fast')}
											</DataSmall>
										</Th>
									</Tr>
								</Thead>
								<Tbody>
									{/* <Tr>
										<Td>
											<DataLabel>{t('modals.gwei.table.price')}</DataLabel>
										</Td>
										<Td>
											<DataLabel>
												{formatCurrencyWithSign(
													usdPriceSign,
													getTransactionPrice(gasSpeed.slowAllowed, gasLimit, ethRate)
												)}
											</DataLabel>
										</Td>
										<Td>
											<DataLabel>
												{formatCurrencyWithSign(
													usdPriceSign,
													getTransactionPrice(gasSpeed.averageAllowed, gasLimit, ethRate)
												)}
											</DataLabel>
										</Td>
										<Td>
											<DataLabel>
												{formatCurrencyWithSign(
													usdPriceSign,
													getTransactionPrice(gasSpeed.fastestAllowed, gasLimit, ethRate)
												)}
											</DataLabel>
										</Td>
									</Tr> */}
									<Tr>
										<Td>
											<DataLabel>{t('common.gwei')}</DataLabel>
										</Td>
										<Td>
											<DataLabel>{formatCurrency(gasSpeed.slowAllowed)}</DataLabel>
										</Td>
										<Td>
											<DataLabel>{formatCurrency(gasSpeed.averageAllowed)}</DataLabel>
										</Td>
										<Td>
											<DataLabel>{formatCurrency(gasSpeed.fastestAllowed)}</DataLabel>
										</Td>
									</Tr>
								</Tbody>
							</Table>
							<InputRow>
								<ButtonPrimary
									style={{ flex: 1, width: 'auto' }}
									onClick={() => {
										setGasPrice(gasSettings.gasPrice);
										toggleGweiPopup(false);
									}}
								>
									{t('modals.gwei.submit')}
								</ButtonPrimary>
							</InputRow>
						</Body>
					</Container>
				</FullScreenModal>
			</>
		);
	}
);

const BodyMedium = styled.span`
	${bodyCSS};
	color: ${(props) => props.theme.colors.fontPrimary};
`;

const Title = styled.div`
	${headingH3CSS};
	color: ${(props) => props.theme.colors.fontPrimary};
	padding-bottom: 18px;
`;

const Container = styled.div`
	width: 640px;
	max-width: 1024px;
	margin: 0 auto;
	display: flex;
	height: 100%;
	align-items: center;
	flex-direction: column;
	justify-content: center;
`;

const Body = styled.div`
	text-align: center;
`;

const SliderContainer = styled.div`
	margin: 100px 0 50px 0;
`;

const InputRow = styled.div`
	margin: 40px 0;
	display: flex;
`;

const GlobalStyle = createGlobalStyle`
	.rc-slider-tooltip {
		z-index: ${Z_INDEX.MODAL};
	}
`;

const TooltipInner = styled.div`
	height: 100%;
	padding: 12px;
`;

const TooltipValue = styled.div`
	margin-bottom: 4px;
`;

const mapStateToProps = (state: RootState): StateProps => ({
	popupIsVisible: gweiPopupIsVisible(state),
	gasInfo: getGasInfo(state),
	ethRate: getEthRate(state),
	synthsMap: getAvailableSynthsMap(state),
});

const mapDispatchToProps: DispatchProps = {
	toggleGweiPopup,
	setGasPrice,
};

export default connect<StateProps, DispatchProps, {}, RootState>(
	mapStateToProps,
	mapDispatchToProps
)(GweiPopup);
