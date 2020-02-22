import ROUTES from 'constants/routes';

export type MenuLink = {
	i18nLabel: string;
	link: string;
	isBeta?: boolean;
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'header.links.markets',
		link: ROUTES.Markets,
	},
	{
		i18nLabel: 'header.links.synths',
		link: ROUTES.Synths.Home,
	},
	{
		i18nLabel: 'header.links.trade',
		link: ROUTES.Trade,
	},
	{
		i18nLabel: 'header.links.loans',
		link: ROUTES.Loans,
	},
];

if (process.env.REACT_APP_BINARY_OPTIONS_ENABLED) {
	MENU_LINKS.push({
		i18nLabel: 'header.links.options',
		link: ROUTES.Options.Home,
		isBeta: true,
	});
}

export const MENU_LINKS_LOGGED_IN: MenuLinks = [
	{
		i18nLabel: 'header.links.assets',
		link: ROUTES.Assets.Home,
	},
];
