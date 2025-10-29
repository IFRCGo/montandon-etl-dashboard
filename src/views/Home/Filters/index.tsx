import { useMemo } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Button,
    DateInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';

import {
    type DataStatusTypeEnum,
    type PyStacLoadDataItemTypeEnum,
    type SourceTypeEnum,
} from '#generated/types/graphql';
// eslint-disable-next-line import/no-cycle
import { TabType } from '#views/Home';

import styles from './styles.module.css';

const FILTER_ENUMS = gql`
    query FilterEnums {
        enums {
            ExtractionDataSource {
                key
                label
            }
            ExtractionDataSourceValidationStatus {
                key
                label
            }
            DataStatusTypeEnum {
                key
                label
            }
            PyStacLoadDataItemType {
                label
                key
            }
            PyStacLoadDataStatus {
                key
                label
            }
        }
    }
`;

// FIXME: Fix this type
const sourceKeySelector = (option: {key: SourceTypeEnum; label: string}) => option.key;
const sourceLabelSelector = (option: {key: SourceTypeEnum; label: string}) => option.label;
const statusKeySelector = (option: {key: DataStatusTypeEnum; label: string}) => option.key;
const statusLabelSelector = (option: {key: DataStatusTypeEnum; label: string}) => option.label;
// eslint-disable-next-line max-len
const itemTypeKeySelector = (option: {key: PyStacLoadDataItemTypeEnum; label: string}) => option.key;
// eslint-disable-next-line max-len
const itemTypeLabelSelector = (option: {key: PyStacLoadDataItemTypeEnum; label: string}) => option.label;

export interface Filter {
    createdAtStart?: string | undefined;
    createdAtEnd?: string | undefined;
    traceId?: string | undefined;
    source?: SourceTypeEnum | undefined;
    status?: DataStatusTypeEnum | undefined;
    itemType?: PyStacLoadDataItemTypeEnum | undefined;
}

interface Props {
    activeTab: TabType;
    rawFilter: Filter;
    resetFilter: () => void;
    filtered: boolean;
    setFilterField: () => void;
}

export default function Filters(props: Props) {
    const {
        activeTab,
        setFilterField,
        resetFilter,
        filtered,
        rawFilter,
    } = props;

    const {
        data: filterEnumsResponse,
    } = useQuery(
        FILTER_ENUMS,
    );

    // FIXME: Fix the sources variable
    const sourceOptions = useMemo(() => (
        filterEnumsResponse?.enums?.DataStatusTypeEnum
    ), [filterEnumsResponse]);

    const statusOptions = useMemo(() => (
        activeTab === 'load'
            ? filterEnumsResponse?.enums?.PyStacLoadDataStatus
            : filterEnumsResponse?.enums?.DataStatusTypeEnum
    ), [
        filterEnumsResponse,
        activeTab,
    ]);

    const itemTypeOptions = useMemo(() => (
        filterEnumsResponse?.enums?.PyStacLoadDataItemType
    ), [filterEnumsResponse]);

    return (
        <div className={styles.filters}>
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
                options={sourceOptions}
                keySelector={sourceKeySelector}
                labelSelector={sourceLabelSelector}
                value={rawFilter.source}
                onChange={setFilterField}
            />
            <SelectInput
                name="status"
                label="Status"
                placeholder="Status"
                options={statusOptions}
                keySelector={statusKeySelector}
                labelSelector={statusLabelSelector}
                value={rawFilter.status}
                onChange={setFilterField}
            />
            {activeTab === 'load' && (
                <SelectInput
                    name="itemType"
                    label="Item type"
                    placeholder="item"
                    options={itemTypeOptions}
                    keySelector={itemTypeKeySelector}
                    labelSelector={itemTypeLabelSelector}
                    value={rawFilter.itemType}
                    onChange={setFilterField}
                />
            )}
            <TextInput
                name="traceId"
                label="Trace Id"
                placeholder="Trace Id"
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
        </div>
    );
}
