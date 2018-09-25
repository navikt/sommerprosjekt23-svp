import { QuestionConfig, Questions, QuestionVisibility } from '../../../util/questions/Question';
import { Uttaksperiode } from '../../../types/uttaksplan/periodetyper';

interface GradertUttakSpørsmålPayload {
    periode: Uttaksperiode;
    erAleneOmOmsorg: boolean;
    annenForelderHarRett: boolean;
}

export enum GradertUttakSpørsmålKeys {
    'skalHaGradering' = 'skalHaGradering',
    'stillingsprosent' = 'stillingsprosent',
    'samtidigGradertUttak' = 'samtidigGradertUttak',
    'hvorSkalDuJobbe' = 'hvorSkalDuJobbe'
}

export type GradertUttakSpørsmålVisibility = QuestionVisibility<GradertUttakSpørsmålKeys>;

const gradertUttakSpørsmålConfig: QuestionConfig<GradertUttakSpørsmålPayload, GradertUttakSpørsmålKeys> = {
    [GradertUttakSpørsmålKeys.skalHaGradering]: {
        getValue: ({ periode }) => periode.gradert
    },
    [GradertUttakSpørsmålKeys.stillingsprosent]: {
        getValue: ({ periode }) => periode.stillingsprosent,
        parentQuestion: GradertUttakSpørsmålKeys.skalHaGradering,
        condition: ({ periode }) => periode.gradert === true
    },
    [GradertUttakSpørsmålKeys.samtidigGradertUttak]: {
        getValue: ({ periode }) => periode.ønskerSamtidigUttak,
        parentQuestion: GradertUttakSpørsmålKeys.stillingsprosent,
        condition: ({ annenForelderHarRett, erAleneOmOmsorg }) => erAleneOmOmsorg === false && annenForelderHarRett
    },
    [GradertUttakSpørsmålKeys.hvorSkalDuJobbe]: {
        getValue: ({ periode }) => periode.orgnr,
        parentQuestion: GradertUttakSpørsmålKeys.samtidigGradertUttak
    }
};

export const getGradertUttakSpørsmålVisibility = (
    periode: Uttaksperiode,
    annenForelderHarRett: boolean,
    erAleneOmOmsorg: boolean
): QuestionVisibility<GradertUttakSpørsmålKeys> => {
    const payload: GradertUttakSpørsmålPayload = {
        periode,
        erAleneOmOmsorg,
        annenForelderHarRett
    };

    return Questions(gradertUttakSpørsmålConfig).getVisbility(payload);
};

// const hvilkenKvoteSkalBenyttesSynlig = (skjemadata: UtsettelsePgaDeltidsarbeidSkjemadata) => {
//     const { stillingsprosent } = skjemadata;
//     return stillingsprosent !== undefined;
// };

// const skalDereHaGradertUttakSamtidigSynlig = (skjemadata: UtsettelsePgaDeltidsarbeidSkjemadata, søknad: Søknad) => {
//     const { konto, stillingsprosent } = skjemadata;
//     const { søker, annenForelder } = søknad;
//     const { erAleneOmOmsorg } = søker;
//     const { harRettPåForeldrepenger } = annenForelder;

//     if (module.hvilkenKvoteSkalBenyttes(skjemadata)) {
//         return konto !== null && konto !== undefined;
//     }
//     if (stillingsprosent !== undefined) {
//         return !erAleneOmOmsorg && harRettPåForeldrepenger;
//     }
//     return false;
// };

// const hvorSkalDuJobbeSynlig = (skjemadata: UtsettelsePgaDeltidsarbeidSkjemadata, søknad: Søknad) => {
//     const { ønskerSamtidigUttak } = skjemadata;
//     return module.skalDereHaGradertUttakSamtidig(skjemadata, søknad) && ønskerSamtidigUttak !== undefined;
// };

// const module = {
//     hvilkenKvoteSkalBenyttes: hvilkenKvoteSkalBenyttesSynlig,
//     skalDereHaGradertUttakSamtidig: skalDereHaGradertUttakSamtidigSynlig,
//     hvorSkalDuJobbe: hvorSkalDuJobbeSynlig
// };

// export default module;
