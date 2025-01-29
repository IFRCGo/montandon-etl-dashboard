import { useMemo } from 'react';
import {
    gql,
    useQuery ,
} from '@apollo/client';
import {
    Container,
     Table,
} from '@ifrc-go/ui';
import {
    ExtractionDataType,
    MyQueryQuery,
    MyQueryQueryVariables,
} from '#generated/types/graphql';
import {
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { isDefined } from '@togglecorp/fujs';

import i18n from './i18n.json';
import styles  from './styles.module.css';

const keySelector = (item: ExtractionDataType) => item.id;

const EXTRACTION_LIST = gql`
    query MyQuery {
        private {
            extractionList {
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
            }
        }
    }
`;
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);
    const {
        data: extractionResponse,
        loading: extractionLoading,
        error: extractionError,
    } = useQuery<MyQueryQuery, MyQueryQueryVariables>(EXTRACTION_LIST);
    console.log('data:', extractionResponse);
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

            createStringColumn<ExtractionDataType, string>(
                'revisionId',
                strings.extractionListRevisionIdTitle,
                (item) => item.revisionId,
                { columnClassName: styles.revisionId }
            ),

            createStringColumn<ExtractionDataType, string>(
                'source',
                strings.extractionListSourceTitle,
                (item) => item.source,
                { columnClassName: styles.source }
            ),

            createNumberColumn<ExtractionDataType, string>(
                'sourceValidationStatus',
                strings.extractionListSourceValidationStatusTitle,
                (item) => item.sourceValidationStatus,
            ),
 
            createStringColumn<ExtractionDataType, string>(
                'status',
                strings.extractionListStatusTitle,
                (item) => item.status,
                { columnClassName: styles.status },
            ),

            createStringColumn<ExtractionDataType, string>(
                'url',
                strings.extractionListUrlTitle,
                (item) => item.url,
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
            strings.extractionListUrlTitle
        ]
    );
    return (
        <Container
            heading='Extraction List'
            className={styles.extractionTable}>
            <Table
                columns={columns}
                data={extractionResponse?.private.extractionList.items}
                keySelector={keySelector}
                pending={extractionLoading}
                filtered={false}
                errored={isDefined(extractionError)}
            />
        </Container>
    );
}

Component.displayName = 'Home';
