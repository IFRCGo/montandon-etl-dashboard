import {
    Button,
    Container,
    DateInput,
    KeyFigure,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';

import Page from '#components/Page';
import { DataStatusTypeEnum } from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const sourceKeySelector = (option: { key: string; }) => option.key;
const sourceLabelSelector = (option: { label: string; }) => option.label;
const statusKeySelector = (option: { key: string; }) => option.key;
const statusLabelSelector = (option: { label: string; }) => option.label;

function Load() {
    const {
        rawFilter,
        resetFilter,
        setFilterField,
        filtered,
    } = useFilterState<{
        createdAtStart?: string;
        createdAtEnd?: string;
        traceId?: string;
        source?: string;
        status?: DataStatusTypeEnum;
      }>({
          filter: {},
      });

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
                    <>
                        <DateInput
                            name="createdAtStart"
                            label="Created At "
                            value={rawFilter.createdAtStart}
                            onChange={setFilterField}
                        />
                        <DateInput
                            name="createdAtEnd"
                            label="End At"
                            value={rawFilter.createdAtEnd}
                            onChange={setFilterField}
                        />
                        <SelectInput
                            label="Source"
                            placeholder="All Sources"
                            name="source"
                            options={[]}
                            keySelector={sourceKeySelector}
                            labelSelector={sourceLabelSelector}
                            value={rawFilter.source}
                            onChange={setFilterField}
                        />
                        <SelectInput
                            name="status"
                            label="Status"
                            placeholder="Status"
                            options={[]}
                            keySelector={statusKeySelector}
                            labelSelector={statusLabelSelector}
                            value={rawFilter.status}
                            onChange={setFilterField}
                        />
                        <TextInput
                            name="traceId"
                            label="Trace Id"
                            placeholder="TraceId"
                            value={rawFilter.traceId}
                            onChange={setFilterField}
                        />
                        <div className={styles.filterButton}>
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={resetFilter}
                                disabled={!filtered}
                            >
                                Clear
                            </Button>
                        </div>
                    </>
                )}
            />
        </Page>
    );
}

export default Load;
