import {
    HTMLProps,
    useMemo,
} from 'react';
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
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import {
    type ExtractionDataType,
    type MyQueryQuery,
    type MyQueryQueryVariables,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import styles from './styles.module.css';

const EXTRACTION_LIST = gql`
    query MyQuery(
        $pagination: OffsetPaginationInput,
        $filters: ExtractionDataFilter
        ) {
        private {
            extractionList(pagination: $pagination,  filters: $filters,) {
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
// FIXME : Add ExtractionDataSourceTypeEnum
const sourceOptions = [
    { source: 'GDACS' },
    { source: 'PDC' },
];

const statusOptions = [
    { status: 'PENDING' },
    { status: 'IN-PROGRESS' },
    { status: 'SUCCESS' },
    { status: 'FAILED' },
];

const keySelector = (item: ExtractionDataType) => item.id;
const sourceKeySelector = (option: { source: string; }) => option.source;
const statusKeySelector = (option: {status : string}) => option.status;
const sourceLabelSelector = (option: { source: string; }) => option.source;
const statusLabelSelector = (option: {status: string}) => option.status;
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
        source?: string;
        status?: string;
    }>({
        pageSize: PAGE_SIZE,
        filter: {},
    });

    const variables = useMemo(() => ({
        pagination: {
            offset,
            limit,
        },
        filters: filter,
    }), [
        limit,
        offset,
        filter,
    ]);

    const {
        data: extractionResponse,
        loading: extractionLoading,
        error: extractionError,
    } = useQuery<MyQueryQuery, MyQueryQueryVariables>(EXTRACTION_LIST, {
        variables,
    });

    const columns = useMemo(
        () => ([
            createStringColumn<ExtractionDataType, string>(
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
            // FIXME:Change to stringColumn after server side
            createNumberColumn<ExtractionDataType, string>(
                'sourceValidationStatus',
                'Source Validation Status',
                (item) => item.sourceValidationStatus,
                {
                    sortable: true,
                },
            ),
            createNumberColumn<ExtractionDataType, string>(
                'respCode',
                'respCode',
                (item) => item.respCode,
                { sortable: true },
            ),
            createStringColumn<ExtractionDataType, string>(
                'respDataType',
                'Resp DataType',
                (item) => item.respDataType,
                { sortable: true },
            ),
            // FIXME:Change to stringColumn after server side
            createNumberColumn<ExtractionDataType, string>(
                'parentId',
                'Parent Id',
                (item) => item.parentId,
            ),
            createNumberColumn<ExtractionDataType, string>(
                'revisionId',
                'Revision Id',
                (item) => item.revisionId,
                {
                    sortable: true,
                    columnClassName: styles.revisionId,
                },
            ),
            createStringColumn<ExtractionDataType, HTMLProps<HTMLSpanElement>>(
                'url',
                'Url',
                (item) => (
                    <a
                        className={styles.actions}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {item.url}
                    </a>
                ),
                { columnClassName: styles.url },
            ),
        ]),
        [],
    );

    const data = extractionResponse?.private.extractionList;

    return (
        <Page>
            <Container
                heading="All Extractions"
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
                            label="Created GTE"
                            value={rawFilter.createdAtGte}
                            onChange={setFilterField}
                        />
                        <DateInput
                            name="createdAtLte"
                            label="Created LTE"
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
                        errored={isDefined(extractionError)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>
    );
}

Component.displayName = 'Home';
