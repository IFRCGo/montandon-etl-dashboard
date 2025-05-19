import { useMemo } from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Container,
    KeyFigure,
    Pager,
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
    type ExtractionsQuery,
    type ExtractionsQueryVariables,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import Filters from '../Filters';

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
type ExtractionDataItemType = NonNullable<NonNullable<NonNullable<ExtractionsQuery['extractions']>['results']>[number]>;
type ExtractionFilterType = NonNullable<ExtractionsQueryVariables['filters']>;

const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;

function Extraction() {
    const {
        sortState,
        limit,
        offset,
        page,
        setPage,
        filter,
        filtered,
    } = useFilterState<ExtractionFilterType>({
        pageSize: PAGE_SIZE,
        filter: {},
    });

    const variables: ExtractionsQueryVariables = useMemo(() => ({
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
        data: extractionsResponse,
        loading: extractionsLoading,
        error: extractionsError,
    } = useQuery<ExtractionsQuery, ExtractionsQueryVariables>(
        EXTRACTIONS,
        {
            variables,
        },
    );
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
                    <Filters />
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
