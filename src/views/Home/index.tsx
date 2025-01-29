import {
    HTMLProps,
    useMemo,
} from 'react';
import { Link } from 'react-router-dom';
import {
    gql,
    useQuery,
} from '@apollo/client';
import {
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import { SortContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import {
    type ExtractionDataType,
    type MyQueryQuery,
    type MyQueryQueryVariables,
} from '#generated/types/graphql';

import Page from '#components/Page';
import useFilterState from '#hooks/useFilterState';

import i18n from './i18n.json';
import styles from './styles.module.css';

const keySelector = (item: ExtractionDataType) => item.id;
const PAGE_SIZE = 10;

const EXTRACTION_LIST = gql`
    query MyQuery($pagination: OffsetPaginationInput) {
        private {
            extractionList(pagination: $pagination) {
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

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    const {
        sortState,
        limit,
        offset,
        page,
        setPage,
    } = useFilterState({
        pageSize: PAGE_SIZE,
        filter: {},
    });

    const variables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
    }), [limit, offset]);

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
                'hazardType',
                strings.extractionListHazardTypeTitle,
                (item) => item.hazardType,
                { columnClassName: styles.hazardType },
            ),

            createStringColumn<ExtractionDataType, string>(
                'id',
                strings.extractionListIdTitle,
                (item) => item.id,
                { columnClassName: styles.id },
            ),

            createNumberColumn<ExtractionDataType, string>(
                'parentId',
                strings.extractionListParentIdTitle,
                (item) => item.parentId,
                { columnClassName: styles.parentId },
            ),

            createNumberColumn<ExtractionDataType, string>(
                'respCode',
                strings.extractionListRespCodeTitle,
                (item) => item.respCode,
            ),

            createStringColumn<ExtractionDataType, string>(
                'respDataType',
                strings.extractionListRespDataTypeTitle,
                (item) => item.respDataType,
            ),

            createNumberColumn<ExtractionDataType, string>(
                'revisionId',
                strings.extractionListRevisionIdTitle,
                (item) => item.revisionId,
                { columnClassName: styles.revisionId },
            ),

            createStringColumn<ExtractionDataType, string>(
                'source',
                strings.extractionListSourceTitle,
                (item) => item.source,
                { columnClassName: styles.source },
            ),

            createStringColumn<ExtractionDataType, string>(
                'status',
                strings.extractionListStatusTitle,
                (item) => item.status,
                { columnClassName: styles.status },
            ),

            createNumberColumn<ExtractionDataType, string>(
                'sourceValidationStatus',
                strings.extractionListSourceValidationStatusTitle,
                (item) => item.sourceValidationStatus,
                {columnClassName: styles.sourceValidation}
            ),
            createStringColumn<ExtractionDataType, HTMLProps<HTMLSpanElement>>(
                'url',
                strings.extractionListUrlTitle,
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
        [
            strings.extractionListHazardTypeTitle,
            strings.extractionListIdTitle,
            strings.extractionListParentIdTitle,
            strings.extractionListRespCodeTitle,
            strings.extractionListRespDataTypeTitle,
            strings.extractionListRevisionIdTitle,
            strings.extractionListSourceTitle,
            strings.extractionListSourceValidationStatusTitle,
            strings.extractionListStatusTitle,
            strings.extractionListUrlTitle,
        ],
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
            >
                <SortContext.Provider value={sortState}>
                    <Table
                        columns={columns}
                        data={data?.items}
                        keySelector={keySelector}
                        pending={extractionLoading}
                        filtered={false}
                        errored={isDefined(extractionError)}
                    />
                </SortContext.Provider>
            </Container>
        </Page>

    );
}

Component.displayName = 'Home';
