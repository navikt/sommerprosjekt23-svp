import moment from 'moment';
import { guid } from 'nav-frontend-js-utils';
import { Periode, Periodetype, PeriodeHull } from '../../../types/uttaksplan/periodetyper';
import { Periodene, sorterPerioder } from '../Periodene';
import { Tidsperioden, getTidsperiode } from '../Tidsperioden';
import { Uttaksdagen } from '../Uttaksdagen';
import { Perioden } from '../Perioden';
import { Tidsperiode } from 'nav-datovelger/src/datovelger/types';

export const UttaksplanBuilder = (perioder: Periode[], familiehendelsesdato: Date) => {
    return new UttaksplanAutoBuilder(perioder, familiehendelsesdato);
};

const periodeHasValidTidsrom = (periode: Periode): boolean =>
    periode.tidsperiode.fom !== undefined && periode.tidsperiode.tom !== undefined;

class UttaksplanAutoBuilder {
    protected familiehendelsesdato: Date;

    public constructor(public perioder: Periode[], familiehendelsesdato: Date) {
        this.perioder = perioder;
        this.familiehendelsesdato = familiehendelsesdato;
    }

    buildUttaksplan() {
        const perioderFørFamDato = Periodene(this.perioder).getPerioderFørFamiliehendelsesdato(
            this.familiehendelsesdato
        );
        const perioderEtterFamDato = Periodene(this.perioder).getPerioderEtterFamiliehendelsesdato(
            this.familiehendelsesdato
        );
        const perioderMedUgyldigTidsperiode = Periodene(this.perioder).getPerioderMedUgyldigTidsperiode();

        const utsettelser = Periodene(perioderEtterFamDato).getUtsettelser();
        const opphold = Periodene(perioderEtterFamDato).getOpphold();
        const hull = Periodene(perioderEtterFamDato).getHull();
        const uttaksperioder = Periodene(perioderEtterFamDato).getUttak();
        const overføringer = Periodene(perioderEtterFamDato).getOverføringer();

        this.perioder = resetTidsperioder([...uttaksperioder, ...overføringer]);

        const fastePerioder: Periode[] = [...opphold, ...utsettelser, ...hull].sort(sorterPerioder);
        this.perioder = [...perioderFørFamDato, ...settInnPerioder(this.perioder, fastePerioder)];
        this.finnOgSettInnHull()
            .slåSammenLikePerioder()
            .fjernHullPåStarten()
            .fjernHullPåSlutten()
            .sort();
        this.perioder = [...this.perioder, ...perioderMedUgyldigTidsperiode];
        return this;
    }

    leggTilPeriodeOgBuild(periode: Periode) {
        this.slåSammenLikePerioder();
        this.justerHullRundtPeriode(periode);
        this.perioder = settInnPeriode(this.perioder, {
            ...periode
        });
        this.buildUttaksplan();
        return this;
    }

    oppdaterPeriodeOgBuild(periode: Periode, skip = false) {
        const oldPeriode = periode.id ? Periodene(this.perioder).getPeriode(periode.id) : undefined;

        if (!oldPeriode) {
            throw new Error('Periode for endring ikke funnet');
        }
        if (Tidsperioden(periode.tidsperiode).erFomEllerEtterDato(this.familiehendelsesdato)) {
            this.oppdaterPerioderVedEndretPeriode(periode, oldPeriode);
        }

        this.erstattPeriode(periode).buildUttaksplan();

        return this;
    }

    slettPeriodeOgBuild(periode: Periode) {
        this.slettPeriode(periode, skalSlettetPeriodeErstattesMedHull(periode, this.perioder)).buildUttaksplan();
        return this;
    }

    private slettPeriode(periode: Periode, erstattMedHull?: boolean) {
        this.perioder = this.perioder.filter((p) => p.id !== periode.id);
        if (erstattMedHull) {
            this.perioder.push({
                id: guid(),
                type: Periodetype.Hull,
                tidsperiode: { ...periode.tidsperiode }
            });
        }
        return this;
    }

    private erstattPeriode(periode: Periode) {
        this.perioder = this.perioder.map((p) => (p.id === periode.id ? periode : p));
        return this;
    }

    private oppdaterPerioderVedEndretPeriode(periode: Periode, oldPeriode: Periode) {
        if (Tidsperioden(periode.tidsperiode).erLik(oldPeriode.tidsperiode)) {
            return this;
        }
        this.justerHullRundtPeriode(periode);
        const nyePeriodehull = periodeHasValidTidsrom(periode)
            ? finnHullVedEndretTidsperiode(oldPeriode, periode)
            : undefined;
        if (nyePeriodehull) {
            this.perioder = this.perioder.concat(nyePeriodehull);
            this.sort();
        }
        return this;
    }

    private justerHullRundtPeriode(periode: Periode) {
        this.perioder = fjernPeriodehullIPeriodetidsrom(this.perioder, periode);
        return this;
    }

    private slåSammenLikePerioder() {
        this.perioder = slåSammenLikePerioder(this.perioder);
        return this;
    }

    private fjernHullPåStarten() {
        while (this.perioder.findIndex((p) => p.type === Periodetype.Hull) === 0) {
            this.perioder.shift();
        }
        return this;
    }

    private fjernHullPåSlutten() {
        this.perioder.reverse();
        this.fjernHullPåStarten();
        this.perioder.reverse();
        return this;
    }

    private finnOgSettInnHull() {
        const hull = finnHull(this.perioder);
        this.perioder = [...this.perioder, ...hull].sort(sorterPerioder);
        return this;
    }

    private sort() {
        this.perioder.sort(sorterPerioder);
        return this;
    }
}

function fjernPeriodehullIPeriodetidsrom(perioder: Periode[], periode: Periode): Periode[] {
    const nyePerioder: Periode[] = perioder.filter((p) => p.type !== Periodetype.Hull);
    const periodehull = perioder.filter((p) => p.type === Periodetype.Hull);
    periodehull.forEach((o) => {
        if (Tidsperioden(o.tidsperiode).erOmsluttetAv(periode.tidsperiode)) {
            return;
        } else if (Tidsperioden(o.tidsperiode).erUtenfor(periode.tidsperiode)) {
            nyePerioder.push(o);
        } else if (moment(o.tidsperiode.fom).isBefore(periode.tidsperiode.fom, 'day')) {
            nyePerioder.push({
                ...o,
                tidsperiode: {
                    fom: o.tidsperiode.fom,
                    tom: Uttaksdagen(periode.tidsperiode.fom).forrige()
                }
            });
        } else {
            nyePerioder.push({
                ...o,
                tidsperiode: {
                    fom: Uttaksdagen(periode.tidsperiode.tom).neste(),
                    tom: o.tidsperiode.tom
                }
            });
        }
    });
    return nyePerioder;
}

function settInnPerioder(perioder: Periode[], perioder2: Periode[]): Periode[] {
    if (perioder.length === 0) {
        return perioder;
    }
    let nyePerioder: Periode[] = [...perioder];
    perioder2.sort(sorterPerioder).forEach((periode) => {
        nyePerioder = settInnPeriode(nyePerioder, periode);
    });
    return nyePerioder.sort(sorterPerioder);
}

function settInnPeriode(perioder: Periode[], nyPeriode: Periode): Periode[] {
    if (perioder.length === 0) {
        return [nyPeriode];
    }
    const berørtePerioder = Periodene(perioder).finnOverlappendePerioder(nyPeriode);
    const periodeSomMåSplittes = Periodene(perioder).finnPeriodeMedDato(nyPeriode.tidsperiode.fom);
    if (berørtePerioder.length === 0 && !periodeSomMåSplittes) {
        return [...perioder, nyPeriode];
    }

    if (!periodeSomMåSplittes) {
        const foregåendePeriode = Periodene(perioder)
            .finnAlleForegåendePerioder(nyPeriode)
            .pop();
        if (foregåendePeriode) {
            return leggTilPeriodeEtterPeriode(perioder, foregåendePeriode, nyPeriode);
        }
        return leggTilPeriodeFørPeriode(perioder, perioder[0], nyPeriode);
    }

    if (Perioden(periodeSomMåSplittes).erUtsettelse()) {
        throw new Error('Kan ikke dele opp en utsettelse');
    }
    if (moment(periodeSomMåSplittes.tidsperiode.fom).isSame(nyPeriode.tidsperiode.fom, 'day')) {
        return leggTilPeriodeEtterPeriode(perioder, periodeSomMåSplittes, nyPeriode);
    } else {
        return leggTilPeriodeIPeriode(perioder, periodeSomMåSplittes, nyPeriode);
    }
}

function finnHull(perioder: Periode[]): PeriodeHull[] {
    const hull: PeriodeHull[] = [];
    const len = perioder.length;
    perioder.forEach((periode, idx) => {
        if (idx === len - 1) {
            return;
        }
        const nestePeriode = perioder[idx + 1];

        const tidsperiodeMellomPerioder: Tidsperiode = {
            fom: Uttaksdagen(periode.tidsperiode.tom).neste(),
            tom: Uttaksdagen(nestePeriode.tidsperiode.fom).forrige()
        };
        if (moment(tidsperiodeMellomPerioder.tom).isBefore(tidsperiodeMellomPerioder.fom, 'day')) {
            return;
        }

        const uttaksdagerITidsperiode = Tidsperioden(tidsperiodeMellomPerioder).getAntallUttaksdager();
        if (uttaksdagerITidsperiode > 0) {
            hull.push({
                id: guid(),
                type: Periodetype.Hull,
                tidsperiode: tidsperiodeMellomPerioder
            });
        }
    });
    return hull;
}

function resetTidsperioder(perioder: Periode[]): Periode[] {
    let forrigePeriode: Periode;
    const sammenslåttePerioder = slåSammenLikePerioder(perioder.sort(sorterPerioder)) as Periode[];
    const resattePerioder = sammenslåttePerioder.map((periode) => {
        if (forrigePeriode === undefined) {
            forrigePeriode = periode;
            return periode;
        }
        forrigePeriode = {
            ...periode,
            tidsperiode: getTidsperiode(
                Uttaksdagen(forrigePeriode.tidsperiode.tom).neste(),
                Tidsperioden(periode.tidsperiode).getAntallUttaksdager()
            )
        };
        return {
            ...periode,
            tidsperiode: { ...forrigePeriode.tidsperiode }
        };
    });

    return resattePerioder;
}

export function slåSammenLikePerioder(perioder: Periode[]): Periode[] {
    if (perioder.length <= 1) {
        return perioder;
    }
    const nyePerioder: Periode[] = [];
    let forrigePeriode: Periode | undefined = { ...perioder[0] };
    perioder.forEach((periode, index) => {
        if (index === 0) {
            return;
        }
        if (forrigePeriode === undefined) {
            forrigePeriode = periode;
            return;
        }
        if (Perioden(forrigePeriode).erLik(periode) && Perioden(forrigePeriode).erSammenhengende(periode)) {
            forrigePeriode.tidsperiode.tom = periode.tidsperiode.tom;
            return;
        } else {
            nyePerioder.push(forrigePeriode);
            forrigePeriode = undefined;
        }
        forrigePeriode = periode;
    });
    nyePerioder.push(forrigePeriode);

    return nyePerioder;
}

function leggTilPeriodeEtterPeriode(perioder: Periode[], periode: Periode, nyPeriode: Periode): Periode[] {
    const perioderFør = Periodene(perioder).finnAlleForegåendePerioder(periode);
    const perioderEtter = Periodene(perioder).finnAllePåfølgendePerioder(periode);
    const uttaksdagerIUtsettelse: number = Tidsperioden(nyPeriode.tidsperiode).getAntallUttaksdager();
    return [
        ...perioderFør,
        ...[nyPeriode],
        ...Periodene([periode, ...perioderEtter]).forskyvPerioder(uttaksdagerIUtsettelse)
    ];
}

function leggTilPeriodeFørPeriode(perioder: Periode[], periode: Periode, nyPeriode: Periode): Periode[] {
    const perioderEtter = Periodene(perioder).finnAllePåfølgendePerioder(periode);
    const uttaksdagerIUtsettelse: number = Tidsperioden(nyPeriode.tidsperiode).getAntallUttaksdager();
    return [...[nyPeriode], ...Periodene([periode, ...perioderEtter]).forskyvPerioder(uttaksdagerIUtsettelse)];
}

function leggTilPeriodeIPeriode(perioder: Periode[], periode: Periode, nyPeriode: Periode): Periode[] {
    const perioderFør = Periodene(perioder).finnAlleForegåendePerioder(periode);
    const perioderEtter = Periodene(perioder).finnAllePåfølgendePerioder(periode);
    const splittetPeriode = splittPeriodeMedPeriode(periode, nyPeriode);
    const opprinneligVarighet = Perioden(periode).getAntallUttaksdager();
    const nyVarighet = Tidsperioden({
        fom: splittetPeriode[0].tidsperiode.fom,
        tom: splittetPeriode[2].tidsperiode.tom // Ta høyde for at split inneholdt opphold
    }).getAntallUttaksdager();
    const uttaksdager = nyVarighet - opprinneligVarighet;
    return [...perioderFør, ...splittetPeriode, ...Periodene(perioderEtter).forskyvPerioder(uttaksdager)];
}

function splittPeriodeMedPeriode(periode: Periode, nyPeriode: Periode): Periode[] {
    const dagerIPeriode = Tidsperioden(periode.tidsperiode).getAntallUttaksdager();
    const dagerForsteDel = Tidsperioden({
        fom: periode.tidsperiode.fom,
        tom: moment(nyPeriode.tidsperiode.fom)
            .subtract(1, 'day')
            .toDate()
    }).getAntallUttaksdager();
    let dagerSisteDel = dagerIPeriode - dagerForsteDel;
    const forste: Periode = {
        ...periode,
        tidsperiode: {
            fom: periode.tidsperiode.fom,
            tom: Uttaksdagen(nyPeriode.tidsperiode.fom).forrige()
        }
    };
    const midt: Periode = {
        ...nyPeriode,
        tidsperiode: {
            fom: Uttaksdagen(nyPeriode.tidsperiode.fom).denneEllerNeste(),
            tom: Uttaksdagen(nyPeriode.tidsperiode.tom).denneEllerNeste()
        }
    };
    const startSisteDel: Date = Uttaksdagen(midt.tidsperiode.tom).neste();

    if (Perioden(periode).erOpphold()) {
        dagerSisteDel = dagerSisteDel - Perioden(midt).getAntallUttaksdager();
    }

    const siste: Periode = {
        ...periode,
        id: guid(),
        tidsperiode: getTidsperiode(startSisteDel, dagerSisteDel)
    };
    return [forste, midt, siste];
}

function finnHullVedEndretTidsperiode(oldPeriode: Periode, periode: Periode): PeriodeHull[] | undefined {
    if (periodeHasValidTidsrom(periode) === false || periodeHasValidTidsrom(oldPeriode) === false) {
        return undefined;
    }
    /*
     TODO - sjekk at ikke opphold kolliderer med andre perioder
     */
    const periodehull: PeriodeHull[] = [];
    const diffStartdato = Uttaksdagen(oldPeriode.tidsperiode.fom).getUttaksdagerFremTilDato(periode.tidsperiode.fom);
    if (diffStartdato > 0) {
        periodehull.push({
            id: guid(),
            type: Periodetype.Hull,
            tidsperiode: getTidsperiode(oldPeriode.tidsperiode.fom, diffStartdato)
        });
    }
    const diffSluttdato = Uttaksdagen(oldPeriode.tidsperiode.tom).getUttaksdagerFremTilDato(periode.tidsperiode.tom);
    if (diffSluttdato < 0) {
        periodehull.push({
            id: guid(),
            type: Periodetype.Hull,
            tidsperiode: {
                fom: Uttaksdagen(periode.tidsperiode.tom).neste(),
                tom: oldPeriode.tidsperiode.tom
            }
        });
    }
    return periodehull.length > 0 ? periodehull : undefined;
}

function skalSlettetPeriodeErstattesMedHull(periode: Periode, perioder: Periode[]): boolean {
    const idx = perioder.findIndex((p) => p.id === periode.id);
    if (idx === 0 || idx === perioder.length - 1) {
        return false;
    }
    return periode.type !== Periodetype.Utsettelse;
}