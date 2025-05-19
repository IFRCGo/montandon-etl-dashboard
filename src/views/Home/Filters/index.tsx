import { useContext } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Button,
    DateInput,
    SelectInput,
} from '@ifrc-go/ui';

import { ExtractionEnumsQuery } from '#generated/types/graphql';

import ExtractionDataContext from '../ExtractionDataContext';

import styles from './styles.module.css';

type DataSourceType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type ExtractionDataStatusType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataStatus']>[number]>;

const EXTRACTION_ENUMS = gql`
    query ExtractionEnums {
        enums {
            ExtractionDataSource {
                key
                label
            }
            ExtractionDataSourceValidationStatus {
                key
                label
            }
            ExtractionDataStatus {
                key
                label
            }
        }
    }
`;

const sourceKeySelector = (option: DataSourceType) => option.key;
const sourceLabelSelector = (option: DataSourceType) => option.label;
const statusKeySelector = (option: ExtractionDataStatusType) => option.key;
const statusLabelSelector = (option: ExtractionDataStatusType) => option.label;

function Filters() {
    const {
        createdAt,
        setCreatedAt,
        source,
        setSource,
        status,
        setStatus,
        resetFilter,
        filtered,
    } = useContext(ExtractionDataContext);

    const { data: extractionEnumsResponse } = useQuery(EXTRACTION_ENUMS);

    const sourceOptions = extractionEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = extractionEnumsResponse?.enums?.ExtractionDataStatus;

    return (
        <>
            <DateInput
                name="startDateFrom"
                label="Created At"
                value={createdAt}
                onChange={setCreatedAt}
            />
            <SelectInput
                label="Source"
                placeholder="All Sources"
                name="source"
                options={sourceOptions}
                keySelector={sourceKeySelector}
                labelSelector={sourceLabelSelector}
                value={source}
                onChange={setSource}
            />
            <SelectInput
                name="status"
                label="Status"
                placeholder="Status"
                options={statusOptions}
                keySelector={statusKeySelector}
                labelSelector={statusLabelSelector}
                value={status}
                onChange={setStatus}
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
    );
}

export default Filters;
