import { Heading } from '@navikt/ds-react';
import './saksoversikt.css';
interface Props {
    svangerskapSak: boolean;
    skjermStørreEnn800: boolean;
    componentA: JSX.Element;
    componentB: JSX.Element;
    componentC: JSX.Element;
    componentD: JSX.Element;
    componentE: JSX.Element;
    componentF: JSX.Element;
}

export const SvangerskapDashboardwrapper: React.FC<Props> = ({
    svangerskapSak,
    skjermStørreEnn800,
    componentA,
    componentB,
    componentC,
    componentD,
    componentE,
    componentF,
}) => {
    const komponenter =
        skjermStørreEnn800 && svangerskapSak
            ? [
                  svangerskapSak && componentC,
                  svangerskapSak && componentD,
                  componentE,
                  componentA,
                  componentB,
                  componentF,
              ]
            : [
                  componentA,
                  componentB,
                  svangerskapSak && componentC,
                  svangerskapSak && componentD,
                  componentE,
                  componentF,
              ];

    return (
        <>
            {skjermStørreEnn800 && svangerskapSak ? (
                <div className="dashboard">
                    <div className="dasboardSeksjon">
                        {komponenter[3]}
                        {komponenter[4]}
                    </div>
                    <div className="dasboardSeksjon">
                        <Heading size="medium" spacing>
                            Ressurser
                        </Heading>
                        {komponenter[2]}
                    </div>

                    <div style={{ gridColumn: '1 / 3' }}>
                        <Heading size="medium" spacing>
                            Dine Svangerskapspenger
                        </Heading>
                    </div>
                    <div className="dasboardSeksjon">{komponenter[1]}</div>
                    <div className="dasboardSeksjon">
                        {komponenter[0]} {komponenter[5]}
                    </div>
                </div>
            ) : (
                <>
                    {komponenter[0]}
                    {komponenter[1]}
                    <h2>Innsyn</h2>
                    {komponenter[4]}
                    <Heading size="medium" spacing>
                        Dine Svangerskapspenger
                    </Heading>
                    {komponenter[2]}
                    {komponenter[3]}
                </>
            )}
        </>
    );
};
