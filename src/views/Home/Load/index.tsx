import {
    Container,
    KeyFigure,
} from '@ifrc-go/ui';

import Page from '#components/Page';
import Filters from '#views/Home/Filters';

import styles from './styles.module.css';

function Load() {
    return (
        <Page
            className={styles.loads}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.keyFigures}>
                <KeyFigure
                    value={undefined}
                    label="Total Loads Succeeded"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={undefined}
                    label="Total Loads Failed"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={undefined}
                    label="Total Loads Pending"
                    className={styles.keyFigureItem}
                />
            </div>
            <Container
                heading="All Loads"
                withHeaderBorder
                className={styles.extractionTable}
                filters={(
                    <Filters />
                )}
            />
        </Page>
    );
}

export default Load;
