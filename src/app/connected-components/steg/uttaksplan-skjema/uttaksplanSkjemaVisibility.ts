import Søknad, { SøkerRolle, Søkersituasjon } from '../../../types/s\u00F8knad/S\u00F8knad';

export interface UttaksplanSkjemaStegVisibility {
    dekningsgradSpørsmål: boolean;
    startdatoPermisjonSpørsmål: boolean;
}

const visDekningsgradSpørsmål = (rolle: SøkerRolle, situasjon: Søkersituasjon): boolean => {
    if (situasjon === Søkersituasjon.FØDSEL) {
        return rolle === SøkerRolle.MOR;
    }
    return true;
};

const getUttaksplanSkjemaStegVisibility = (søknad: Søknad): UttaksplanSkjemaStegVisibility => {
    const dekningsgradSpørsmål = visDekningsgradSpørsmål(søknad.søker.rolle, søknad.situasjon);
    const startdatoPermisjonSpørsmål = dekningsgradSpørsmål && søknad.dekningsgrad !== undefined;
    return {
        dekningsgradSpørsmål,
        startdatoPermisjonSpørsmål
    };
};

export default getUttaksplanSkjemaStegVisibility;
