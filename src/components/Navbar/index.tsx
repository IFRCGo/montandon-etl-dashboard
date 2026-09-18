import { useContext } from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import { Button } from '@ifrc-go/ui';

import PageContainer from '#components/PageContainer';
import UserContext from '#contexts/user';
import { type LogoutMutation } from '#generated/types/graphql';

import goLogo from '../../assets/go-logo.svg';

import styles from './styles.module.css';

const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

// eslint-disable-next-line import/prefer-default-export
export default function Navbar() {
    const { userAuth, removeUserAuth } = useContext(UserContext);

    const [logout] = useMutation<LogoutMutation>(
        LOGOUT,
        {
            onCompleted: () => {
                removeUserAuth();
            },
        },
    );

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
                {userAuth && (
                    <Button
                        name={undefined}
                        variant="secondary"
                        onClick={() => logout()}
                    >
                        Log out
                    </Button>
                )}
            </PageContainer>
        </nav>
    );
}
