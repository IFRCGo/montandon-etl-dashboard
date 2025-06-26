import { useState } from 'react';
import {
    Container,
    Tab,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';

import Page from '#components/Page';

import Extraction from './Extraction';
import Load from './Load';
import Transformation from './Transform';

import styles from './styles.module.css';

type TabType = 'extraction' | 'transformation' | 'load';
/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const [
        activeTab,
        setActiveTab,
    ] = useState<TabType>('extraction');

    return (
        <Page
            className={styles.home}
            mainSectionClassName={styles.mainSection}
        >
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
                    <Extraction />
                </TabPanel>
                <TabPanel
                    name="transformation"
                >
                    <Transformation />
                </TabPanel>
                <TabPanel
                    name="load"
                >
                    <Load />
                </TabPanel>

            </Tabs>

        </Page>
    );
}

Component.displayName = 'Home';
