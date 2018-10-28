import moment from 'moment';
import { Periode } from '../../../types/uttaksplan/periodetyper';
import { Periodene } from '../../uttaksplan/Periodene';
import { today } from '../values';

export const førsteUttakErInnenforKommendeSeksUker = (perioder: Periode[]): boolean => {
    const førsteUttaksdag = Periodene(perioder).getFørsteUttaksdag();
    if (førsteUttaksdag) {
        const førsteMuligeSøknadsdag = getFørsteMuligeSøknadsdagGittUttak(førsteUttaksdag);
        return (
            moment(førsteMuligeSøknadsdag).isSameOrBefore(today, 'day') ||
            moment(today).isBefore(moment(new Date(2019, 0, 1)))
        );
    }
    return true;
};

export const getFørsteMuligeSøknadsdagGittUttak = (førsteUttak: Date): Date => {
    return moment(førsteUttak)
        .subtract(6, 'weeks')
        .toDate();
};
