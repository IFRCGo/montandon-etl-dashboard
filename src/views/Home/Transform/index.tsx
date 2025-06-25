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
    Button,
    Checkbox,
    type CheckboxProps,
    Container,
    DateInput,
    DateOutput,
    type DateOutputProps,
    KeyFigure,
    Pager,
    SelectInput,
    Table,
    TextInput,
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
import {
    type DataStatusTypeEnum,
    type FilterEnumsQuery,
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
            result
        }
    }
`;
type DataSourceType = NonNullable<NonNullable<NonNullable<FilterEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type TransformsDataStatusType = NonNullable<NonNullable<NonNullable<FilterEnumsQuery['enums']>['ExtractionDataStatus']>[number]>;
type TransformationDataItem = NonNullable<NonNullable<NonNullable<TransformsQuery['transforms']>['results']>[number]> & {
    isSelected: boolean;
};
type TransformFilterType = NonNullable<TransformsQueryVariables['filters']>;

const sourceKeySelector = (option: DataSourceType) => option.key;
const sourceLabelSelector = (option: DataSourceType) => option.label;
const statusKeySelector = (option: TransformsDataStatusType) => option.key;
const statusLabelSelector = (option: TransformsDataStatusType) => option.label;
const keySelector = (item: { id: string }) => item.id;
const PAGE_SIZE = 20;
const ASC = 'ASC';
const DESC = 'DESC';
const emptyArray: [] = [];

function Transformation() {
    const alert = useAlert();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRetriggerBannerVisible, setIsRetriggerBannerVisible] = useState(false);
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
        source?: SourceTypeEnum;
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
                traceId: traceId ? { exact: traceId } : undefined,
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
        transformationResponse?.transforms.results ?? []).map((item) => ({
        ...item,
        isSelected: selectedIds.includes(item.id),
    })), [transformationResponse, selectedIds]);

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
    const statusOptions = filterEnumsResponse?.enums?.ExtractionDataStatus;

    const extractionDataByTransformation = transformationResponse?.statusSourceCountsTransform;

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
            createStringColumn<TransformationDataItem, string>(
                'status',
                'Status',
                (item) => getEnumLabelFromValue(
                    item.status,
                    statusOptions ?? [],
                ),
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
            <div className={styles.figures}>
                <div className={styles.keyFigures}>
                    <KeyFigure
                        value={transformationResponse?.statusCountTransform[0]?.successCount}
                        label="Total Transforms Succeeded"
                        className={styles.keyFigureItem}
                    />
                    <KeyFigure
                        value={transformationResponse?.statusCountTransform[0]?.failedCount}
                        label="Total Transforms Failed"
                        className={styles.keyFigureItem}
                    />
                    <KeyFigure
                        value={transformationResponse?.statusCountTransform[0]?.pendingCount}
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
                        <Bar dataKey="failedCount" stackId="a" fill="#a56eff" />
                        <Bar dataKey="inProgressCount" stackId="a" fill="#009d9a" />
                        <Bar dataKey="pendingCount" stackId="a" fill="#002d9c" />
                        <Bar dataKey="successCount" stackId="a" fill="#fa4d56" />
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
