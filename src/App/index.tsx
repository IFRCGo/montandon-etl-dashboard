import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import {
    gql,
    useQuery,
} from '@apollo/client';
import { BlockLoading } from '@ifrc-go/ui';

import RouteContext from '#contexts/route';
import UserContext, {
    UserAuth,
    UserContextProps,
} from '#contexts/user';
import {
    MeQuery,
    MeQueryVariables,
} from '#generated/types/graphql';
import Login from '#views/Login';

import {
    unwrappedRoutes,
    wrappedRoutes,
} from './routes';

const ME_QUERY = gql`
    query Me {
        me {
            id
            email
            firstName
            lastName
            displayName
        }
    }
`;

const router = createBrowserRouter(unwrappedRoutes);

function App() {
    const [userAuth, setUserAuth] = useState<UserAuth>();

    const {
        loading,
        data: meResult,
    } = useQuery<MeQuery, MeQueryVariables>(
        ME_QUERY,
    );

    useEffect(() => {
        if (!loading) {
            setUserAuth(meResult?.me ?? undefined);
        }
    }, [meResult, loading]);

    const removeUserAuth = useCallback(
        () => {
            setUserAuth(undefined);
        },
        [],
    );

    const userContextValue = useMemo<UserContextProps>(
        () => ({
            userAuth,
            setUserAuth,
            removeUserAuth,
        }),
        [userAuth, removeUserAuth],
    );

    if (loading) {
        return <BlockLoading />;
    }

    return (
        <RouteContext.Provider value={wrappedRoutes}>
            <UserContext.Provider value={userContextValue}>
                {userAuth ? (
                    <RouterProvider router={router} />
                ) : (
                    <Login onLoggedIn={setUserAuth} />
                )}
            </UserContext.Provider>
        </RouteContext.Provider>
    );
}

export default App;
