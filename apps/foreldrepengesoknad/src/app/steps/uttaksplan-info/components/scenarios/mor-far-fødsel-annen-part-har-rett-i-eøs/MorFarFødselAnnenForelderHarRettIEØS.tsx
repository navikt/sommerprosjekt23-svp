import { FunctionComponent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Block, StepButtonWrapper, hasValue, intlUtils } from '@navikt/fp-common';
import useSøknad from 'app/utils/hooks/useSøknad';
import { formaterNavn } from 'app/utils/personUtils';
import { getFamiliehendelsedato, getFødselsdato, getTermindato } from 'app/utils/barnUtils';
import { getValgtStønadskontoFor80Og100Prosent } from 'app/utils/stønadskontoUtils';
import { TilgjengeligeStønadskontoerDTO } from 'app/types/TilgjengeligeStønadskontoerDTO';
import { isAnnenForelderOppgitt } from 'app/context/types/AnnenForelder';
import { getFlerbarnsuker } from 'app/steps/uttaksplan-info/utils/uttaksplanHarForMangeFlerbarnsuker';
import useSøkerinfo from 'app/utils/hooks/useSøkerinfo';
import { ISOStringToDate } from 'app/utils/dateUtils';
import FarMedmorsFørsteDag from '../spørsmål/FarMedmorsFørsteDag';
import SøknadRoutes from 'app/routes/routes';
import useOnValidSubmit from 'app/utils/hooks/useOnValidSubmit';
import actionCreator from 'app/context/action/actionCreator';
import useUttaksplanInfo from 'app/utils/hooks/useUttaksplanInfo';
import { MorFarFødselAnnenForelderHarRettIEØSUttaksplanInfo } from 'app/context/types/UttaksplanInfo';
import DekningsgradSpørsmål from '../spørsmål/DekningsgradSpørsmål';
import { getDekningsgradFromString } from 'app/utils/getDekningsgradFromString';
import { lagUttaksplan } from 'app/utils/uttaksplan/lagUttaksplan';
import isFarEllerMedmor from 'app/utils/isFarEllerMedmor';
import { Uttaksdagen } from 'app/steps/uttaksplan-info/utils/Uttaksdagen';
import { storeAppState } from 'app/utils/submitUtils';
import { ForeldrepengesøknadContextState } from 'app/context/ForeldrepengesøknadContextConfig';
import { getAntallUker } from 'app/steps/uttaksplan-info/utils/stønadskontoer';
import { getHarAktivitetskravIPeriodeUtenUttak } from 'app/utils/uttaksplan/uttaksplanUtils';
import {
    morFarFødselAnnenForelderHarRettIEØSQuestionsConfig,
    MorFarFødselAnnenForelderHarRettIEØSQuestionsPayload,
} from './morFarFødselAnnenForelderHarRettIEØSQuestionsConfig';
import {
    MorFarFødselAnnenForelderHarRettIEØSFormComponents as MorFarFødselAnnenForelderHarRettIEØSFormComponents,
    MorFarFødselAnnenForelderHarRettIEØSFormData,
    MorFarFødselAnnenForelderHarRettIEØSFormField,
} from './morFarFødselAnnenForelderHarRettIEØSFormConfig';
import {
    getInitialMorFarFødselAnnenForelderHarRettIEØSValues,
    mapMorFarFødselAnnenForelderHarRettIEØSFormToState,
} from './morFarFødselAnnenForelderHarRettIEØSUtils';
import { skalViseInfoOmPrematuruker } from 'app/utils/uttaksplanInfoUtils';
import { Tidsperioden } from 'app/steps/uttaksplan-info/utils/Tidsperioden';
import StartdatoPermisjonMor from '../mor-fodsel/StartdatoPermisjonMor';
import uttaksConstants from 'app/constants';
import { useForeldrepengesøknadContext } from 'app/context/hooks/useForeldrepengesøknadContext';
import { Button, GuidePanel } from '@navikt/ds-react';
import { Link } from 'react-router-dom';
import { getPreviousStepHref } from 'app/steps/stepsConfig';

interface Props {
    tilgjengeligeStønadskontoer100DTO: TilgjengeligeStønadskontoerDTO;
    tilgjengeligeStønadskontoer80DTO: TilgjengeligeStønadskontoerDTO;
}

const MorFarFødselAnnenForelderHarRettIEØS: FunctionComponent<Props> = ({
    tilgjengeligeStønadskontoer80DTO,
    tilgjengeligeStønadskontoer100DTO,
}) => {
    const intl = useIntl();
    const { state } = useForeldrepengesøknadContext();
    const { søkersituasjon, annenForelder, barn, dekningsgrad, erEndringssøknad } = useSøknad();
    const {
        person: { fornavn, mellomnavn, etternavn },
    } = useSøkerinfo();
    const fødselsdato = getFødselsdato(barn);
    const termindato = getTermindato(barn);
    const lagretUttaksplanInfo = useUttaksplanInfo<MorFarFødselAnnenForelderHarRettIEØSUttaksplanInfo>();
    const erDeltUttak = true;
    const erFødsel = søkersituasjon.situasjon === 'fødsel';
    const erFarEllerMedmor = isFarEllerMedmor(søkersituasjon.rolle);
    const familiehendelsesdato = getFamiliehendelsedato(barn);
    const familiehendelsesdatoDate = ISOStringToDate(familiehendelsesdato);
    const førsteUttaksdagNesteBarnsSak =
        state.barnFraNesteSak !== undefined ? state.barnFraNesteSak.startdatoFørsteStønadsperiode : undefined;

    const shouldRender = erFødsel;

    const onValidSubmitHandler = (values: Partial<MorFarFødselAnnenForelderHarRettIEØSFormData>) => {
        const submissionValues = mapMorFarFødselAnnenForelderHarRettIEØSFormToState(values);
        const antallUker = getAntallUker(tilgjengeligeStønadskontoer[values.dekningsgrad! === '100' ? 100 : 80]);
        const startdato = hasValue(values.permisjonStartdato) ? values.permisjonStartdato : undefined;

        return [
            actionCreator.setAntallUkerIUttaksplan(antallUker),
            actionCreator.setUttaksplanInfo(submissionValues),
            actionCreator.setDekningsgrad(getDekningsgradFromString(values.dekningsgrad)),
            actionCreator.lagUttaksplanforslag(
                lagUttaksplan({
                    annenForelderErUfør: false,
                    erDeltUttak,
                    erEndringssøknad,
                    erEnkelEndringssøknad: erEndringssøknad,
                    familiehendelsesdato: familiehendelsesdatoDate!,
                    førsteUttaksdagEtterSeksUker: Uttaksdagen(
                        Uttaksdagen(familiehendelsesdatoDate!).denneEllerNeste()
                    ).leggTil(30),
                    situasjon: søkersituasjon.situasjon,
                    søkerErFarEllerMedmor: erFarEllerMedmor,
                    søkerHarMidlertidigOmsorg: false,
                    tilgjengeligeStønadskontoer:
                        tilgjengeligeStønadskontoer[getDekningsgradFromString(values.dekningsgrad)],
                    uttaksplanSkjema: {
                        startdatoPermisjon: submissionValues.skalIkkeHaUttakFørTermin ? undefined : startdato,
                        farSinFørsteUttaksdag: erFarEllerMedmor ? startdato : undefined,
                    },
                    bareFarMedmorHarRett: false,
                    termindato: undefined,
                    harAktivitetskravIPeriodeUtenUttak: getHarAktivitetskravIPeriodeUtenUttak({
                        erDeltUttak,
                        morHarRett: true,
                        søkerErAleneOmOmsorg: false,
                    }),
                    annenForelderHarRettPåForeldrepengerIEØS: true,
                    førsteUttaksdagNesteBarnsSak,
                })
            ),
        ];
    };

    const { handleSubmit, isSubmitting } = useOnValidSubmit(
        onValidSubmitHandler,
        SøknadRoutes.UTTAKSPLAN,
        (state: ForeldrepengesøknadContextState) => storeAppState(state)
    );

    if (!shouldRender) {
        return null;
    }

    const erSøkerMor = !erFarEllerMedmor;
    const oppgittAnnenForelder = isAnnenForelderOppgitt(annenForelder) ? annenForelder : undefined;

    const navnAnnenPart = oppgittAnnenForelder
        ? formaterNavn(oppgittAnnenForelder.fornavn, oppgittAnnenForelder.etternavn, true)
        : '';

    const erDeltUttakINorge = false;

    const navnSøker = formaterNavn(fornavn, etternavn, true, mellomnavn);
    const navnMor = erSøkerMor ? navnSøker : navnAnnenPart;
    const navnFarMedmor = erSøkerMor ? navnAnnenPart : navnSøker;
    const antallBarn = barn.antallBarn;
    const tilgjengeligeStønadskontoer = getValgtStønadskontoFor80Og100Prosent(
        tilgjengeligeStønadskontoer80DTO,
        tilgjengeligeStønadskontoer100DTO
    );

    const visInfoOmPrematuruker =
        !erFarEllerMedmor && skalViseInfoOmPrematuruker(fødselsdato, termindato, søkersituasjon.situasjon);
    const ekstraDagerGrunnetPrematurFødsel = visInfoOmPrematuruker
        ? Tidsperioden({ fom: fødselsdato!, tom: termindato! }).getAntallUttaksdager() - 1
        : undefined;
    const førsteUttaksdag = Uttaksdagen(ISOStringToDate(familiehendelsesdato)!).denneEllerNeste();
    const defaultPermisjonStartdato = erFarEllerMedmor
        ? førsteUttaksdag
        : Uttaksdagen(førsteUttaksdag).trekkFra(uttaksConstants.ANTALL_UKER_FORELDREPENGER_FØR_FØDSEL * 5);
    return (
        <MorFarFødselAnnenForelderHarRettIEØSFormComponents.FormikWrapper
            initialValues={getInitialMorFarFødselAnnenForelderHarRettIEØSValues(
                defaultPermisjonStartdato,
                lagretUttaksplanInfo,
                dekningsgrad
            )}
            onSubmit={handleSubmit}
            renderForm={({ values: formValues, setFieldValue }) => {
                const visibility = morFarFødselAnnenForelderHarRettIEØSQuestionsConfig.getVisbility({
                    ...formValues,
                    erFarEllerMedmor,
                } as MorFarFødselAnnenForelderHarRettIEØSQuestionsPayload);

                return (
                    <MorFarFødselAnnenForelderHarRettIEØSFormComponents.Form
                        includeButtons={false}
                        includeValidationSummary={true}
                    >
                        <Block
                            padBottom="xl"
                            visible={visibility.isIncluded(MorFarFødselAnnenForelderHarRettIEØSFormField.dekningsgrad)}
                        >
                            <DekningsgradSpørsmål
                                FormKomponent={MorFarFødselAnnenForelderHarRettIEØSFormComponents}
                                dekningsgradFeltNavn={MorFarFødselAnnenForelderHarRettIEØSFormField.dekningsgrad}
                                tilgjengeligeStønadskontoer={tilgjengeligeStønadskontoer}
                                erDeltUttak={erDeltUttakINorge}
                            />
                        </Block>
                        <Block padBottom="xl" visible={visInfoOmPrematuruker === true}>
                            <GuidePanel>
                                <FormattedMessage
                                    id="uttaksplaninfo.veileder.informasjonPrematuruker"
                                    values={{
                                        antallprematuruker: Math.floor(ekstraDagerGrunnetPrematurFødsel! / 5),
                                        antallprematurdager: ekstraDagerGrunnetPrematurFødsel! % 5,
                                    }}
                                />
                            </GuidePanel>
                        </Block>
                        <Block
                            visible={
                                !erFarEllerMedmor &&
                                visibility.isIncluded(MorFarFødselAnnenForelderHarRettIEØSFormField.permisjonStartdato)
                            }
                        >
                            <StartdatoPermisjonMor
                                permisjonStartdato={formValues.permisjonStartdato!}
                                skalIkkeHaUttakFørTermin={formValues.skalIkkeHaUttakFørTermin!}
                            />
                        </Block>
                        <Block
                            padBottom="xl"
                            visible={
                                erFarEllerMedmor &&
                                visibility.isIncluded(MorFarFødselAnnenForelderHarRettIEØSFormField.permisjonStartdato)
                            }
                        >
                            <FarMedmorsFørsteDag
                                FormComponents={MorFarFødselAnnenForelderHarRettIEØSFormComponents}
                                fieldName={MorFarFødselAnnenForelderHarRettIEØSFormField.permisjonStartdato}
                                familiehendelsesdato={familiehendelsesdatoDate!}
                                setFieldValue={setFieldValue}
                                morsSisteDag={undefined}
                                navnMor={navnMor}
                                termindato={undefined}
                                situasjon={søkersituasjon.situasjon}
                                morHarRettTilForeldrepengerIEØS={true}
                            />
                        </Block>
                        <Block
                            padBottom="xl"
                            visible={
                                visibility.isAnswered(MorFarFødselAnnenForelderHarRettIEØSFormField.dekningsgrad) &&
                                antallBarn > 1 &&
                                (formValues.permisjonStartdato !== undefined ||
                                    formValues.skalIkkeHaUttakFørTermin === true)
                            }
                        >
                            <GuidePanel>
                                <FormattedMessage
                                    id="uttaksplaninfo.veileder.flerbarnsInformasjon.annenForelderHarRettIEØS"
                                    values={{
                                        uker: getFlerbarnsuker(formValues.dekningsgrad!, antallBarn),
                                        navnFar: navnFarMedmor,
                                        navnMor: navnMor,
                                    }}
                                />
                            </GuidePanel>
                        </Block>
                        <Block>
                            <StepButtonWrapper>
                                <Button variant="secondary" as={Link} to={getPreviousStepHref('uttaksplanInfo')}>
                                    <FormattedMessage id="backlink.label" />
                                </Button>
                                {visibility.areAllQuestionsAnswered() && (
                                    <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                                        {intlUtils(intl, 'søknad.gåVidere')}
                                    </Button>
                                )}
                            </StepButtonWrapper>
                        </Block>
                    </MorFarFødselAnnenForelderHarRettIEØSFormComponents.Form>
                );
            }}
        />
    );
};

export default MorFarFødselAnnenForelderHarRettIEØS;
