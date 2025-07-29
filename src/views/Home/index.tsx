import { useState } from 'react';
import {
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';

import Navbar from '#components/Navbar';
import Page from '#components/Page';
import {
    type DataStatusTypeEnum,
    type PyStacLoadDataItemTypeEnum,
    type PyStacLoadDataStatusEnum,
    type SourceTypeEnum,
} from '#generated/types/graphql';
import useFilterState from '#hooks/useFilterState';
import { type TabType } from '#utils/common';

// eslint-disable-next-line import/no-cycle
import Extraction from './Extraction';
import Filters from './Filters';
import Load from './Load';
import Transformation from './Transform';

import styles from './styles.module.css';

const PAGE_SIZE = 20;

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [
        activeTab,
        setActiveTab,
    ] = useState<TabType>('extraction');

    const {
        rawFilter,
        resetFilter,
        setFilterField,
        filtered,
    } = useFilterState<{
        createdAtStart?: string;
        createdAtEnd?: string;
        traceId?: string;
        source?: SourceTypeEnum;
        extractionTransformStatus?: DataStatusTypeEnum;
        loadStatus?: PyStacLoadDataStatusEnum;
        itemType?: PyStacLoadDataItemTypeEnum;
    }>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    return (
        <>
            <Navbar />
            <Page
                className={styles.home}
                mainSectionClassName={styles.mainSection}
                heading="Montandon ETL Monitoring Dashboard"
            >
                <Filters
                    activeTab={activeTab}
                    setFilterField={setFilterField}
                    resetFilter={resetFilter}
                    rawFilter={rawFilter}
                    filtered={filtered}
                />
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                >
                    <Container
                        headerDescription={(
                            <TabList>
                                <Tab
                                    name="extraction"
                                >
                                    Extraction
                                </Tab>
                                <Tab name="transformation">
                                    Transformation
                                </Tab>
                                <Tab name="load">
                                    Load
                                </Tab>
                            </TabList>
                        )}
                    />
                    <TabPanel
                        name="extraction"
                    >
                        <Extraction
                            filter={rawFilter}
                            filtered={filtered}
                        />
                    </TabPanel>
                    <TabPanel
                        name="transformation"
                    >
                        <Transformation
                            filter={rawFilter}
                            filtered={filtered}
                        />
                    </TabPanel>
                    <TabPanel
                        name="load"
                    >
                        <Load
                            filter={rawFilter}
                            filtered={filtered}
                        />
                    </TabPanel>

                </Tabs>
            </Page>
        </>
    );
}

Component.displayName = 'Home';
