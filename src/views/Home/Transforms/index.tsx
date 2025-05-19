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
    createStringColumn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import Page from '#components/Page';
import {
    TransformsQuery,
    TransformsQueryVariables,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';

import Filters from '../Filters';

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
type TransformationDataItem = NonNullable<NonNullable<NonNullable<TransformsQuery['transforms']>['results']>[number]>;
type TransformFilterType = NonNullable<TransformsQueryVariables['filters']>;
const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;

function Transformation() {
    const {
        sortState,
        limit,
        offset,
        page,
        setPage,
        filter,
        filtered,
    } = useFilterState<TransformFilterType>({
        pageSize: PAGE_SIZE,
        filter: {},
    });

    const variables: TransformsQueryVariables = useMemo(() => ({
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
        data: transformationResponse,
        loading: transformationsLoading,
        error: transformationsError,
    } = useQuery<TransformsQuery, TransformsQueryVariables>(
        TRANSFORMS,
        {
            variables,
        },
    );

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
                    <Filters />
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
