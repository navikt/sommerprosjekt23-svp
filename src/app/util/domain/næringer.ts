import moment from 'moment';
import { Næring } from '../../types/søknad/SelvstendigNæringsdrivendeInformasjon';

export const erMindreEnn4ÅrSidenOppstart = (næring: Næring): boolean => {
    const { tidsperiode } = næring;

    const date4YearsAgo = moment()
        .subtract(4, 'years')
        .startOf('day');
    const startdato = moment(tidsperiode.fom).startOf('day');

    return date4YearsAgo.isSameOrBefore(startdato);
};
