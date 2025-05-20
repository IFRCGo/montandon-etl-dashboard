import { useMemo } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Button,
    Container,
    DateInput,
    KeyFigure,
    Pager,
    SelectInput,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import {
    createStringColumn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Page from '#components/Page';
import {
    DataStatusTypeEnum,
    ExtractionEnumsQuery,
    LoadQuery,
    LoadQueryVariables,
    PyStacLoadDataItemTypeEnum,
    PyStacLoadDataStatusEnum,
    PyStacLoadEnumsQuery,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const LOADS = gql`
    query load (
        $pagination: OffsetPaginationInput,
        $filters:PystacDataFilter,
    ) {
        pystacs(filters: $filters, pagination: $pagination) {
            totalCount
            pageInfo {
                limit
                offset
            }
            results {
                createdAt
                id
                itemType
                modifiedAt
                status
                traceId
                transformId
            }
        }
        uniqueItemsCounts {
            uniqueEventCount
            uniqueHazardCount
            uniqueImpactCount
        }
    }
`;

const FILTERS_ENUMS = gql`
    query PyStacLoadEnums {
        enums {
            ExtractionDataSource {
                key
                label
            }
            ExtractionDataSourceValidationStatus {
                key
                label
            }
            PyStacLoadDataStatus{
                key
                label
            }
            PyStacLoadDataItemType {
                key
                label
            }
        }
    }
`;

type DataSourceType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type PyStacLoadDataStatusType = NonNullable<NonNullable<NonNullable<PyStacLoadEnumsQuery['enums']>['PyStacLoadDataStatus']>[number]>;
type PyStacLoadDataItemType = NonNullable<NonNullable<NonNullable<PyStacLoadEnumsQuery['enums']>['PyStacLoadDataItemType']>[number]>;
type LoadDataItemType = NonNullable<NonNullable<NonNullable<LoadQuery['pystacs']>['results']>[number]> & {
    isSelected: boolean;
};
type LoadFilterType = NonNullable<LoadQueryVariables['filters']>;

const sourceKeySelector = (option: DataSourceType) => option.key;
const sourceLabelSelector = (option: DataSourceType) => option.label;
const statusKeySelector = (option: PyStacLoadDataStatusType) => option.key;
const statusLabelSelector = (option: PyStacLoadDataStatusType) => option.label;
const itemTypeKeySelector = (option: PyStacLoadDataItemType) => option.key;
const itemTypeLabelSelector = (option: PyStacLoadDataItemType) => option.label;

const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;
const ASC = 'ASC';
const DESC = 'DESC';

function Load() {
    const {
        sortState,
        limit,
        offset,
        page,
        setPage,
        rawFilter,
        resetFilter,
        filter,
        setFilterField,
        filtered,
    } = useFilterState<{
        createdAtStart?: string;
        createdAtEnd?: string;
        traceId?: string;
        source?: DataSourceType
        status?: PyStacLoadDataStatusEnum;
        itemType?: PyStacLoadDataItemTypeEnum ;
      }>({
          filter: {},
          pageSize: PAGE_SIZE,
      });

    const order = useMemo(() => {
        if (isNotDefined(sortState.sorting)) {
            return undefined;
        }
        return {
            [sortState.sorting.name]: sortState.sorting.direction === 'asc' ? ASC : DESC,
        };
    }, [sortState.sorting]);

    const variables: LoadQueryVariables = useMemo(() => {
        const {
            createdAtStart,
            createdAtEnd,
            traceId,
            ...otherFilters
        } = filter;

        const createdAt: LoadFilterType['createdAt'] = {};
        if (createdAtStart) {
            createdAt.gte = createdAtStart;
        }
        if (createdAtEnd) {
            createdAt.lte = createdAtEnd;
        }

        return {
            pagination: {
                offset,
                limit,
            },
            order,
            filters: {
                ...otherFilters,
                createdAt: isDefined(createdAt.gte)
                || isDefined(createdAt.lte) ? createdAt : undefined,
                traceId: traceId ? { eq: traceId } : undefined,
            },
        };
    }, [
        limit,
        offset,
        filter,
        order,
    ]);

    const {
        data: loadResponse,
        loading,
        error: loadError,
    } = useQuery<LoadQuery, LoadQueryVariables>(
        LOADS,
        {
            variables,
        },
    );
    const {
        data: filtersEnumsResponse,
    } = useQuery(
        FILTERS_ENUMS,
    );
    const sourceOptions = filtersEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = filtersEnumsResponse?.enums?.PyStacLoadDataStatus;
    const itemTypeOptions = filtersEnumsResponse?.enums?.PyStacLoadDataItemType;

    const columns = useMemo(
        () => ([
            createStringColumn<LoadDataItemType, string>(
                'id',
                'Id',
                (item) => item.id,
            ),
            createStringColumn<LoadDataItemType, string>(
                'createdAt',
                'Created at',
                (item) => item.createdAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'modifiedAt',
                'Modified at',
                (item) => item.modifiedAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'status',
                'Status',
                (item) => item.status,
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'traceId',
                'Trace Id',
                (item) => item.traceId,
            ),
            createStringColumn<LoadDataItemType, string>(
                'transformId',
                'Transform Id',
                (item) => item.transformId,
                {
                    sortable: true,
                },
            ),
        ]),
        [],
    );

    const data = loadResponse?.pystacs.results;

    const heading = resolveToString(
        'All Transformation ({numAppeals})',
        { numAppeals: loadResponse?.pystacs.totalCount },
    );

    return (
        <Page
            className={styles.loads}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.keyFigures}>
                <KeyFigure
                    value={loadResponse?.uniqueItemsCounts[0]?.uniqueEventCount}
                    label="Total Event Count"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={loadResponse?.uniqueItemsCounts[0]?.uniqueHazardCount}
                    label="Total Hazard Count"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={loadResponse?.uniqueItemsCounts[0]?.uniqueImpactCount}
                    label="Total Impact Count"
                    className={styles.keyFigureItem}
                />
            </div>
            <Container
                heading={heading}
                withHeaderBorder
                className={styles.extractionTable}
                footerActions={isDefined(data) && (
                    <Pager
                        activePage={page}
                        itemsCount={loadResponse?.pystacs.totalCount ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
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
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        columns={columns}
                        data={data}
                        keySelector={keySelector}
                        pending={loading}
                        filtered={filtered}
                        errored={isDefined(loadError)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

export default Load;
