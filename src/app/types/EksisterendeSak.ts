import { Dekningsgrad, Tidsperiode } from 'common/types';
import { StønadskontoType, SaksperiodeUtsettelseÅrsakType, Periode } from './uttaksplan/periodetyper';

export enum FamiliehendelsesType {
    'ADOPSJON' = 'ADPSJN',
    'OMSORGSOVERTAKELSE' = 'OMSRGO',
    'FØDSEL' = 'FODSL',
    'TERM' = 'TERM'
}

export enum PeriodeResultatType {
    'INNVILGET' = 'INNVILGET',
    'AVSLÅTT' = 'AVSLÅTT',
    'IKKE_FASTSATT' = 'IKKE_FASTSATT',
    'MANUELL_BEHANDLING' = 'MANUELL_BEHANDLING'
}

export interface Saksgrunnlag {
    familieHendelseType: FamiliehendelsesType;
    familieHendelseDato: Date;
    dekningsgrad: Dekningsgrad;
    antallBarn: number;
    søkerErFarEllerMedmor: boolean;
    morErAleneOmOmsorg: boolean;
    morErUfør: boolean;
    morHarRett: boolean;
    farMedmorErAleneOmOmsorg: boolean;
    farMedmorHarRett: boolean;
    erBarnetFødt: boolean; // Utledet fra familieHendelseType
}

export interface Saksperiode {
    periodeResultatType: PeriodeResultatType;
    utsettelsePeriodeType?: SaksperiodeUtsettelseÅrsakType;
    graderingInnvilget: boolean;
    samtidigUttak: boolean;
    samtidigUttaksprosent: number;
    stønadskontotype: StønadskontoType;
    flerbarnsdager: boolean;
    trekkDager: number;
    arbeidstidprosent: number;
    utbetalingprosent: number;
    gjelderAnnenPart: boolean;
    tidsperiode: Tidsperiode;
}

export interface EksisterendeSak {
    grunnlag: Saksgrunnlag;
    saksperioder: Saksperiode[];
    uttaksplan: Periode[] | undefined;
}