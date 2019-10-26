import queryString from 'query-string';
import history from '../utils/history';

export const ROUTES = {
	Home: '/',
	Trade: '/trade',
	Loans: '/loans',
};

export const navigateTo = (path, replacePath = false) =>
	replacePath ? history.replace(path) : history.push(path);
export const navigateToTrade = (baseCurrencyKey, quoteCurrencyKey, replacePath = false) =>
	navigateTo(
		{
			pathname: ROUTES.Trade,
			search: queryString.stringify({
				base: baseCurrencyKey,
				quote: quoteCurrencyKey,
			}),
		},
		replacePath
	);
