import getMessage from 'common/util/i18nUtils';
import { useIntl } from 'react-intl';

interface Props {
    tekst: string;
    url: string;
    lenkeTekst: string;
}

const EksternUrl: React.FunctionComponent<Props> = ({ tekst, url, lenkeTekst }) => {
    const intl = useIntl();

    return (
        <span>
            {getMessage(intl, tekst)}
            <a href={url} className="lenke" rel="noreferrer" target="_blank" style={{ marginLeft: 3 }}>
                {getMessage(intl, lenkeTekst)}
                <EksternIkon />
            </a>
        </span>
    );
};

const EksternIkon = () => (
    <svg
        className="eksternIkon"
        width="16px"
        height="16px"
        viewBox="0 0 24 24"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
    >
        <title>Ekstern lenke</title>
        <g stroke="none" strokeWidth="10" fill="none" fillRule="evenodd">
            <path
                d="M22.5217391,16.5696841 C22.5217391,16.3055479 22.7358638,16.0914232 23,16.0914232 C23.2641362,16.0914232 23.4782609,16.3055479 23.4782609,16.5696841 L23.4782609,19.3333333 C23.4782609,21.6225136 21.6225136,23.4782609 19.3333333,23.4782609 L4.66666667,23.4782609 C2.3774864,23.4782609 0.52173913,21.6225136 0.52173913,19.3333333 L0.52173913,4.66666667 C0.52173913,2.3774864 2.3774864,0.52173913 4.66666667,0.52173913 L7.47238494,0.52173913 C7.73652113,0.52173913 7.95064581,0.735863815 7.95064581,1 C7.95064581,1.26413618 7.73652113,1.47826087 7.47238494,1.47826087 L4.66666667,1.47826087 C2.90575877,1.47826087 1.47826087,2.90575877 1.47826087,4.66666667 L1.47826087,19.3333333 C1.47826087,21.0942412 2.90575877,22.5217391 4.66666667,22.5217391 L19.3333333,22.5217391 C21.0942412,22.5217391 22.5217391,21.0942412 22.5217391,19.3333333 L22.5217391,16.5696841 Z"
                fill="#0067C5"
            />
            <path
                d="M10.1381815,14.5381815 C9.95140902,14.724954 9.64859098,14.724954 9.4618185,14.5381815 C9.27504601,14.351409 9.27504601,14.048591 9.4618185,13.8618185 L22.6618185,0.661818496 C22.848591,0.475046009 23.151409,0.475046009 23.3381815,0.661818496 C23.524954,0.848590983 23.524954,1.15140902 23.3381815,1.3381815 L10.1381815,14.5381815 Z"
                fill="#0067C5"
            />
            <path
                d="M22.5217391,1.47826087 L14.2158243,1.47826087 C13.9516881,1.47826087 13.7375634,1.26413618 13.7375634,1 C13.7375634,0.735863815 13.9516881,0.52173913 14.2158243,0.52173913 L23.4782609,0.52173913 L23.4782609,9.93487469 C23.4782609,10.1990109 23.2641362,10.4131356 23,10.4131356 C22.7358638,10.4131356 22.5217391,10.1990109 22.5217391,9.93487469 L22.5217391,1.47826087 Z"
                fill="#0067C5"
            />
        </g>
    </svg>
);

export default EksternUrl;
