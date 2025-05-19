import { createContext } from 'react';

type SetStateFn<T> = (newValue: T | undefined) => void;

export interface ExtractionDataContextProps {
    createdAt: string | undefined;
    setCreatedAt: SetStateFn<string>;

    source: string | undefined;
    setSource: SetStateFn<string>;

    status: string | undefined;
    setStatus: SetStateFn<string>;

    resetFilter: () => void;
    filtered: boolean;
}

function getDefaultStateFn(name: string) {
    return () => {
        // eslint-disable-next-line no-console
        console.warn(`AlertDataContext::${name} called without provider`);
    };
}

const ExtractionDataContext = createContext<ExtractionDataContextProps>({
    createdAt: undefined,
    setCreatedAt: getDefaultStateFn('setCreatedAt'),

    source: undefined,
    setSource: getDefaultStateFn('setSource'),

    status: undefined,
    setStatus: getDefaultStateFn('setStatus'),

    resetFilter: getDefaultStateFn('resetFilter'),
    filtered: false,
});

export default ExtractionDataContext;
