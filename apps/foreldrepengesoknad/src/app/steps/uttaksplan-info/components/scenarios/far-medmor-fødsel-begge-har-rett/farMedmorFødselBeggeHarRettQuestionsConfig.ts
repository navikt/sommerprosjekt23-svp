import { hasValue } from '@navikt/fp-common';
import { QuestionConfig, Questions } from '@navikt/sif-common-question-config/lib';
import { andreAugust2022ReglerGjelder, ISOStringToDate } from 'app/utils/dateUtils';
import { getSisteUttaksdag6UkerEtterFødsel } from 'app/utils/wlbUtils';
import dayjs from 'dayjs';
import {
    FarMedmorFødselBeggeHarRettFormData,
    FarMedmorFødselBeggeHarRettFormField,
} from './farMedmorFødselBeggeHarRettFormConfig';

export interface FarMedmorFødselBeggeHarRettFormPayload extends FarMedmorFødselBeggeHarRettFormData {
    familiehendelsesdato: Date;
}
const includeFellesperiodeSpørsmål = (farMedmorsFørsteDag: string, familiehendelsesdato: Date) => {
    return (
        hasValue(farMedmorsFørsteDag) &&
        (!andreAugust2022ReglerGjelder ||
            dayjs(ISOStringToDate(farMedmorsFørsteDag)).isAfter(
                getSisteUttaksdag6UkerEtterFødsel(familiehendelsesdato),
                'day'
            ))
    );
};
const FarMedmorFødselBeggeHarRettFormConfig: QuestionConfig<
    FarMedmorFødselBeggeHarRettFormPayload,
    FarMedmorFødselBeggeHarRettFormField
> = {
    [FarMedmorFødselBeggeHarRettFormField.dekningsgrad]: {
        isIncluded: () => true,
        isAnswered: ({ dekningsgrad }) => hasValue(dekningsgrad),
    },
    [FarMedmorFødselBeggeHarRettFormField.morsSisteDag]: {
        isIncluded: ({ familiehendelsesdato }) => !andreAugust2022ReglerGjelder(familiehendelsesdato),
        isAnswered: ({ morsSisteDag, familiehendelsesdato }) =>
            andreAugust2022ReglerGjelder(familiehendelsesdato) || hasValue(morsSisteDag),
        visibilityFilter: ({ dekningsgrad }) => hasValue(dekningsgrad),
    },
    [FarMedmorFødselBeggeHarRettFormField.farMedmorsFørsteDag]: {
        isIncluded: ({ morsSisteDag, familiehendelsesdato }) =>
            andreAugust2022ReglerGjelder(familiehendelsesdato) || hasValue(morsSisteDag),
        isAnswered: ({ farMedmorsFørsteDag }) => hasValue(farMedmorsFørsteDag),
    },
    [FarMedmorFødselBeggeHarRettFormField.antallDagerFellesperiode]: {
        isIncluded: ({ farMedmorsFørsteDag, familiehendelsesdato }) =>
            includeFellesperiodeSpørsmål(farMedmorsFørsteDag, familiehendelsesdato),
        isAnswered: () => true,
    },
    [FarMedmorFødselBeggeHarRettFormField.antallUkerFellesperiode]: {
        isIncluded: ({ farMedmorsFørsteDag, familiehendelsesdato }) =>
            includeFellesperiodeSpørsmål(farMedmorsFørsteDag, familiehendelsesdato),

        isAnswered: () => true,
    },
};

const farMedmorFødselBeggeHarRettQuestionsConfig = Questions<
    FarMedmorFødselBeggeHarRettFormPayload,
    FarMedmorFødselBeggeHarRettFormField
>(FarMedmorFødselBeggeHarRettFormConfig);

export default farMedmorFødselBeggeHarRettQuestionsConfig;
