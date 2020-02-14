import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { OptionsMarket } from 'ducks/options/types';

import Card from 'components/Card';

type MaturityPhaseCardProps = {
	optionsMarket: OptionsMarket;
};

const MaturityPhaseCard: FC<MaturityPhaseCardProps> = memo(({ optionsMarket }) => {
	const { t } = useTranslation();

	return (
		<Card>
			<Card.Header>Hello</Card.Header>
			<Card.Body>Hello world</Card.Body>
		</Card>
	);
});

export default MaturityPhaseCard;
