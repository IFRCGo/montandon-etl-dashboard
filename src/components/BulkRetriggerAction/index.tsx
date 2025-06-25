import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
    Container,
} from '@ifrc-go/ui';

import styles from './styles.module.css';

interface Props {
    selectedItemsCount: number;
    onRetriggerConfirm: () => void;
    onSelectionClear: () => void;
}

function BulkRetriggerAction(props: Props) {
    const {
        selectedItemsCount,
        onRetriggerConfirm,
        onSelectionClear,
    } = props;

    return (
        <Container
            className={styles.retriggerAction}
            heading="Items selected for retrigger"
            footerActions={(
                <>
                    <ConfirmButton
                        name="retrigger"
                        title="Retrigger"
                        onConfirm={onRetriggerConfirm}
                    >
                        Retrigger selected items
                    </ConfirmButton>
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={onSelectionClear}
                    >
                        Clear Selection
                    </Button>
                </>
            )}
        >
            You have selected
            &thinsp;
            <b>{selectedItemsCount}</b>
            &thinsp;
            items. Are you sure you wish to retrigger?
        </Container>
    );
}

export default BulkRetriggerAction;
