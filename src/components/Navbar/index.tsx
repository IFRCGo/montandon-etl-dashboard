import PageContainer from '#components/PageContainer';

import goLogo from '../../assets/go-logo.svg';

import styles from './styles.module.css';

// eslint-disable-next-line import/prefer-default-export
export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <PageContainer
                className={styles.top}
                contentClassName={styles.topContent}
            >
                <div className={styles.brand}>
                    <img
                        className={styles.goIcon}
                        src={goLogo}
                        alt="go Logo"
                    />
                </div>
            </PageContainer>
        </nav>
    );
}
