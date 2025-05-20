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
    createElementColumn,
    createNumberColumn,
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
    type ExtractionsQuery,
    type ExtractionsQueryVariables,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const EXTRACTIONS = gql`
    query Extractions (
        $pagination: OffsetPaginationInput,
        $filters: ExtractionDataFilter,
    ) {
        extractions(filters: $filters, pagination: $pagination) {
            totalCount
            pageInfo {
                limit
                offset
            }
            results {
                hazardType
                id
                parentId
                respCode
                respDataType
                source
                sourceValidationStatus
                status
                traceId
                url
            }
        }
        statusCountExtraction {
            failedCount
            inProgressCount
            pendingCount
            successCount
        }
        statusSourceCountsExtraction {
            failedCount
            inProgressCount
            pendingCount
            source
            successCount
        }
    }
`;

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

type DataSourceType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type ExtractionDataStatusType = NonNullable<NonNullable<NonNullable<ExtractionEnumsQuery['enums']>['ExtractionDataStatus']>[number]>;
type ExtractionDataItemType = NonNullable<NonNullable<NonNullable<ExtractionsQuery['extractions']>['results']>[number]>;
type ExtractionFilterType = NonNullable<ExtractionsQueryVariables['filters']>;

const sourceKeySelector = (option: DataSourceType) => option.key;
const sourceLabelSelector = (option: DataSourceType) => option.label;
const statusKeySelector = (option: ExtractionDataStatusType) => option.key;
const statusLabelSelector = (option: ExtractionDataStatusType) => option.label;
const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;
const ASC = 'ASC';
const DESC = 'DESC';

function Extraction() {
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
        source?: DataSourceType;
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

    const variables: ExtractionsQueryVariables = useMemo(() => {
        const {
            createdAtStart,
            createdAtEnd,
            traceId,
            ...otherFilters
        } = filter;

        const createdAt: ExtractionFilterType['createdAt'] = {};
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
        data: extractionsResponse,
        loading: extractionsLoading,
        error: extractionsError,
    } = useQuery<ExtractionsQuery, ExtractionsQueryVariables>(
        EXTRACTIONS,
        {
            variables,
        },
    );

    const {
        data: extractionEnumsResponse,
    } = useQuery(
        EXTRACTION_ENUMS,
    );
    const sourceOptions = extractionEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = extractionEnumsResponse?.enums?.ExtractionDataStatus;

    const columns = useMemo(
        () => ([
            createStringColumn<ExtractionDataItemType, string>(
                'id',
                'Id',
                (item) => item.id,
                { columnClassName: styles.id },
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'hazardType',
                'Hazard Type',
                (item) => item.hazardType,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'status',
                'Status',
                (item) => item.status,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'source',
                'Source',
                (item) => item.source,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'sourceValidationStatus',
                'Source validation Status',
                (item) => item.sourceValidationStatus,
                {
                    sortable: true,
                },
            ),
            createNumberColumn<ExtractionDataItemType, string>(
                'respCode',
                'Response Code',
                (item) => item.respCode,
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'respDataType',
                'Response data Type',
                (item) => item.respDataType,
                { sortable: true },
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'parentId',
                'Parent Id',
                (item) => item.parentId,
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'traceId',
                'Trace Id',
                (item) => item.traceId,
                {
                    sortable: true,
                    columnClassName: styles.revisionId,
                },
            ),
            createElementColumn<ExtractionDataItemType, string, { url: string }>(
                'url',
                'Source url',
                ({ url }) => (
                    <a
                        className={styles.actions}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {url}
                    </a>
                ),
                (_, item) => ({ url: item.url }),
                { columnClassName: styles.url },
            ),
        ]),
        [],
    );

    const data = extractionsResponse?.extractions?.results;

    const heading = resolveToString(
        'All Extraction ({numAppeals})',
        { numAppeals: extractionsResponse?.extractions?.totalCount },
    );

    return (
        <Page
            className={styles.extraction}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.keyFigures}>
                <KeyFigure
                    // FIXME: Fix this after this is no longer array from sever
                    value={extractionsResponse?.statusCountExtraction[0]?.successCount}
                    label="Total Extractions Succeeded"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    // FIXME: Fix this after this is no longer array from sever
                    value={extractionsResponse?.statusCountExtraction[0]?.failedCount}
                    label="Total Extractions Failed"
                    className={styles.keyFigureItem}
                />
                <KeyFigure
                    // FIXME: Fix this after this is no longer array from sever
                    value={extractionsResponse?.statusCountExtraction[0]?.pendingCount}
                    label="Total Extractions Pending"
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
                        itemsCount={extractionsResponse?.extractions?.totalCount ?? 0}
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
                        pending={extractionsLoading}
                        filtered={filtered}
                        errored={isDefined(extractionsError)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

export default Extraction;
