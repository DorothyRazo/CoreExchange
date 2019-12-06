import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Link from 'components/Link';
import { labelSmallCSS } from 'components/Typography/Label';

import { toggleHideSmallValueAssets, getHideSmallValueAssets } from 'ducks/ui';

import { ReactComponent as ChartsSquareIcon } from 'assets/images/charts-square.svg';
import { ReactComponent as ClockSquareIcon } from 'assets/images/clock-square.svg';
// import { ReactComponent as ArrowsSquareIcon } from 'assets/images/arrows-square.svg';

import { ROUTES } from 'constants/routes';

const MenuLinks = [
	{
		route: ROUTES.Assets.Overview,
		i18nKey: 'assets.navigation.overview',
		icon: <ClockSquareIcon />,
	},
	{
		route: ROUTES.Assets.Exchanges,
		i18nKey: 'assets.navigation.exchanges',
		icon: <ChartsSquareIcon />,
	},
	/* Transfers page is disabled for now.
	{
		route: ROUTES.Assets.Transfers,
		i18nKey: 'assets.navigation.transfers',
		icon: <ArrowsSquareIcon />,
	},
	*/
];

const AssetsNavigation = memo(({ toggleHideSmallValueAssets, hideSmallValueAssets }) => {
	const { t } = useTranslation();

	return (
		<div>
			<List>
				{MenuLinks.map(({ route, i18nKey, icon }) => (
					<li key={route}>
						<ListItemLink to={route}>
							<span>{t(i18nKey)}</span>
							{icon}
						</ListItemLink>
					</li>
				))}
			</List>
			<Route
				path={ROUTES.Assets.Overview}
				render={() => (
					<SmallValueAssets onClick={() => toggleHideSmallValueAssets()} role="button">
						{hideSmallValueAssets
							? t('assets.balances.show-small-value')
							: t('assets.balances.hide-small-value')}
					</SmallValueAssets>
				)}
			/>
		</div>
	);
});

AssetsNavigation.propTypes = {
	toggleHideSmallValueAssets: PropTypes.func.isRequired,
	hideSmallValueAssets: PropTypes.bool.isRequired,
};

const ListItemLink = styled(Link)`
	${labelSmallCSS};
	width: 170px;
	border-bottom: 1px solid ${(props) => props.theme.colors.accentL2};
	font-size: 12px;
	padding: 10px 16px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.fontSecondary};
	background-color: ${(props) => props.theme.colors.surfaceL2};
	&:hover {
		color: ${(props) => props.theme.colors.fontPrimary};
		background-color: ${(props) => props.theme.colors.accentL1};
	}
	&.active {
		background-color: ${(props) => props.theme.colors.accentL2};
		color: ${(props) => props.theme.colors.fontPrimary};
	}
`;

const List = styled.ul`
	border: 1px solid ${(props) => props.theme.colors.accentL2};
	> * {
		&:last-child > ${ListItemLink} {
			border: 0;
		}
	}

	margin-bottom: 24px;
`;

const SmallValueAssets = styled.div`
	${labelSmallCSS};
	background-color: ${(props) => props.theme.colors.accentL1};
	border: 1px solid ${(props) => props.theme.colors.accentL2};
	color: ${(props) => props.theme.colors.fontSecondary};
	cursor: pointer;
	width: 170px;
	padding: 5px;
	box-sizing: border-box;
	text-align: center;
	&:hover {
		color: ${(props) => props.theme.colors.fontPrimary};
		background-color: ${(props) => props.theme.colors.accentL2};
	}
`;

const mapStateToProps = (state) => ({
	hideSmallValueAssets: getHideSmallValueAssets(state),
});

const mapDispatchToProps = {
	toggleHideSmallValueAssets,
};

export default connect(mapStateToProps, mapDispatchToProps)(AssetsNavigation);
