import React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import Veilederinfo from 'common/components/veileder-info/Veilederinfo';
import getMessage from 'common/util/i18nUtils';
import Søknad from '../../../app/types/søknad/Søknad';
import SøkerPersonalia from 'common/components/søker-personalia/SøkerPersonalia';
import { erFarEllerMedmor, formaterNavn } from 'app/util/domain/personUtil';
import { Søkerinfo } from '../../../app/types/søkerinfo';
import { skalSøkerLasteOppTerminbekreftelse } from '../../../app/util/validation/steg/barn';
import Block from 'common/components/block/Block';
import AnnenForelderOppsummering from 'common/components/oppsummering/oppsummeringer/AnnenForelderOppsummering';
import RelasjonTilBarnOppsummering from 'common/components/oppsummering/oppsummeringer/RelasjonTilBarnOppsummering';
import UtenlandsoppholdOppsummering from 'common/components/oppsummering/oppsummeringer/UtenlandsoppholdOppsummering';
import InntektOppsummering from 'common/components/oppsummering/oppsummeringer/InntektOppsummering';
import Oppsummeringspanel from 'common/components/oppsummeringspanel/Oppsummeringspanel';
import './oppsummering.less';
import UttaksplanOppsummering from 'common/components/oppsummering/oppsummeringer/UttaksplanOppsummering';
import { getNavnPåForeldre } from '../../../app/util/uttaksplan';

interface OppsummeringProps {
    søkerinfo: Søkerinfo;
    søknad: Søknad;
}

type Props = OppsummeringProps & InjectedIntlProps;
class Oppsummering extends React.Component<Props> {
    render() {
        const { søkerinfo, søknad, intl } = this.props;
        const { person } = søkerinfo;
        return (
            <Block margin="m">
                <Veilederinfo>{getMessage(intl, 'oppsummering.veileder')}</Veilederinfo>
                <div className="oppsummering">
                    <Block margin="xs">
                        <SøkerPersonalia
                            navn={formaterNavn(person.fornavn, person.etternavn, person.mellomnavn)}
                            fnr={person.fnr}
                            kjønn={person.kjønn}
                        />
                    </Block>

                    <Oppsummeringspanel
                        tittel={getMessage(intl, 'oppsummering.relasjonTilBarn')}
                        tittelProps={'undertittel'}>
                        <RelasjonTilBarnOppsummering
                            barn={søknad.barn}
                            annenForelder={søknad.annenForelder}
                            situasjon={this.props.søknad.situasjon}
                            skalLasteOppTerminbekreftelse={skalSøkerLasteOppTerminbekreftelse(søknad, søkerinfo)}
                        />
                    </Oppsummeringspanel>

                    <Oppsummeringspanel
                        tittel={getMessage(intl, 'oppsummering.annenForelder')}
                        tittelProps={'undertittel'}>
                        <AnnenForelderOppsummering
                            annenForelder={søknad.annenForelder}
                            erAleneOmOmsorg={søknad.søker.erAleneOmOmsorg}
                            barn={søknad.barn}
                        />
                    </Oppsummeringspanel>

                    <Oppsummeringspanel
                        tittel={getMessage(intl, 'oppsummering.utenlandsopphold')}
                        tittelProps={'undertittel'}>
                        <UtenlandsoppholdOppsummering
                            informasjonOmUtenlandsopphold={søknad.informasjonOmUtenlandsopphold}
                            erBarnetFødt={søknad.barn.erBarnetFødt}
                        />
                    </Oppsummeringspanel>

                    <Oppsummeringspanel tittel={getMessage(intl, 'oppsummering.inntekt')} tittelProps={'undertittel'}>
                        <InntektOppsummering søker={søknad.søker} arbeidsforhold={søkerinfo.arbeidsforhold} />
                    </Oppsummeringspanel>

                    <Oppsummeringspanel tittel={getMessage(intl, 'oppsummering.uttak')} tittelProps={'undertittel'}>
                        <UttaksplanOppsummering
                            perioder={søknad.uttaksplan}
                            navnPåForeldre={getNavnPåForeldre(søknad, søkerinfo.person)}
                            erFarEllerMedmor={erFarEllerMedmor(søknad.søker.rolle)}
                        />
                    </Oppsummeringspanel>
                </div>
            </Block>
        );
    }
}
export default injectIntl(Oppsummering);