import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';
import { ExternalLinkFillIcon } from '@ifrc-go/icons';
import {
    Checkbox,
    type CheckboxProps,
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

import BulkRetriggerAction from '#components/BulkRetriggerAction';
import Page from '#components/Page';
import StatusTag, { type Props as StatusTagProps } from '#components/StatusTag';
import {
    type DataStatusTypeEnum,
    type ExtractionsQuery,
    type ExtractionsQueryVariables,
    type RetriggerExtractionsMutation,
    type RetriggerExtractionsMutationVariables,
    type SourceTypeEnum,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import getEnumLabelFromValue from '#utils/common';
import { FILTER_ENUMS } from '#utils/queries';

import styles from './styles.module.css';

const EXTRACTIONS = gql`
    query Extractions (
        $order: ExtractionOrder,
        $pagination: OffsetPaginationInput,
        $filters: ExtractionDataFilter,
    ) {
        extractions(
            filters: $filters,
            pagination: $pagination,
            order: $order,
        ) {
            totalCount
            pageInfo {
                limit
                offset
            }
            results {
                id
                hazardType
                parentId
                respCode
                respDataType
                source
                sourceValidationStatus
                status
                traceId
                url
                filesize
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

const RETRIGGER_EXTRACTIONS = gql`
    mutation RetriggerExtractions (
        $traceIds: [ID!]!
    ) {
        retriggerPipeline(data: {
            traceIds: $traceIds
        }) {
            errors
            ok
            result {
                status
                taskId
            }
        }
    }
`;

type ExtractionDataItemType = NonNullable<NonNullable<NonNullable<ExtractionsQuery['extractions']>['results']>[number]> & {
    isSelected: boolean;
};
type ExtractionFilterType = NonNullable<ExtractionsQueryVariables['filters']>;

const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;
const ASC = 'ASC';
const DESC = 'DESC';
const emptyArray: [] = [];

interface Filter {
    createdAtStart?: string | undefined;
    createdAtEnd?: string | undefined;
    traceId?: string | undefined;
    source?: SourceTypeEnum | undefined;
    extractionTransformStatus?: DataStatusTypeEnum | undefined;
}

interface Props {
    filter: Filter;
    filtered: boolean;
}

function Extraction(props: Props) {
    const {
        filter,
        filtered,
    } = props;
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRetriggerBannerVisible, setIsRetriggerBannerVisible] = useState(false);
    const [page, setPage] = useState<number>(1);
    const alert = useAlert();
    const {
        sortState,
        limit,
        offset,
    } = useFilterState<{
        createdAtStart?: string;
        createdAtEnd?: string;
        traceId?: string;
        source?: SourceTypeEnum;
        extractionTransformStatus?: DataStatusTypeEnum;
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
            extractionTransformStatus,
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
                traceId: traceId ? { exact: traceId } : undefined,
                status: extractionTransformStatus,
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
        data: filterEnumsResponse,
    } = useQuery(
        FILTER_ENUMS,
    );

    const [
        retriggerExtractions,
    ] = useMutation<RetriggerExtractionsMutation, RetriggerExtractionsMutationVariables>(
        RETRIGGER_EXTRACTIONS,
        {
            onCompleted: (response) => {
                if (response?.retriggerPipeline) {
                    alert.show(
                        'Successfully Retriggered the Content',
                        { variant: 'success' },
                    );
                } else {
                    alert.show(
                        'Failed to Retrigger the Content. Unexpected response from the server.',
                        { variant: 'danger' },
                    );
                }
                setSelectedIds([]);
            },
            // FIXME:  fix after error added  to server side
            onError: () => {
                alert.show(
                    'Failed to Retrigger the Content. Please try again later.',
                    { variant: 'danger' },
                );
            },
        },
    );

    const handleRetriggerExtraction = useCallback(() => {
        retriggerExtractions({
            variables: {
                traceIds: selectedIds,
            },
        });
    }, [retriggerExtractions, selectedIds]);

    const handleRetriggerActionClose = () => {
        setIsRetriggerBannerVisible(false);
        setSelectedIds(emptyArray);
    };

    useEffect(() => {
        setIsRetriggerBannerVisible(selectedIds.length > 0);
    }, [selectedIds]);

    const dataWithSelection = useMemo(() => (
        extractionsResponse?.extractions.results ?? []).map((item) => ({
        ...item,
        isSelected: selectedIds.includes(item.id),
    })), [extractionsResponse, selectedIds]);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) return [...prev, id];
            return prev.filter((existingId) => existingId !== id);
        });
    }, []);

    /*
    const handleSelectAllChange = useCallback((checked: boolean) => {
        if (!extractionsResponse?.extractions?.results) return;
        const currentPageIds = extractionsResponse.extractions.results.map((item) => item.id);
        setSelectedIds(checked ? currentPageIds : []);
    }, [extractionsResponse]);
    */

    const sourceOptions = filterEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = filterEnumsResponse?.enums?.DataStatusTypeEnum;

    const extractionDataBySource = extractionsResponse?.statusSourceCountsExtraction;

    const columns = useMemo(
        () => ([
            createElementColumn<ExtractionDataItemType, string, CheckboxProps<string>>(
                'select',
                '',
                /*
                Checkbox,
                (_, item) => ({
                    name: 'select-all',
                    onChange: handleSelectAllChange,
                    value: dataWithSelection.length > 0
                        && dataWithSelection.every(() => item.isSelected),
                }),
                */
                Checkbox,
                (id, item) => ({
                    name: `select-${id}`,
                    value: item.isSelected,
                    onChange: (checked) => handleCheckboxChange(item.id, checked),
                    disabled: item.status !== 'FAILED',
                }),
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'id',
                'Extraction Id',
                (item) => item.id,
                {
                    columnClassName: styles.id,
                    sortable: true,
                },
            ),
            createStringColumn<ExtractionDataItemType, string>(
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
            createElementColumn<ExtractionDataItemType, string, StatusTagProps<string>>(
                'extractionTransformStatus',
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
            createNumberColumn<ExtractionDataItemType, string>(
                'respCode',
                'HTTP Response Code',
                (item) => item.respCode,
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'respDataType',
                'Response data Type',
                (item) => item.respDataType,
            ),
            /*
                TODO: IF hazard types are saved in the server, show this.
                createStringColumn<ExtractionDataItemType, string>(
                    'hazardType',
                    'Hazard Type',
                    (item) => item.hazardType,
                    {
                        sortable: true,
                    },
                ),
            */
            createNumberColumn<ExtractionDataItemType, string>(
                'fileSize',
                'File Size',
                (item) => item.filesize,
                {
                    suffix: ' KB',
                },
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
                        <ExternalLinkFillIcon />
                    </a>
                ),
                (_, item) => ({ url: item.url }),
                { columnClassName: styles.url },
            ),
        ]),
        [
            handleCheckboxChange,
            sourceOptions,
            statusOptions,
        ],
    );

    const data = extractionsResponse?.extractions?.results;

    const heading = useMemo(() => (
        resolveToString(
            'All Extraction ({totalCount})',
            {
                totalCount: isDefined(extractionsResponse?.extractions?.totalCount)
                    ? extractionsResponse?.extractions?.totalCount
                    : 0,
            },
        )
    ), [extractionsResponse?.extractions?.totalCount]);

    return (
        <Page
            className={styles.extraction}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.figure}>
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
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <BarChart
                        data={extractionDataBySource}
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
                        <Bar dataKey="inProgressCount" stackId="a" fill="#d9b100" />
                        <Bar dataKey="pendingCount" stackId="a" fill="#FF8000" />
                        <Bar dataKey="successCount" stackId="a" fill="#7FB845" />
                        <Bar dataKey="onRetryCount" stackId="a" fill="#8648B3" />
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
                        itemsCount={extractionsResponse?.extractions?.totalCount ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        columns={columns}
                        data={dataWithSelection}
                        keySelector={keySelector}
                        pending={extractionsLoading}
                        filtered={filtered}
                        errored={isDefined(extractionsError)}
                    />
                </SortContext.Provider>
                {isRetriggerBannerVisible && (
                    <BulkRetriggerAction
                        onSelectionClear={handleRetriggerActionClose}
                        onRetriggerConfirm={handleRetriggerExtraction}
                        selectedItemsCount={selectedIds.length}
                    />
                )}
            </Container>
        </Page>
    );
}

export default Extraction;
