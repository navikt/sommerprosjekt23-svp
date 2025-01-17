import { hasValue } from '@navikt/fp-common';
import { QuestionConfig, Questions } from '@navikt/sif-common-question-config/lib';
import {
    FarMedmorAleneomsorgFødselFormData,
    FarMedmorAleneomsorgFødselFormField,
} from './farMedmorAleneomsorgFødselFormConfig';
import { YesOrNo } from '@navikt/sif-common-formik-ds/lib';

const FarMedmorAleneomsorgFødselFormConfig: QuestionConfig<
    FarMedmorAleneomsorgFødselFormData,
    FarMedmorAleneomsorgFødselFormField
> = {
    [FarMedmorAleneomsorgFødselFormField.dekningsgrad]: {
        isIncluded: () => true,
        isAnswered: ({ dekningsgrad }) => hasValue(dekningsgrad),
    },
    [FarMedmorAleneomsorgFødselFormField.startPåOmsorgsovertakelse]: {
        isIncluded: () => true,
        isAnswered: ({ startPåOmsorgsovertakelse }) => startPåOmsorgsovertakelse !== YesOrNo.UNANSWERED,
        visibilityFilter: ({ dekningsgrad }) => hasValue(dekningsgrad),
    },
    [FarMedmorAleneomsorgFødselFormField.startdatoUttak]: {
        isIncluded: ({ startPåOmsorgsovertakelse }) => startPåOmsorgsovertakelse === YesOrNo.NO,
        isAnswered: ({ startdatoUttak }) => hasValue(startdatoUttak),
        visibilityFilter: ({ startPåOmsorgsovertakelse }) => startPåOmsorgsovertakelse === YesOrNo.NO,
    },
};

const farMedmorAleneomsorgFødselQuestionsConfig = Questions<
    FarMedmorAleneomsorgFødselFormData,
    FarMedmorAleneomsorgFødselFormField
>(FarMedmorAleneomsorgFødselFormConfig);

export default farMedmorAleneomsorgFødselQuestionsConfig;
