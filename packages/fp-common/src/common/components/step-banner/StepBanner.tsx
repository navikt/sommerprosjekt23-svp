import { Heading } from '@navikt/ds-react';
import React from 'react';
import Banner from '../banner/Banner';

interface StepBannerProps {
    text: string;
    level?: '1' | '2' | '3';
}

const StepBanner: React.FunctionComponent<StepBannerProps> = ({ text, level = '2' }) => (
    <Banner size="small">
        <Heading size="large" level={level}>
            {text}
        </Heading>
    </Banner>
);

export default StepBanner;
