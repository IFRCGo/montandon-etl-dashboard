import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
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
import { type TabType } from '#utils/common';
import { FILTER_ENUMS } from '#utils/queries';

import styles from './styles.module.css';

// FIXME: Fix this type
const sourceKeySelector = (option: {key: SourceTypeEnum; label: string}) => option.key;
const sourceLabelSelector = (option: {key: SourceTypeEnum; label: string}) => option.label;
const statusKeySelector = (option: {key: DataStatusTypeEnum; label: string}) => option.key;
const statusLabelSelector = (option: {key: DataStatusTypeEnum; label: string}) => option.label;
// eslint-disable-next-line max-len
const itemTypeKeySelector = (option: {key: PyStacLoadDataItemTypeEnum; label: string}) => option.key;
// eslint-disable-next-line max-len
const itemTypeLabelSelector = (option: {key: PyStacLoadDataItemTypeEnum; label: string}) => option.label;

interface Filter {
    createdAtStart?: string | undefined;
    createdAtEnd?: string | undefined;
    traceId?: string | undefined;
    source?: SourceTypeEnum | undefined;
    extractionTransformStatus?: DataStatusTypeEnum | undefined;
    loadStatus?: DataStatusTypeEnum | undefined;
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
        filterEnumsResponse?.enums?.ExtractionDataSource
    ), [filterEnumsResponse]);

    const loadStatusOptions = useMemo(() => (
        filterEnumsResponse?.enums?.PyStacLoadDataStatus
    ), [
        filterEnumsResponse,
    ]);
    const extractionTransformStatusOptions = useMemo(() => (
        filterEnumsResponse?.enums?.DataStatusTypeEnum
    ), [
        filterEnumsResponse,
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
            {activeTab === 'load'
                ? (
                    <SelectInput
                        name="loadStatus"
                        label="Status"
                        placeholder="Status"
                        options={loadStatusOptions}
                        keySelector={statusKeySelector}
                        labelSelector={statusLabelSelector}
                        value={rawFilter.loadStatus}
                        onChange={setFilterField}
                    />
                )
                : (
                    <SelectInput
                        name="extractionTransformStatus"
                        label="Status"
                        placeholder="Status"
                        options={extractionTransformStatusOptions}
                        keySelector={statusKeySelector}
                        labelSelector={statusLabelSelector}
                        value={rawFilter.extractionTransformStatus}
                        onChange={setFilterField}
                    />
                )}
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
