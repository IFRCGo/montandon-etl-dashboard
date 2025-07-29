import {
    useMemo,
    useState,
} from 'react';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Container,
    DateOutput,
    type DateOutputProps,
    KeyFigure,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import {
    createElementColumn,
    createStringColumn,
    resolveToString,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import Page from '#components/Page';
import StatusTag, { type Props as StatusTagProps } from '#components/StatusTag';
import {
    type FilterEnumsQuery,
    type IdBaseFilterLookup,
    type LoadQuery,
    type LoadQueryVariables,
    type PyStacLoadDataItemTypeEnum,
    type PyStacLoadDataStatusEnum,
    type SourceTypeEnum,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';
import getEnumLabelFromValue from '#utils/common';
import { FILTER_ENUMS } from '#utils/queries';

import styles from './styles.module.css';

const LOADS = gql`
    query load (
        $pagination: OffsetPaginationInput,
        $filters: PystacDataFilter,
        $order: PystacOrder,
    ) {
        pystacs(filters: $filters, pagination: $pagination, order: $order) {
            totalCount
            pageInfo {
                limit
                offset
            }
            results {
                collectionId
                createdAt
                id
                itemType
                modifiedAt
                source
                status
                traceId
                transformId
                item
            }
        }
        statusSourceCountsPystac {
            successCount
            source
            pendingCount
            inProgressCount
            failedCount
        }
        uniqueItemsCounts {
            uniqueEventCount
            uniqueHazardCount
            uniqueImpactCount
        }
    }
`;

type LoadDataItemType = NonNullable<NonNullable<NonNullable<LoadQuery['pystacs']>['results']>[number]>;
type LoadFilterType = NonNullable<LoadQueryVariables['filters']>;

const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;
const ASC = 'ASC';
const DESC = 'DESC';

interface Filter {
    createdAtStart?: string | undefined;
    createdAtEnd?: string | undefined;
    traceId?: string | undefined;
    source?: SourceTypeEnum | undefined;
    loadStatus?: PyStacLoadDataStatusEnum | undefined;
    itemType?: PyStacLoadDataItemTypeEnum | undefined;
}

interface Props {
    filter: Filter;
    filtered: boolean;
}

function Load(props: Props) {
    const {
        filter,
        filtered,
    } = props;

    const [page, setPage] = useState<number>(1);
    const {
        sortState,
        limit,
        offset,
    } = useFilterState<{
        createdAtStart?: string;
        createdAtEnd?: string;
        traceId?: string;
        source?: SourceTypeEnum;
        loadStatus?: PyStacLoadDataStatusEnum;
        itemType?: PyStacLoadDataItemTypeEnum;
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
            loadStatus,
            source,
            itemType,
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
                createdAt: isDefined(createdAt.gte)
                    || isDefined(createdAt.lte) ? createdAt : undefined,
                traceId: traceId ? { exact: traceId } as IdBaseFilterLookup : undefined,
                status: loadStatus,
                source,
                itemType,
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
        data: filterEnumsResponse,
    } = useQuery<FilterEnumsQuery>(
        FILTER_ENUMS,
    );

    const pyStacStatusData = loadResponse?.statusSourceCountsPystac;

    const sourceOptions = filterEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = filterEnumsResponse?.enums?.PyStacLoadDataStatus;
    const itemTypeOptions = filterEnumsResponse?.enums?.PyStacLoadDataItemType;

    const columns = useMemo(
        () => ([
            createStringColumn<LoadDataItemType, string>(
                'collectionId',
                'Collection Id',
                (item) => item.collectionId,
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'id',
                'Load Id',
                (item) => item.id,
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'itemType',
                'Item Type',
                (item) => getEnumLabelFromValue(
                    item.itemType,
                    itemTypeOptions ?? [],
                ),
            ),
            createStringColumn<LoadDataItemType, string>(
                'source',
                'Source',
                (item) => getEnumLabelFromValue(
                    item.source,
                    sourceOptions ?? [],
                ),
                {
                    sortable: true,
                },
            ),
            createElementColumn<LoadDataItemType, string, DateOutputProps>(
                'createdAt',
                'Created at',
                DateOutput,
                (_, item) => ({
                    value: item.createdAt,
                    format: 'MM/dd/yyyy hh:mm:ss',
                }),
            ),
            createElementColumn<LoadDataItemType, string, DateOutputProps>(
                'modifiedAt',
                'Modified at',
                DateOutput,
                (_, item) => ({
                    value: item.createdAt,
                    format: 'MM/dd/yyyy hh:mm:ss',
                }),
            ),
            createElementColumn<LoadDataItemType, string, StatusTagProps<string>>(
                'status',
                'Status',
                StatusTag,
                (_, item) => ({
                    name: item.id,
                    label: getEnumLabelFromValue(item.status, statusOptions ?? []) ?? '-',
                    status: item.status,
                }),
                {
                    sortable: true,
                },
            ),
            createStringColumn<LoadDataItemType, string>(
                'traceId',
                'Trace Id',
                (item) => item.traceId,
                {
                    sortable: true,
                },
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
        [
            sourceOptions,
            itemTypeOptions,
            statusOptions,
        ],
    );

    const data = loadResponse?.pystacs.results;

    const heading = useMemo(() => (
        resolveToString(
            'All Load ({totalCount})',
            {
                totalCount: isDefined(loadResponse?.pystacs?.totalCount)
                    ? loadResponse?.pystacs?.totalCount
                    : 0,
            },
        )
    ), [loadResponse?.pystacs?.totalCount]);

    return (
        <Page
            className={styles.loads}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.figures}>
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
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <BarChart
                        data={pyStacStatusData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="failedCount" stackId="a" fill="#F75C65" />
                        <Bar dataKey="pendingCount" stackId="a" fill="#FF8000" />
                        <Bar dataKey="successCount" stackId="a" fill="#7FB845" />
                    </BarChart>
                </ResponsiveContainer>
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
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        columns={columns}
                        data={loadResponse?.pystacs.results}
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
