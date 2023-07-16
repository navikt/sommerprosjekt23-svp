import { bemUtils } from '@navikt/fp-common';
import { Tag, TagProps } from '@navikt/ds-react';
import './periodeTimelineView.css';

interface PeriodeTimelineViewProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
}

export const PeriodeTimelineView: React.FC<PeriodeTimelineViewProps> = ({ children }) => {
    const bem = bemUtils('periodeTimelineView');
    return <div className={bem.block}>{children}</div>;
};
//export default PeriodeTimelineView;
interface BaneHeaderBoksProps extends PeriodeTimelineViewProps {
    antall: number;
}
export const BaneHeaderBoks: React.FC<BaneHeaderBoksProps> = ({ children, antall }) => {
    const bem = bemUtils('periodeTimelineView');
    return (
        <div
            className={bem.element('baneHeaderBoks')}
            style={{
                gridTemplateColumns: `repeat(${antall}, 1fr)`,
            }}
        >
            {children}
        </div>
    );
};

const fargeRekkefølgeForTag: Array<TagProps['variant']> = [
    'info',
    'success',
    'warning',
    'error',
    'alt1',
    'alt2',
    'neutral',
];

interface BaneHeaderProps extends PeriodeTimelineViewProps {
    farge?: string;
    nr: number;
}
export const BaneHeader: React.FC<BaneHeaderProps> = ({ children, nr }) => {
    return (
        <div
            style={{
                gridColumn: `${nr}`,
            }}
        >
            {<Tag variant={fargeRekkefølgeForTag[nr - 1]}>{children}</Tag>}
        </div>
    );
};

interface SoyleProps extends PeriodeTimelineViewProps {
    start: string;
    slutt: string;
    farge: string;
}
export const Soyle: React.FC<SoyleProps> = ({ start, slutt, farge }) => {
    const bem = bemUtils('periodeTimelineView');
    return (
        <div
            className={bem.element('periode')}
            style={{ gridRow: `${start}/${slutt}`, backgroundColor: `light${farge}`, borderColor: `${farge}` }}
        ></div>
    );
};
interface YAkseAlleElementerProps extends PeriodeTimelineViewProps {
    height: string;
}

export const YAkseAlleElementer: React.FC<YAkseAlleElementerProps> = ({ children, height }) => {
    return (
        <div
            style={{
                display: 'grid',
                gridColumn: '1',
                gridRow: '2',
                gridTemplateRows: `repeat(${height}, 1px)`,
            }}
        >
            {children}
        </div>
    );
};

interface YAkseElementProps extends PeriodeTimelineViewProps {
    height: number;
    startPos: number;
}
export const YAkseElement: React.FC<YAkseElementProps> = ({ children, height, startPos }) => {
    //console.log(`${startPos} / ${startPos + height}`);
    return <div style={{ gridRow: `${startPos + 2}/${startPos + height}` }}>{children}</div>;
};

interface BaneProps extends PeriodeTimelineViewProps {
    nr: string;
    height?: string;
}

export const Bane: React.FC<BaneProps> = ({ children, nr, height }) => {
    const bem = bemUtils('periodeTimelineView');
    return (
        <div
            className={bem.element('bane')}
            style={{
                gridColumn: `${nr}`,
                gridTemplateRows: `repeat(${height}, 1px)`,
            }}
        >
            {children}
        </div>
    );
};

interface AlleBanerProps extends PeriodeTimelineViewProps {
    antall: string;
}

export const AlleBaner: React.FC<AlleBanerProps> = ({ children, antall }) => {
    const bem = bemUtils('periodeTimelineView');
    return (
        <div
            className={bem.element('alleBaner')}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${antall}, 1fr)`,
            }}
        >
            {children}
        </div>
    );
};

interface DatoPilBaneProps extends PeriodeTimelineViewProps {
    height?: string;
}

export const DatoPilBane: React.FC<DatoPilBaneProps> = ({ children, height }) => {
    const bem = bemUtils('periodeTimelineView');
    return (
        <div
            className={bem.element('datoPilbane')}
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${height}, 1px)`,
            }}
        >
            {children}
        </div>
    );
};

interface DatoPilProps extends PeriodeTimelineViewProps {
    nr: number;
    height?: string;
}

export const DatoPil: React.FC<DatoPilProps> = ({ children, nr, height }) => {
    const bem = bemUtils('periodeTimelineView');
    console.log('nr: ', nr, 'height: ', height);
    return (
        <div
            className={bem.element('datoPil')}
            style={{
                gridRow: `${nr}`,
                gridTemplateRows: `repeat(${height}, 1px)`,
            }}
            draggable={true}
            onDragStart={handleDrag}
        >
            {children}
        </div>
    );
};
function handleDrag(ev: React.DragEvent<HTMLDivElement>): void {
    const id = (ev.target as HTMLDivElement).id;
    ev.dataTransfer.setData('text/plain', id);
    console.log(ev.movementY.valueOf());
}
