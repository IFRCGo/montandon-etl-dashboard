import { gql } from '@apollo/client';

// eslint-disable-next-line import/prefer-default-export
export const FILTER_ENUMS = gql`
    query FilterEnums {
        enums {
            ExtractionDataSource {
                key
                label
            }
            ExtractionDataSourceValidationStatus {
                key
                label
            }
            ExtractionDataStatus {
                key
                label
            }
            PyStacLoadDataItemType {
                label
                key
            }
            PyStacLoadDataStatus {
                key
                label
            }
        }
    }
`;
