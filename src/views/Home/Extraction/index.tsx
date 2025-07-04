import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    gql,
    useMutation,
    useQuery,
} from '@apollo/client';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Checkbox,
    type CheckboxProps,
    ConfirmButton,
    Container,
    DateInput,
    KeyFigure,
    Pager,
    Popup,
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
    type DataStatusTypeEnum,
    type ExtractionsQuery,
    type ExtractionsQueryVariables,
    type FilterEnumsQuery,
    type RetriggerPipelineMutation,
    type RetriggerPipelineMutationVariables,
    type SourceTypeEnum,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import getEnumLabelFromValue from '#utils/common';
import { FILTER_ENUMS } from '#utils/queries';

import styles from './styles.module.css';

const EXTRACTIONS = gql`
    query Extractions (
        $pagination: OffsetPaginationInput,
        $filters: ExtractionDataFilter,
    ) {
        extractions(
            filters: $filters,
            pagination: $pagination
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

const RETRIGGER = gql`
    mutation RetriggerPipeline($data: PipelineRetriggerInput!) {
        retriggerPipeline(data: $data)
    }
`;

type DataSourceType = NonNullable<NonNullable<NonNullable<FilterEnumsQuery['enums']>['ExtractionDataSource']>[number]>;
type ExtractionDataStatusType = NonNullable<NonNullable<NonNullable<FilterEnumsQuery['enums']>['ExtractionDataStatus']>[number]>;
type ExtractionDataItemType = NonNullable<NonNullable<NonNullable<ExtractionsQuery['extractions']>['results']>[number]> & {
    isSelected: boolean;
};
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRetriggerBannerVisible, setIsRetriggerBannerVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const alert = useAlert();
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
    } = useQuery<FilterEnumsQuery>(
        FILTER_ENUMS,
    );

    const [
        retriggerTransform,
    ] = useMutation<RetriggerPipelineMutation, RetriggerPipelineMutationVariables>(
        RETRIGGER,
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

    const handleRetriggerTransform = useCallback(() => {
        retriggerTransform({
            variables: {
                data: {
                    traceId: selectedIds.map(Number),
                },
            },
        });
    }, [retriggerTransform, selectedIds]);

    const handleCloseRetriggerBanner = () => {
        setIsRetriggerBannerVisible(false);
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
    const statusOptions = filterEnumsResponse?.enums?.ExtractionDataStatus;

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
                }),
            ),
            createStringColumn<ExtractionDataItemType, string>(
                'id',
                'Extraction Id',
                (item) => item.id,
                { columnClassName: styles.id },
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
            createStringColumn<ExtractionDataItemType, string>(
                'respDataType',
                'Response data Type',
                (item) => item.respDataType,
                { sortable: true },
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
            createStringColumn<ExtractionDataItemType, string>(
                'sourceValidationStatus',
                'Source validation Status',
                (item) => getEnumLabelFromValue(
                    item.sourceValidationStatus,
                    filterEnumsResponse?.enums?.ExtractionDataSourceValidationStatus ?? [],
                ),
                {
                    sortable: true,
                },
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
            createStringColumn<ExtractionDataItemType, string>(
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
            createNumberColumn<ExtractionDataItemType, string>(
                'respCode',
                'Response Code',
                (item) => item.respCode,
            ),
        ]),
        [
            handleCheckboxChange,
            filterEnumsResponse?.enums?.ExtractionDataSourceValidationStatus,
            sourceOptions,
            statusOptions,
        ],
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
                        data={dataWithSelection}
                        keySelector={keySelector}
                        pending={extractionsLoading}
                        filtered={filtered}
                        errored={isDefined(extractionsError)}
                    />
                </SortContext.Provider>
                {isRetriggerBannerVisible && (
                    <div
                        ref={containerRef}
                    >
                        <Popup
                            parentRef={containerRef}
                            className={styles.popup}
                        >
                            <Container
                                className={styles.retriggerAction}
                                actions={(
                                    <Button
                                        name={undefined}
                                        variant="tertiary"
                                        onClick={handleCloseRetriggerBanner}
                                    >
                                        <CloseLineIcon />
                                    </Button>
                                )}
                                footerContent={(
                                    <>
                                        <div>{`${selectedIds.length} items selected.`}</div>
                                        <ConfirmButton
                                            name="retrigger"
                                            title="Retrigger"
                                            onConfirm={handleRetriggerTransform}
                                        >
                                            Retrigger selected items
                                        </ConfirmButton>
                                    </>

                                )}
                            />

                        </Popup>
                    </div>
                )}
            </Container>
        </Page>
    );
}

export default Extraction;
