import { getVariantFromPeriode } from '../../../components/utsettelse-form/UtsettelseForm';
import { getErSøkerFarEllerMedmor } from '../../domain/personUtil';
import { getVelgbareStønadskontotyper } from '../../uttaksplan/stønadskontoer';
import { Søker } from '../../../types/søknad/Søker';
import { TilgjengeligStønadskonto, Periode, Periodetype } from '../../../types/uttaksplan/periodetyper';
import AnnenForelder from '../../../types/søknad/AnnenForelder';
import { PeriodeValideringsfeil, PeriodeValideringErrorKey } from '../../../redux/reducers/uttaksplanValideringReducer';
import {
    getUtsettelseFormVisibility,
    UtsettelseFormPayload
} from '../../../components/utsettelse-form/utsettelseFormConfig';
import { UttakFormPayload, getUttakFormVisibility } from '../../../components/uttak-form/uttakFormConfig';
import { uttakTidsperiodeErGyldig } from './uttakTidsperiodeValidation';
import { Søkersituasjon } from 'app/types/søknad/Søknad';
import { isValidTidsperiode } from '../../uttaksplan/Tidsperioden';
import { gradertUttaksperiodeErUgyldig } from './uttakGraderingValidation';

const validerUtsettelseForm = (payload: UtsettelseFormPayload): PeriodeValideringsfeil[] | undefined => {
    const visibility = getUtsettelseFormVisibility(payload);
    if (isValidTidsperiode(payload.periode.tidsperiode) === false) {
        return [
            {
                feilKey: PeriodeValideringErrorKey.UGYLDIG_TIDSPERIODE
            }
        ];
    }
    if (visibility.areAllQuestionsAnswered()) {
        return undefined;
    }
    return [
        {
            feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT
        }
    ];
};

const validerUttakForm = (payload: UttakFormPayload): PeriodeValideringsfeil[] | undefined => {
    const visibility = getUttakFormVisibility(payload);
    const valideringsfeil: PeriodeValideringsfeil[] = [];

    if (uttakTidsperiodeErGyldig(payload.periode, payload.familiehendelsesdato) === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_TIDSPERIODE });
    }
    if (gradertUttaksperiodeErUgyldig(payload.periode)) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.UGYLDIG_GRADERING_VERDI });
    }
    if (visibility.areAllQuestionsAnswered() === false) {
        valideringsfeil.push({ feilKey: PeriodeValideringErrorKey.SKJEMA_IKKE_KOMPLETT });
    }
    return valideringsfeil.length === 0 ? undefined : valideringsfeil;
};

export const validerPeriodeForm = (
    periode: Periode,
    søker: Søker,
    annenForelder: AnnenForelder,
    tilgjengeligeStønadskontoer: TilgjengeligStønadskonto[],
    familiehendelsesdato: Date,
    situasjon: Søkersituasjon
): PeriodeValideringsfeil[] | undefined => {
    const søkerErFarEllerMedmor = getErSøkerFarEllerMedmor(søker.rolle);
    if (periode.type === Periodetype.Hull) {
        return undefined;
    }
    if (periode.type === Periodetype.Overføring || periode.type === Periodetype.Uttak) {
        return validerUttakForm({
            periode,
            velgbareStønadskontotyper: getVelgbareStønadskontotyper(tilgjengeligeStønadskontoer),
            kanEndreStønadskonto: true,
            annenForelderHarRett: annenForelder.harRettPåForeldrepenger,
            søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
            søkerErFarEllerMedmor,
            morErUfør: søkerErFarEllerMedmor === false && annenForelder.erUfør,
            familiehendelsesdato,
            situasjon
        });
    }
    return validerUtsettelseForm({
        periode,
        variant: getVariantFromPeriode(periode),
        søkerErAleneOmOmsorg: søker.erAleneOmOmsorg,
        søkerErFarEllerMedmor: getErSøkerFarEllerMedmor(søker.rolle),
        annenForelderHarRettPåForeldrepenger: annenForelder.harRettPåForeldrepenger
    });
};
