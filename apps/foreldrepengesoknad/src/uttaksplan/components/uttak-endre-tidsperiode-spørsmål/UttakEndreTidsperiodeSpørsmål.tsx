import { useIntl } from 'react-intl';
import { isForeldrepengerFørFødselUttaksperiode, Periode, Utsettelsesperiode } from 'uttaksplan/types/Periode';
import dayjs from 'dayjs';
import { getTidsperiode, Tidsperioden } from 'app/steps/uttaksplan-info/utils/Tidsperioden';
import TidsperiodeForm, { TidsperiodeFormValues } from '../uttaks-forms/tidsperiode-form/TidsperiodeForm';
import { Block, intlUtils, Tidsperiode, TidsperiodeDate } from '@navikt/fp-common';
import { getUkerOgDagerFromDager } from 'app/utils/dateUtils';
import UkerDagerTeller from './../uker-dager-teller/UkerDagerTeller';
import { Situasjon } from 'app/types/Situasjon';
import { Modal } from '@navikt/ds-react';

interface Props {
    periode: Periode;
    tidsperiode: TidsperiodeDate;
    familiehendelsesdato: Date;
    ugyldigeTidsperioder: Tidsperiode[] | undefined;
    utsettelserIPlan: Utsettelsesperiode[];
    visible: boolean;
    onAvbryt: () => void;
    onBekreft: (tidsperiode: TidsperiodeFormValues) => void;
    changeTidsperiode: (tidsperiode: Partial<TidsperiodeDate>) => void;
    erFarEllerMedmor: boolean;
    morHarRett: boolean;
    situasjon: Situasjon;
    erFarMedmorOgHarAleneomsorg: boolean;
    termindato?: Date;
}

const UttakEndreTidsperiodeSpørsmål: React.FunctionComponent<Props> = ({
    onBekreft,
    onAvbryt,
    changeTidsperiode,
    visible,
    periode,
    tidsperiode,
    familiehendelsesdato,
    ugyldigeTidsperioder,
    utsettelserIPlan,
    termindato,
    erFarEllerMedmor,
    morHarRett,
    situasjon,
    erFarMedmorOgHarAleneomsorg,
}) => {
    const intl = useIntl();
    const erForeldrepengerFørFødsel = isForeldrepengerFørFødselUttaksperiode(periode);
    const initialMonth = erForeldrepengerFørFødsel ? familiehendelsesdato : undefined;
    const varighetIDager = dayjs(tidsperiode.fom).isSameOrBefore(tidsperiode.tom, 'day')
        ? Tidsperioden({
              fom: tidsperiode.fom,
              tom: tidsperiode.tom,
          }).getAntallUttaksdager()
        : undefined;
    const { uker, dager } = varighetIDager ? getUkerOgDagerFromDager(Math.abs(varighetIDager)) : { uker: 0, dager: 0 };
    const handleOnSubmit = (values: TidsperiodeFormValues) => {
        onBekreft(values);
    };

    const getDagValue = (uker: number, dager: number): number => {
        if (dager >= 5) {
            return 0;
        }

        if (uker === 0 && dager === 0) {
            return 1;
        }

        return dager;
    };

    return (
        <>
            <Modal open={visible} closeButton={true} onClose={onAvbryt} aria-label="Endre tidsperiode">
                <Modal.Content>
                    <TidsperiodeForm
                        familiehendelsesdato={familiehendelsesdato}
                        onBekreft={handleOnSubmit}
                        periode={periode}
                        tidsperiode={tidsperiode}
                        ugyldigeTidsperioder={ugyldigeTidsperioder}
                        utsettelserIPlan={utsettelserIPlan}
                        initialMonth={initialMonth}
                        termindato={termindato}
                        erFarEllerMedmor={erFarEllerMedmor}
                        morHarRett={morHarRett}
                        situasjon={situasjon}
                        erFarMedmorOgHarAleneomsorg={erFarMedmorOgHarAleneomsorg}
                    />
                </Modal.Content>
            </Modal>
            <Block padBottom="m">
                <UkerDagerTeller
                    ukeLegend={intlUtils(intl, 'uker.label')}
                    dagLegend={intlUtils(intl, 'dager.label')}
                    ukeStepper={{
                        value: uker !== undefined ? uker : 0,
                        min: 0,
                        max: 100,
                        onChange: (nyUker: number) => {
                            const date = tidsperiode.fom;
                            if (date) {
                                changeTidsperiode({
                                    fom: date,
                                    tom: getTidsperiode(date, Math.min(nyUker, 200) * 5 + getDagValue(nyUker, dager))
                                        .tom,
                                });
                            }
                        },
                        increaseAriaLabel: 'Øk antall uker med en uke',
                        decreaseAriaLabel: 'Mink antall uker med en uke',
                    }}
                    dagStepper={{
                        value: getDagValue(uker, dager),
                        min: uker === 0 ? 1 : 0,
                        max: 5,
                        onChange: (nyDager: number) => {
                            const date = tidsperiode.fom;
                            const ekstraUke = nyDager === 5 ? 1 : 0;

                            if (date) {
                                changeTidsperiode({
                                    fom: date,
                                    tom: getTidsperiode(date, (uker + ekstraUke) * 5 + getDagValue(uker, nyDager)).tom,
                                });
                            }
                        },
                        increaseAriaLabel: 'Øk antall dager med en dag',
                        decreaseAriaLabel: 'Mink antall dager med en dag',
                    }}
                />
            </Block>
        </>
    );
};

export default UttakEndreTidsperiodeSpørsmål;
