import { isNotDefined } from '@togglecorp/fujs';

import {
    type AppEnumCollectionExtractionDataSource,
    type AppEnumCollectionExtractionDataSourceValidationStatus,
    type AppEnumCollectionExtractionDataStatus,
    type AppEnumCollectionPyStacLoadDataItemType,
    type AppEnumCollectionPyStacLoadDataStatus,
} from '#generated/types/graphql';

type EnumType = NonNullable<AppEnumCollectionExtractionDataSource
    | AppEnumCollectionExtractionDataSourceValidationStatus
    | AppEnumCollectionExtractionDataStatus
    | AppEnumCollectionPyStacLoadDataItemType
    | AppEnumCollectionPyStacLoadDataStatus>;

export default function getEnumLabelFromValue(enumKey: EnumType['label'], enumList: EnumType[]) {
    if (isNotDefined(enumList)) {
        return undefined;
    }
    const foundItem = enumList.find((item) => item.key === enumKey);
    if (!foundItem) {
        return undefined;
    }
    return foundItem?.label;
}
