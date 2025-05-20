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
    TransformsQuery,
    TransformsQueryVariables,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const TRANSFORMS = gql`
    query transforms (
        $pagination: OffsetPaginationInput,
        $filters: TransformDataFilter,
    ) {
        transforms(filters: $filters, pagination: $pagination) {
            totalCount
            pageInfo {
                limit
                offset
            }
            results {
                createdAt
                endedAt
                id
                metadata
                startedAt
                status
                traceId
                extraction {
                    pk
                }
            }
        }
        statusCountTransform {
            failedCount
            inProgressCount
            pendingCount
            successCount
        }
        statusSourceCountsTransform {
            failedCount
            inProgressCount
            pendingCount
            source
            successCount
        }
    }
`;

const FILTERS_ENUMS = gql`
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
type DataSourceType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type TransformsDataStatusType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataStatus']>[number]>;
type TransformationDataItem = NonNullable<NonNullable<NonNullable<TransformsQuery['transforms']>['results']>[number]>;
type TransformFilterType = NonNullable<TransformsQueryVariables['filters']>;

const sourceKeySelector = (option: DataSourceType) => option.key;
const sourceLabelSelector = (option: DataSourceType) => option.label;
const statusKeySelector = (option: TransformsDataStatusType) => option.key;
const statusLabelSelector = (option: TransformsDataStatusType) => option.label;
const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 10;
const ASC = 'ASC';
const DESC = 'DESC';

function Transformation() {
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
        status?: DataStatusTypeEnum;
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

    const variables: TransformsQueryVariables = useMemo(() => {
        const {
            createdAtStart,
            createdAtEnd,
            traceId,
            ...otherFilters
        } = filter;

        const createdAt: TransformFilterType['createdAt'] = {};
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
        data: transformationResponse,
        loading: transformationsLoading,
        error: transformationsError,
    } = useQuery<TransformsQuery, TransformsQueryVariables>(
        TRANSFORMS,
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
    const statusOptions = filtersEnumsResponse?.enums?.ExtractionDataStatus;

    const columns = useMemo(
        () => ([
            createStringColumn<TransformationDataItem, string>(
                'id',
                'Id',
                (item) => item.id,
            ),
            createStringColumn<TransformationDataItem, string>(
                'createdAt',
                'Created at',
                (item) => item.createdAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<TransformationDataItem, string>(
                'endedAt',
                'End at',
                (item) => item.endedAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<TransformationDataItem, string>(
                'extraction',
                'Extraction',
                (item) => item.extraction?.pk,
            ),
            createStringColumn<TransformationDataItem, string>(
                'status',
                'Status',
                (item) => item.status,
                {
                    sortable: true,
                },
            ),
            createStringColumn<TransformationDataItem, string>(
                'traceId',
                'Trace Id',
                (item) => item.traceId,
            ),
            createStringColumn<TransformationDataItem, string>(
                'startedAt',
                'Started at',
                (item) => item.startedAt,
                {
                    sortable: true,
                },
            ),
        ]),
        [],
    );

    const data = transformationResponse?.transforms.results;
    const heading = resolveToString(
        'All Transformation ({numAppeals})',
        { numAppeals: transformationResponse?.transforms?.totalCount },
    );
    return (
        <Page
            className={styles.transformation}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.keyFigures}>
                <KeyFigure
                    value={transformationResponse?.statusCountTransform[0]?.successCount}
                    label="Total Transforms Succeeded"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={transformationResponse?.statusCountTransform[0]?.successCount}
                    label="Total Transforms Failed"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    value={transformationResponse?.statusCountTransform[0]?.pendingCount}
                    label="Total Transforms Pending"
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
                        itemsCount={transformationResponse?.transforms.totalCount ?? 0}
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
                    </>
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        columns={columns}
                        data={data}
                        keySelector={keySelector}
                        pending={transformationsLoading}
                        filtered={filtered}
                        errored={isDefined(transformationsError)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

export default Transformation;
