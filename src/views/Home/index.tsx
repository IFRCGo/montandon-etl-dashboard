import { useMemo } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Button,
    Container,
    DateInput,
    Pager,
    SelectInput,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import {
    createElementColumn,
    createNumberColumn,
    createStringColumn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import {
    ExtractionDataFilter,
    ExtractionDataSourceTypeEnum,
    ExtractionDataStatusTypeEnum,
    ExtractionDataType,
    ExtractionListQueryVariables,
    OffsetPaginationInput,
    Query,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const EXTRACTION_LIST = gql`
    query ExtractionList(
        $pagination: OffsetPaginationInput,
        $filters: ExtractionDataFilter
    ) {
        private {
            extractionList(pagination: $pagination, filters: $filters) {
                items {
                    hazardType
                    id
                    parentId
                    respCode
                    respDataType
                    revisionId
                    source
                    sourceValidationStatus
                    status
                    url
                }
                limit
                offset
                count
            }
        }
    }
`;

const SOURCE_ENUMS = gql`
    query SourceEnums {
        __type(name: "ExtractionDataSourceTypeEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

const STATUS_ENUMS = gql`
    query StatusEnums {
        __type(name: "ExtractionDataStatusTypeEnum") {
            enumValues {
                name
            }
        }
    }
`;

const keySelector = (item: ExtractionDataType) => item.id;
const sourceKeySelector = (option: { name: string }) => option.name;
const statusKeySelector = (option: { name: string }) => option.name;
const sourceLabelSelector = (option: { name: string }) => option.name;
const statusLabelSelector = (option: { name: string }) => option.name;
const PAGE_SIZE = 10;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
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
        createdAtGte?: string;
        createdAtLte?: string;
        source?:string;
        status?: string;
    }>({
        pageSize: PAGE_SIZE,
        filter: {},
    });

    const variables: {
        pagination: OffsetPaginationInput;
        filters: ExtractionDataFilter;
    } = useMemo(() => ({
        pagination: {
            offset,
            limit,
        },
        filters: {
            createdAtGte: filter.createdAtGte,
            createdAtLte: filter.createdAtLte,
            source: filter.source as ExtractionDataSourceTypeEnum | undefined,
            status: filter.status as ExtractionDataStatusTypeEnum | undefined | null,
        },
    }), [
        limit,
        offset,
        filter,
    ]);

    const {
        data: extractionResponse,
        loading: extractionLoading,
        error: extractionError,
    } = useQuery<Query, ExtractionListQueryVariables>(EXTRACTION_LIST, {
        variables,
    });

    const {
        data: sourceData,
    } = useQuery(
        SOURCE_ENUMS,
    );
    const {
        data: statusData,
    } = useQuery(
        STATUS_ENUMS,
    );

    // eslint-disable-next-line no-underscore-dangle
    const sourceOptions = sourceData?.__type.enumValues;
    // eslint-disable-next-line no-underscore-dangle
    const statusOptions = statusData?.__type.enumValues;

    const columns = useMemo(
        () => ([
            createNumberColumn<ExtractionDataType, number>(
                'id',
                'Id',
                (item) => item.id,
                { columnClassName: styles.id },
            ),

            createStringColumn<ExtractionDataType, string>(
                'hazardType',
                'Hazard Type',
                (item) => item.hazardType,
                {
                    sortable: true,
                },
            ),

            createStringColumn<ExtractionDataType, string>(
                'status',
                'Status',
                (item) => item.status,
                {
                    sortable: true,
                },
            ),

            createStringColumn<ExtractionDataType, string>(
                'source',
                'Source',
                (item) => item.source,
                {
                    sortable: true,
                },
            ),

            createStringColumn<ExtractionDataType, string>(
                'sourceValidationStatus',
                'Source validation Status',
                (item) => item.sourceValidationStatus,
                {
                    sortable: true,
                },
            ),

            createNumberColumn<ExtractionDataType, number>(
                'respCode',
                'Response Code',
                (item) => item.respCode,
                { sortable: true },
            ),

            createStringColumn<ExtractionDataType, string>(
                'respDataType',
                'Response data Type',
                (item) => item.respDataType,
                { sortable: true },
            ),

            createNumberColumn<ExtractionDataType, number>(
                'parentId',
                'Parent Id',
                (item) => item.parentId,
            ),

            createNumberColumn<ExtractionDataType, number>(
                'revisionId',
                'Revision Id',
                (item) => item.revisionId,
                {
                    sortable: true,
                    columnClassName: styles.revisionId,
                },
            ),

            createElementColumn<ExtractionDataType, string, { url: string }>(
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
                (_key, item) => ({ url: item.url }),
                { columnClassName: styles.url },
            ),
        ]),
        [],
    );

    const data = extractionResponse?.private.extractionList;

    const heading = resolveToString(
        'All Extraction ({numAppeals})',
        { numAppeals: data?.count },
    );

    return (
        <Page>
            <Container
                heading={heading}
                withHeaderBorder
                className={styles.extractionTable}
                footerActions={isDefined(data) && (
                    <Pager
                        activePage={page}
                        itemsCount={data.count}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
                filters={(
                    <>
                        <DateInput
                            name="createdAtGte"
                            label="Created From"
                            value={rawFilter.createdAtGte}
                            onChange={setFilterField}
                        />
                        <DateInput
                            name="createdAtLte"
                            label="Created To"
                            value={rawFilter.createdAtLte}
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
                        data={data?.items}
                        keySelector={keySelector}
                        pending={extractionLoading}
                        filtered={filtered}
                        errored={!!extractionError}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'Home';
