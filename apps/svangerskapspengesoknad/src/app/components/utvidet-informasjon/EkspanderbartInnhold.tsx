import classnames from 'classnames';
import { Collapse } from 'react-collapse';

import './ekspanderbartInnhold.less';

export interface Props {
    /** Innholdet som skal vises */
    children: React.ReactNode;
    /** Overstyre state for om den skal vises eller ikke */
    erApen?: boolean;
    /** Default off */
    ariaLive?: 'assertive' | 'polite' | 'off';
    /** Om skjul/vis skal animeres. Default true */
    animert?: boolean;
}

const EkspanderbartInnhold = ({ children, animert = true, erApen = false, ariaLive = 'off' }: Props) => {
    const content = <div aria-live={ariaLive}>{erApen ? <div>{children}</div> : <div />}</div>;
    if (!animert) {
        return content;
    }

    return (
        <Collapse
            isOpened={erApen}
            className={classnames('ekspanderbartInnhold', {
                'ekspanderbartInnhold--apen': erApen,
            })}
        >
            {content}
        </Collapse>
    );
};

export default EkspanderbartInnhold;
