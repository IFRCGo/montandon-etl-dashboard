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
import {
    Checkbox,
    type CheckboxProps,
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

import BulkRetriggerAction from '#components/BulkRetriggerAction';
import Page from '#components/Page';
import StatusTag, { type Props as StatusTagProps } from '#components/StatusTag';
import {
    type DataStatusTypeEnum,
    type PyStacLoadDataItemTypeEnum,
    type RetriggerTransformsMutation,
    type RetriggerTransformsMutationVariables,
    type SourceTypeEnum,
    type TransformsQuery,
    type TransformsQueryVariables,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import getEnumLabelFromValue from '#utils/common';
import { FILTER_ENUMS } from '#utils/queries';

import styles from './styles.module.css';

const TRANSFORMS = gql`
    query transforms (
        $order: TransformOrder,
        $pagination: OffsetPaginationInput,
        $filters: TransformDataFilter,
    ) {
        transforms(
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
                createdAt
                startedAt
                endedAt
                metadata
                status
                traceId
                source
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
        statusSourceCountsTransform {
            failedCount
            inProgressCount
            pendingCount
            source
            successCount
        }
    }
`;

const RETRIGGER_TRANSFORMS = gql`
    mutation RetriggerTransforms(
        $transformIds: [ID!]!
    ){
        retriggerTransform(data: {
            transformIds: $transformIds
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
type TransformationDataItem = NonNullable<NonNullable<NonNullable<TransformsQuery['transforms']>['results']>[number]> & {
    isSelected: boolean;
};
type TransformFilterType = NonNullable<TransformsQueryVariables['filters']>;

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
    itemType?: PyStacLoadDataItemTypeEnum | undefined;
}

interface Props {
    filter: Filter;
    filtered: boolean;
}

function Transformation(props: Props) {
    const {
        filter,
        filtered,
    } = props;
    const alert = useAlert();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRetriggerBannerVisible, setIsRetriggerBannerVisible] = useState(false);
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

    const variables: TransformsQueryVariables = useMemo(() => {
        const {
            createdAtStart,
            createdAtEnd,
            traceId,
            extractionTransformStatus,
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
        data: transformResponse,
        loading: transformationsLoading,
        error: transformationsError,
    } = useQuery<TransformsQuery, TransformsQueryVariables>(
        TRANSFORMS,
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
        retriggerTransform,
    ] = useMutation<RetriggerTransformsMutation, RetriggerTransformsMutationVariables>(
        RETRIGGER_TRANSFORMS,
        {
            onCompleted: (response) => {
                if (response?.retriggerTransform) {
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
            // FIXME:  fix after error added  to serverside
            onError: () => {
                alert.show(
                    'Failed to Retrigger the Content. Please try again later.',
                    { variant: 'danger' },
                );
            },
        },
    );

    const handleRetriggerTransform = useCallback(() => {
        retriggerTransform({
            variables: {
                transformIds: selectedIds,
            },
        });
    }, [retriggerTransform, selectedIds]);

    const handleRetriggerActionClose = () => {
        setIsRetriggerBannerVisible(false);
        setSelectedIds(emptyArray);
    };

    useEffect(() => {
        setIsRetriggerBannerVisible(selectedIds.length > 0);
    }, [selectedIds]);

    const dataWithSelection = useMemo(() => (
        transformResponse?.transforms.results ?? []).map((item) => ({
        ...item,
        isSelected: selectedIds.includes(item.id),
    })), [transformResponse, selectedIds]);

    const handleCheckboxChange = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) return [...prev, id];
            return prev.filter((existingId) => existingId !== id);
        });
    }, []);

    /*
    const handleSelectAllChange = useCallback((checked: boolean) => {
        if (!transformationResponse?.transforms.results) return;
        const currentPageIds = transformationResponse.transforms.results.map((item) => item.id);
        setSelectedIds(checked ? currentPageIds : []);
    }, [transformationResponse]);
    */

    const sourceOptions = filterEnumsResponse?.enums?.ExtractionDataSource;
    const statusOptions = filterEnumsResponse?.enums?.DataStatusTypeEnum;

    const extractionDataByTransformation = transformResponse?.statusSourceCountsTransform;

    const columns = useMemo(
        () => ([
            createElementColumn<TransformationDataItem, string, CheckboxProps<string>>(
                'select',
                '',
                /*
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
            createStringColumn<TransformationDataItem, string>(
                'id',
                'Transform Id',
                (item) => item.id,
                {
                    sortable: true,
                },
            ),
            createStringColumn<TransformationDataItem, string>(
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
            createElementColumn<TransformationDataItem, string, StatusTagProps<string>>(
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
            createElementColumn<TransformationDataItem, string, DateOutputProps>(
                'createdAt',
                'Created at',
                DateOutput,
                (_, item) => ({
                    value: item.createdAt,
                    format: 'MM/dd/yyyy hh:mm:ss',
                }),
            ),
            createElementColumn<TransformationDataItem, string, DateOutputProps>(
                'startedAt',
                'Started at',
                DateOutput,
                (_, item) => ({
                    value: item.startedAt,
                    format: 'MM/dd/yyyy hh:mm:ss',
                }),
            ),
            createElementColumn<TransformationDataItem, string, DateOutputProps>(
                'endedAt',
                'End at',
                DateOutput,
                (_, item) => ({
                    value: item.endedAt,
                    format: 'MM/dd/yyyy hh:mm:ss',
                }),
            ),
            createStringColumn<TransformationDataItem, string>(
                'extraction',
                'Extraction Id',
                (item) => item.extraction?.pk,
                {
                    sortable: true,
                },
            ),
            createStringColumn<TransformationDataItem, string>(
                'traceId',
                'Trace Id',
                (item) => item.traceId,
                {
                    sortable: true,
                },
            ),
        ]),
        [
            handleCheckboxChange,
            statusOptions,
            sourceOptions,
        ],
    );

    const data = transformResponse?.transforms.results;
    const heading = useMemo(() => (
        resolveToString(
            'All Transformation ({totalCount})',
            {
                totalCount: isDefined(transformResponse?.transforms?.totalCount)
                    ? transformResponse?.transforms?.totalCount
                    : 0,
            },
        )
    ), [transformResponse?.transforms?.totalCount]);

    return (
        <Page
            className={styles.transformation}
            mainSectionClassName={styles.mainSection}
        >
            <div className={styles.figures}>
                <div className={styles.keyFigures}>
                    <KeyFigure
                        value={transformResponse?.statusCountTransform[0]?.successCount}
                        label="Total Transforms Succeeded"
                        className={styles.keyFigureItem}
                    />
                    <KeyFigure
                        value={transformResponse?.statusCountTransform[0]?.failedCount}
                        label="Total Transforms Failed"
                        className={styles.keyFigureItem}
                    />
                    <KeyFigure
                        value={transformResponse?.statusCountTransform[0]?.pendingCount}
                        label="Total Transforms Pending"
                        className={styles.keyFigureItem}
                    />
                </div>
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <BarChart
                        data={extractionDataByTransformation}
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
                className={styles.transformTable}
                footerActions={isDefined(data) && (
                    <Pager
                        activePage={page}
                        itemsCount={transformResponse?.transforms.totalCount ?? 0}
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
                        pending={transformationsLoading}
                        filtered={filtered}
                        errored={isDefined(transformationsError)}
                    />
                </SortContext.Provider>
                {isRetriggerBannerVisible && (
                    <BulkRetriggerAction
                        onSelectionClear={handleRetriggerActionClose}
                        onRetriggerConfirm={handleRetriggerTransform}
                        selectedItemsCount={selectedIds.length}
                    />
                )}
            </Container>
        </Page>
    );
}

export default Transformation;
