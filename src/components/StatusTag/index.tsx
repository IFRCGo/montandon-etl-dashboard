import {
    Chip,
    type ChipProps,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props<N> extends ChipProps<N> {
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS' | 'ON_RETRY';
}

function StatusTag<const N>(props: Props<N>) {
    const {
        status,
        ...otherProps
    } = props;

    return (
        <Chip
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            className={_cs(
                styles.status,
                status === 'SUCCESS' && styles.success,
                status === 'FAILED' && styles.failed,
                status === 'PENDING' && styles.pending,
                status === 'IN_PROGRESS' && styles.inProgress,
                status === 'ON_RETRY' && styles.onRetry,
            )}
        />
    );
}
export default StatusTag;
