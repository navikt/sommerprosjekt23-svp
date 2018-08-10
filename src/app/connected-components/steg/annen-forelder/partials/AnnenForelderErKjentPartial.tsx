import React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ForeldreansvarBarn } from '../../../../types/søknad/Barn';
import { AnnenForelderPartial } from '../../../../types/søknad/AnnenForelder';
import RettPåForeldrepengerSpørsmål from '../../../../spørsmål/RettPåForeldrepengerSpørsmål';
import ErMorUførSpørsmål from '../../../../spørsmål/ErMorUførSpørsmål';

import søknadActions from '../../../../redux/actions/søknad/søknadActionCreators';
import { DispatchProps } from 'common/redux/types';
import Spørsmål from 'common/components/spørsmål/Spørsmål';
import ErDenAndreForelderenInformertSpørsmål from '../../../../spørsmål/ErDenAndreForelderenInformertSpørsmål';
import SkalFarEllerMedmorHaForeldrepengerSpørsmål from '../../../../spørsmål/SkalFarEllerMedmorHaForeldrepengerSpørsmål';
import getMessage from 'common/util/i18nUtils';
import Veilederinfo from 'common/components/veileder-info/Veilederinfo';
import Bolk from '../../../../../common/components/bolk/Bolk';
import { SøkerPartial } from '../../../../types/søknad/Søker';
import AttachmentsUploaderPure from 'common/storage/attachment/components/AttachmentUploaderPure';
import { Attachment } from 'common/storage/attachment/types/Attachment';
import { AttachmentType } from '../../../../types/søknad/Søknad';
import DatoInput from 'common/wrappers/skjemaelementer/DatoInput';
import { connect } from 'react-redux';
import { AppState } from '../../../../redux/reducers';

interface StateProps {
    barn: Partial<ForeldreansvarBarn>;
    annenForelder: Partial<AnnenForelderPartial>;
    søker: SøkerPartial;
}

interface AnnenForelderErKjentPartialProps {
    registrertAnnenForelder: any;
    erFarEllerMedmor: boolean;
    visInformasjonVedOmsorgsovertakelse: boolean;
}

type Props = AnnenForelderErKjentPartialProps &
    StateProps &
    InjectedIntlProps &
    DispatchProps;

class AnnenForelderErKjentPartial extends React.Component<Props> {
    render() {
        const {
            barn,
            annenForelder,
            søker,
            erFarEllerMedmor,
            registrertAnnenForelder,
            visInformasjonVedOmsorgsovertakelse,
            dispatch,
            intl
        } = this.props;

        const harDenAndreForelderenOpplystOmSinPågåendeSak =
            registrertAnnenForelder &&
            registrertAnnenForelder.harOpplystOmSinPågåendeSak;

        const navn = registrertAnnenForelder
            ? registrertAnnenForelder.navn
            : annenForelder.navn;

        return (
            <React.Fragment>
                <Spørsmål
                    synlig={!erFarEllerMedmor && søker.erAleneOmOmsorg === true}
                    render={() => (
                        <React.Fragment>
                            <Veilederinfo>
                                Informasjon om deling av uttak og at den andre
                                kan ta perm.
                            </Veilederinfo>
                            <SkalFarEllerMedmorHaForeldrepengerSpørsmål
                                navn={annenForelder.navn}
                                skalFarEllerMedmorHaForeldrepenger={
                                    annenForelder.skalHaForeldrepenger
                                }
                                onChange={(skalHaForeldrepenger: boolean) => {
                                    dispatch(
                                        søknadActions.updateAnnenForelder({
                                            skalHaForeldrepenger
                                        })
                                    );
                                }}
                            />
                        </React.Fragment>
                    )}
                />

                <Spørsmål
                    synlig={
                        annenForelder.skalHaForeldrepenger === true ||
                        (!søker.erAleneOmOmsorg &&
                            !harDenAndreForelderenOpplystOmSinPågåendeSak)
                    }
                    render={() => (
                        <RettPåForeldrepengerSpørsmål
                            navn={navn}
                            harAnnenForelderRettPåForeldrepenger={
                                annenForelder.harRettPåForeldrepenger
                            }
                            onChange={(harRettPåForeldrepenger: boolean) =>
                                dispatch(
                                    søknadActions.updateAnnenForelder({
                                        harRettPåForeldrepenger
                                    })
                                )
                            }
                        />
                    )}
                />

                <Spørsmål
                    synlig={
                        annenForelder.harRettPåForeldrepenger === false &&
                        erFarEllerMedmor
                    }
                    render={() => (
                        <ErMorUførSpørsmål
                            navn={navn}
                            erUfør={annenForelder.erUfør}
                            onChange={(erUfør: boolean) =>
                                dispatch(
                                    søknadActions.updateAnnenForelder({
                                        erUfør
                                    })
                                )
                            }
                        />
                    )}
                />

                <Bolk
                    synlig={
                        annenForelder.harRettPåForeldrepenger === true ||
                        (annenForelder.skalHaForeldrepenger === true &&
                            annenForelder.harRettPåForeldrepenger !== undefined)
                    }
                    render={() => (
                        <Veilederinfo>
                            Informasjon om rettigheter og deling av uttaksplan
                        </Veilederinfo>
                    )}
                />

                <Spørsmål
                    synlig={
                        (søker.erAleneOmOmsorg === false &&
                            annenForelder.harRettPåForeldrepenger === true) ||
                        (søker.erAleneOmOmsorg === false &&
                            harDenAndreForelderenOpplystOmSinPågåendeSak ===
                                true &&
                            erFarEllerMedmor)
                    }
                    render={() => (
                        <ErDenAndreForelderenInformertSpørsmål
                            navn={navn}
                            erDenAndreForelderenInformert={
                                annenForelder.erInformertOmSøknaden
                            }
                            onChange={(erInformertOmSøknaden: boolean) =>
                                dispatch(
                                    søknadActions.updateAnnenForelder({
                                        erInformertOmSøknaden
                                    })
                                )
                            }
                        />
                    )}
                />

                {erFarEllerMedmor && (
                    <React.Fragment>
                        <Spørsmål
                            synlig={søker.erAleneOmOmsorg === true}
                            render={() => (
                                <DatoInput
                                    id="omsorgsovertakelseDato"
                                    label={getMessage(
                                        intl,
                                        'omsorgsovertakelseDato.spørsmål'
                                    )}
                                    onChange={(foreldreansvarsdato: Date) => {
                                        dispatch(
                                            søknadActions.updateBarn({
                                                foreldreansvarsdato
                                            })
                                        );
                                    }}
                                    dato={barn.foreldreansvarsdato}
                                />
                            )}
                        />

                        <Spørsmål
                            animert={true}
                            synlig={barn.foreldreansvarsdato !== undefined}
                            render={() => (
                                <AttachmentsUploaderPure
                                    attachments={
                                        barn.omsorgsovertakelse
                                            ? barn.omsorgsovertakelse
                                            : []
                                    }
                                    attachmentType={
                                        AttachmentType.OMSROGSOVERTAKELSE
                                    }
                                    onFilesSelect={(
                                        attachments: Attachment[]
                                    ) => {
                                        attachments.forEach(
                                            (attachment: Attachment) => {
                                                dispatch(
                                                    søknadActions.uploadAttachment(
                                                        attachment
                                                    )
                                                );
                                            }
                                        );
                                    }}
                                    onFileDelete={(attachment: Attachment) =>
                                        dispatch(
                                            søknadActions.deleteAttachment(
                                                attachment
                                            )
                                        )
                                    }
                                />
                            )}
                        />

                        <Bolk
                            synlig={visInformasjonVedOmsorgsovertakelse}
                            render={() => (
                                <Veilederinfo>
                                    Du kan få 46/56 uker eller det som er igjen
                                    av permisjonen
                                </Veilederinfo>
                            )}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return {
        annenForelder: state.søknad.annenForelder,
        søker: state.søknad.søker,
        barn: state.søknad.barn
    };
};

export default connect(mapStateToProps)(
    injectIntl(AnnenForelderErKjentPartial)
);
