import React, { useState } from 'react';
import styled, { withTheme } from 'styled-components';

import { DataSmall } from '../Typography';
import { Table, Tr, Thead, Tbody, Th, Td, DataLabel } from '../Table';

const OrderBook = ({ theme: { colors } }) => {
	const [activeTab, setActiveTab] = useState('Your orders');
	return (
		<Container>
			<Tabs>
				{['Your orders', 'Your trades', 'Show all trades'].map(tab => {
					return (
						<Tab
							key={tab}
							onClick={() => setActiveTab(tab)}
							hidden={!tab}
							active={tab === activeTab}
						>
							<DataSmall color={tab === activeTab ? colors.fontPrimary : colors.fontTertiary}>
								{tab}
							</DataSmall>
						</Tab>
					);
				})}
			</Tabs>
			<Book>
				<Table cellSpacing="0">
					<Thead>
						<Tr>
							{[1, 2, 3, 4, 5, 6, 7].map(i => {
								return (
									<Th key={i}>
										<ButtonSort>
											<DataSmall color={colors.fontTertiary}>Date Time</DataSmall>
											<SortIcon src={'/images/sort-arrows.svg'} />
										</ButtonSort>
									</Th>
								);
							})}
						</Tr>
					</Thead>
					<Tbody>
						{[1, 2, 3, 4, 5, 6, 7].map(i => {
							return (
								<Tr key={i}>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
									<Td>
										<DataLabel>blh fsdf fdsd</DataLabel>
									</Td>
								</Tr>
							);
						})}
						<Tr></Tr>
					</Tbody>
				</Table>
			</Book>
		</Container>
	);
};

const Container = styled.div`
	height: 100%;
	background-color: ${props => props.theme.colors.surfaceL1};
	display: flex;
	flex-direction: column;
`;

const Tabs = styled.div`
	display: flex;
	& > * {
		margin: 0 4px;
		&:first-child {
			margin-left: 0;
		}
	}
`;

const Tab = styled.button`
	padding: 0 18px;
	outline: none;
	border: none;
	visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 1;
	height: 42px;
	background-color: ${props =>
		props.active ? props.theme.colors.surfaceL3 : props.theme.colors.surfaceL2};
	&:hover {
		background-color: ${props => props.theme.colors.surfaceL3};
	}
`;

const Book = styled.div`
	height: 100%;
	min-height: 0;
`;

const SortIcon = styled.img`
	width: 6.5px;
	height: 8px;
	margin-left: 5px;
`;

const ButtonSort = styled.button`
	text-align: left;
	display: flex;
	align-items: center;
	border: none;
	outline: none;
	cursor: pointer;
	background-color: transparent;
	padding: 0;
`;
export default withTheme(OrderBook);
