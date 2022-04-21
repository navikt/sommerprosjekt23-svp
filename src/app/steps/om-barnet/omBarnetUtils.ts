import { hasValue } from '@navikt/fp-common';
import { dateToISOString, YesOrNo } from '@navikt/sif-common-formik/lib';
import { QuestionVisibility } from '@navikt/sif-common-question-config/lib';
import Barn, {
    BarnType,
    isAdoptertAnnetBarn,
    isAdoptertStebarn,
    isFødtBarn,
    isUfødtBarn,
} from 'app/context/types/Barn';
import Arbeidsforhold from 'app/types/Arbeidsforhold';
import { AttachmentType } from 'app/types/AttachmentType';
import { RegistrertBarn } from 'app/types/Person';
import { Skjemanummer } from 'app/types/Skjemanummer';
import { getRegistrertBarnOmDetFinnes } from 'app/utils/barnUtils';
import { ISOStringToDate, velgEldsteBarn } from 'app/utils/dateUtils';
import { convertBooleanOrUndefinedToYesOrNo, convertYesOrNoOrUndefinedToBoolean } from 'app/utils/formUtils';
import { lagSendSenereDokumentNårIngenAndreFinnes } from 'app/utils/vedleggUtils';
import { OmBarnetFormData, OmBarnetFormField } from './omBarnetFormConfig';

const getInitValues = (): Readonly<OmBarnetFormData> => ({
    [OmBarnetFormField.erBarnetFødt]: YesOrNo.UNANSWERED,
    [OmBarnetFormField.adopsjonAvEktefellesBarn]: YesOrNo.UNANSWERED,
    [OmBarnetFormField.antallBarn]: '',
    [OmBarnetFormField.antallBarnSelect]: '',
    [OmBarnetFormField.adopsjonsdato]: '',
    [OmBarnetFormField.fødselsdatoer]: [],
    [OmBarnetFormField.omsorgsovertakelse]: [],
    [OmBarnetFormField.termindato]: '',
    [OmBarnetFormField.terminbekreftelse]: [],
    [OmBarnetFormField.terminbekreftelsedato]: '',
    [OmBarnetFormField.adoptertIUtlandet]: YesOrNo.UNANSWERED,
    [OmBarnetFormField.ankomstdato]: '',
    [OmBarnetFormField.gjelderAnnetBarn]: false,
    [OmBarnetFormField.valgteBarn]: [],
});

export const cleanupOmBarnetFormData = (
    values: OmBarnetFormData,
    visibility: QuestionVisibility<OmBarnetFormField, undefined>
): OmBarnetFormData => {
    const cleanedData: OmBarnetFormData = {
        erBarnetFødt: visibility.isVisible(OmBarnetFormField.erBarnetFødt) ? values.erBarnetFødt : YesOrNo.UNANSWERED,
        adopsjonAvEktefellesBarn: visibility.isVisible(OmBarnetFormField.adopsjonAvEktefellesBarn)
            ? values.adopsjonAvEktefellesBarn
            : YesOrNo.UNANSWERED,
        antallBarn: visibility.isVisible(OmBarnetFormField.antallBarn) ? values.antallBarn : '',
        antallBarnSelect: visibility.isVisible(OmBarnetFormField.antallBarnSelect) ? values.antallBarnSelect : '',
        adopsjonsdato: visibility.isVisible(OmBarnetFormField.adopsjonsdato) ? values.adopsjonsdato : '',
        fødselsdatoer: visibility.isVisible(OmBarnetFormField.fødselsdatoer) ? values.fødselsdatoer : [],
        omsorgsovertakelse: visibility.isVisible(OmBarnetFormField.omsorgsovertakelse) ? values.omsorgsovertakelse : [],
        termindato: visibility.isVisible(OmBarnetFormField.termindato) ? values.termindato : '',
        terminbekreftelse: visibility.isVisible(OmBarnetFormField.terminbekreftelse) ? values.terminbekreftelse : [],
        terminbekreftelsedato: visibility.isVisible(OmBarnetFormField.terminbekreftelsedato)
            ? values.terminbekreftelsedato
            : '',
        adoptertIUtlandet: visibility.isVisible(OmBarnetFormField.adoptertIUtlandet)
            ? values.adoptertIUtlandet
            : YesOrNo.UNANSWERED,
        ankomstdato: visibility.isVisible(OmBarnetFormField.ankomstdato) ? values.ankomstdato : '',
        gjelderAnnetBarn: visibility.isVisible(OmBarnetFormField.gjelderAnnetBarn) ? values.gjelderAnnetBarn : false,
        valgteBarn: visibility.isVisible(OmBarnetFormField.valgteBarn) ? values.valgteBarn : [],
    };

    return cleanedData;
};

export const mapOmBarnetFormDataToState = (
    values: Partial<OmBarnetFormData>,
    registrerteBarn: RegistrertBarn[],
    arbeidsforhold: Arbeidsforhold[]
): Barn => {
    const antallBarn =
        parseInt(values.antallBarn!, 10) < 3
            ? parseInt(values.antallBarn!, 10)
            : parseInt(values.antallBarnSelect!, 10);

    if (!values.gjelderAnnetBarn && values.valgteBarn && values.valgteBarn.length > 0) {
        const eldsteBarn = velgEldsteBarn(registrerteBarn, values.valgteBarn);

        return {
            type: BarnType.FØDT,
            fødselsdatoer: [eldsteBarn.fødselsdato],
            antallBarn: values.valgteBarn.length,
            termindato: hasValue(values.termindato) ? ISOStringToDate(values.termindato) : undefined,
            fnr: eldsteBarn.fnr,
        };
    }

    if (values.erBarnetFødt === YesOrNo.YES) {
        return {
            type: BarnType.FØDT,
            fødselsdatoer: values.fødselsdatoer!.map((fødselsdato) => ISOStringToDate(fødselsdato)!),
            antallBarn,
            termindato: ISOStringToDate(values.termindato),
        };
    }

    if (values.erBarnetFødt === YesOrNo.NO) {
        const terminbekreftelse = lagSendSenereDokumentNårIngenAndreFinnes(
            values.terminbekreftelse!,
            AttachmentType.TERMINBEKREFTELSE,
            Skjemanummer.TERMINBEKREFTELSE
        );

        if (arbeidsforhold.length === 0) {
            return {
                type: BarnType.UFØDT,
                terminbekreftelse: terminbekreftelse!,
                terminbekreftelsedato: ISOStringToDate(values.terminbekreftelsedato),
                antallBarn,
                termindato: ISOStringToDate(values.termindato)!,
            };
        }
        return {
            type: BarnType.UFØDT,
            antallBarn,
            termindato: ISOStringToDate(values.termindato)!,
        };
    }

    const omsorgsovertakelse = lagSendSenereDokumentNårIngenAndreFinnes(
        values.omsorgsovertakelse!,
        AttachmentType.OMSORGSOVERTAKELSE,
        Skjemanummer.OMSORGSOVERTAKELSESDATO
    );

    if (values.adopsjonAvEktefellesBarn === YesOrNo.YES) {
        return {
            type: BarnType.ADOPTERT_STEBARN,
            adopsjonsdato: ISOStringToDate(values.adopsjonsdato)!,
            antallBarn,
            fødselsdatoer: values.fødselsdatoer!.map((fødselsdato) => ISOStringToDate(fødselsdato)!),
            omsorgsovertakelse,
        };
    }

    return {
        type: BarnType.ADOPTERT_ANNET_BARN,
        fødselsdatoer: values.fødselsdatoer!.map((fødselsdato) => ISOStringToDate(fødselsdato)!),
        adopsjonsdato: ISOStringToDate(values.adopsjonsdato)!,
        antallBarn,
        adoptertIUtlandet: convertYesOrNoOrUndefinedToBoolean(values.adoptertIUtlandet)!,
        ankomstdato: values.adoptertIUtlandet === YesOrNo.YES ? ISOStringToDate(values.ankomstdato) : undefined,
        omsorgsovertakelse,
    };
};

export const getOmBarnetInitialValues = (
    barn: Barn,
    registrerteBarn: RegistrertBarn[],
    arbeidsforhold: Arbeidsforhold[]
): OmBarnetFormData => {
    const initialOmBarnetValues = getInitValues();

    if (!barn) {
        return initialOmBarnetValues;
    }

    const erFlereEnnToBarn = barn.antallBarn > 2;

    if (isFødtBarn(barn)) {
        const registrertBarn = getRegistrertBarnOmDetFinnes(barn, registrerteBarn);

        if (registrertBarn) {
            return {
                ...initialOmBarnetValues,
                fødselsdatoer: barn.fødselsdatoer.map((fødselsdato) => dateToISOString(fødselsdato)),
                termindato: dateToISOString(barn.termindato),
                antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
                antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
                valgteBarn: [registrertBarn.fnr],
            };
        }
    }

    if (isFødtBarn(barn)) {
        return {
            ...initialOmBarnetValues,
            erBarnetFødt: YesOrNo.YES,
            fødselsdatoer: barn.fødselsdatoer.map((fødselsdato) => dateToISOString(fødselsdato)),
            termindato: dateToISOString(barn.termindato),
            antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
            antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
            gjelderAnnetBarn: true,
        };
    }

    if (isUfødtBarn(barn)) {
        if (arbeidsforhold.length === 0) {
            return {
                ...initialOmBarnetValues,
                erBarnetFødt: YesOrNo.NO,
                terminbekreftelse: barn.terminbekreftelse || [],
                terminbekreftelsedato: dateToISOString(barn.terminbekreftelsedato),
                termindato: dateToISOString(barn.termindato),
                antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
                antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
                gjelderAnnetBarn: true,
            };
        }

        return {
            ...initialOmBarnetValues,
            erBarnetFødt: YesOrNo.NO,
            termindato: dateToISOString(barn.termindato),
            antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
            antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
            gjelderAnnetBarn: true,
        };
    }

    if (isAdoptertAnnetBarn(barn)) {
        return {
            ...initialOmBarnetValues,
            adopsjonAvEktefellesBarn: YesOrNo.NO,
            fødselsdatoer: barn.fødselsdatoer.map((fødselsdato) => dateToISOString(fødselsdato)),
            adopsjonsdato: dateToISOString(barn.adopsjonsdato),
            antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
            antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
            adoptertIUtlandet: convertBooleanOrUndefinedToYesOrNo(barn.adoptertIUtlandet),
            omsorgsovertakelse: barn.omsorgsovertakelse!,
            ankomstdato: dateToISOString(barn.ankomstdato),
        };
    }

    if (isAdoptertStebarn(barn)) {
        return {
            ...initialOmBarnetValues,
            adopsjonAvEktefellesBarn: YesOrNo.YES,
            adopsjonsdato: dateToISOString(barn.adopsjonsdato),
            antallBarn: erFlereEnnToBarn ? '3' : barn.antallBarn.toString(),
            antallBarnSelect: erFlereEnnToBarn ? barn.antallBarn.toString() : '',
            fødselsdatoer: barn.fødselsdatoer.map((fødselsdato) => dateToISOString(fødselsdato)),
            omsorgsovertakelse: barn.omsorgsovertakelse,
        };
    }

    return initialOmBarnetValues;
};