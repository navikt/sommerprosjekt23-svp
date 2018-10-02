import {
    UttaksplanValideringActionTypes,
    UttaksplanValideringActionKeys,
    ValidertPeriode
} from '../actions/uttaksplanValidering/uttaksplanValideringActionDefinitions';
import { Periode } from '../../types/uttaksplan/periodetyper';

export enum PeriodeValideringErrorKey {
    'FORM_INCOMPLETE' = 'formIncomplete'
}

export interface Periodevalidering {
    [periodeId: string]: PeriodeValideringsfeil[] | undefined;
}

export interface UttaksplanValideringState {
    periodevalidering: Periodevalidering;
    overlappendePerioder: Periode[];
}

export interface PeriodeValideringsfeil {
    feilKey: PeriodeValideringErrorKey;
}

const getDefaultState = (): UttaksplanValideringState => {
    return {
        periodevalidering: {},
        overlappendePerioder: []
    };
};

const uttaksplanValideringReducer = (
    state = getDefaultState(),
    action: UttaksplanValideringActionTypes
): UttaksplanValideringState => {
    switch (action.type) {
        case UttaksplanValideringActionKeys.SET_VALIDERT_PERIODE:
            return {
                ...state,
                periodevalidering: {
                    ...state.periodevalidering,
                    [action.validertPeriode.periodeId]: action.validertPeriode.valideringsfeil
                }
            };
        case UttaksplanValideringActionKeys.SET_VALIDERTE_PERIODER:
            let periodevalidering = {};
            action.validertePerioder.forEach((p: ValidertPeriode) => {
                periodevalidering = {
                    ...periodevalidering,
                    [p.periodeId]: p.valideringsfeil
                };
            });
            return {
                ...state,
                periodevalidering
            };
    }
    return state;
};

export default uttaksplanValideringReducer;
