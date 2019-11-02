import { css } from 'styled-components';

// https://github.com/JohnAlbin/styled-media-queries/blob/master/index.js
export const mediaQuery = (...query) => (...rules) =>
	css`
		@media ${css(...query)} {
			${css(...rules)}
		}
	`;

export const breakpoint = {
	small: '480px',
	medium: '768px',
	large: '1150px',
	extraLarge: '1300px',
};

export const media = {
	small: mediaQuery`(max-width: ${breakpoint.small})`,
	medium: mediaQuery`(max-width: ${breakpoint.medium})`,
	large: mediaQuery`(max-width: ${breakpoint.large})`,
	extraLarge: mediaQuery`(max-width: ${breakpoint.extraLarge})`,
};
