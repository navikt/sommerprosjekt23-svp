import { intlUtils } from '@navikt/fp-common';
import { Dekningsgrad } from 'app/types/Dekningsgrad';

import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import OppsummeringsPunkt from '../OppsummeringsPunkt';
import { Normaltekst } from 'nav-frontend-typografi';
import UttaksplanOppsummeringsliste from './UttaksplanOppsummeringsliste';
import { Periode } from 'uttaksplan/types/Periode';
import Arbeidsforhold from 'app/types/Arbeidsforhold';
import { NavnPåForeldre } from 'app/types/NavnPåForeldre';
import AnnenForelder from 'app/context/types/AnnenForelder';
import { Tilleggsopplysning } from 'app/context/types/Tilleggsopplysninger';
import { Situasjon } from 'app/types/Situasjon';

interface Props {
    perioder: Periode[];
    navnPåForeldre: NavnPåForeldre;
    erFarEllerMedmor: boolean;
    registrerteArbeidsforhold: Arbeidsforhold[];
    dekningsgrad: Dekningsgrad;
    antallUkerUttaksplan: number;
    annenForelder: AnnenForelder;
    familiehendelsesdato: Date;
    termindato: Date | undefined;
    situasjon: Situasjon;
    erAleneOmOmsorg: boolean;
    antallBarn: number;
    ønskerJustertUttakVedFødsel: boolean | undefined;
    begrunnelseForSenEndring?: Tilleggsopplysning;
    eksisterendeUttaksplan?: Periode[];
}

const UttaksplanOppsummering: React.FunctionComponent<Props> = ({
    dekningsgrad,
    antallUkerUttaksplan,
    ønskerJustertUttakVedFødsel,
    antallBarn,
    ...rest
}) => {
    const intl = useIntl();

    const dekningsgradTekst =
        dekningsgrad === Dekningsgrad.HUNDRE_PROSENT
            ? intlUtils(intl, 'oppsummering.uttak.dekningsgrad.verdi100', { antallUker: antallUkerUttaksplan })
            : intlUtils(intl, 'oppsummering.uttak.dekningsgrad.verdi80', { antallUker: antallUkerUttaksplan });
    return (
        <>
            <OppsummeringsPunkt title={intlUtils(intl, 'oppsummering.uttak.dekningsgrad.label')}>
                <Normaltekst>{dekningsgradTekst}</Normaltekst>
            </OppsummeringsPunkt>
            <UttaksplanOppsummeringsliste
                ønskerJustertUttakVedFødsel={ønskerJustertUttakVedFødsel}
                {...rest}
            ></UttaksplanOppsummeringsliste>
            {ønskerJustertUttakVedFødsel !== undefined && (
                <OppsummeringsPunkt
                    title={intlUtils(intl, 'oppsummering.uttak.ønskerAutomatiskJustering.label', {
                        antallBarn,
                    })}
                >
                    <Normaltekst>
                        <FormattedMessage id={ønskerJustertUttakVedFødsel ? 'ja' : 'nei'} />
                    </Normaltekst>
                </OppsummeringsPunkt>
            )}
        </>
    );
};

export default UttaksplanOppsummering;