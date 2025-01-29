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

import RouteContext from '#contexts/route';
import UserContext, {
    UserAuth,
    UserContextProps,
} from '#contexts/user';
import {
    MeQuery,
    MeQueryVariables,
} from '#generated/types/graphql';

import {
    unwrappedRoutes,
    wrappedRoutes,
} from './routes';

const ME_QUERY = gql`
    query Me {
        private {
            me {
                email
                firstName
                id
                isStaff
                isSuperuser
                lastName
                username
            }
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
            setUserAuth(meResult?.private?.me ?? undefined);
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

    return (
        <RouteContext.Provider value={wrappedRoutes}>
            <UserContext.Provider value={userContextValue}>
                <RouterProvider router={router} />
            </UserContext.Provider>
        </RouteContext.Provider>
    );
}

export default App;
