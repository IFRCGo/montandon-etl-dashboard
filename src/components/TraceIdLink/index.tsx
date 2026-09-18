import { Button } from '@ifrc-go/ui';

import styles from './styles.module.css';

export interface Props {
    traceId: string;
    onClick: (traceId: string) => void;
}

function TraceIdLink(props: Props) {
    const {
        traceId,
        onClick,
    } = props;

    return (
        <Button
            name={traceId}
            variant="tertiary"
            onClick={onClick}
            className={styles.traceIdLink}
        >
            {traceId}
        </Button>
    );
}

export default TraceIdLink;
