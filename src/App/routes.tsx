import type {
    MyInputIndexRouteObject,
    MyInputNonIndexRouteObject,
    MyInputRouteObject,
    MyOutputIndexRouteObject,
    MyOutputNonIndexRouteObject,
    MyOutputRouteObject,
} from '#utils/routes';
import {
    unwrapRoute,
    wrapRoute,
} from '#utils/routes';

import PageError from './PageError';

// NOTE: setting default ExtendedProps
type ExtendedProps = { name?: string };
interface MyWrapRoute {
    <T>(
        myRouteOptions: MyInputIndexRouteObject<T, ExtendedProps>
    ): MyOutputIndexRouteObject<ExtendedProps>
    <T>(
        myRouteOptions: MyInputNonIndexRouteObject<T, ExtendedProps>
    ): MyOutputNonIndexRouteObject<ExtendedProps>
    <T>(
        myRouteOptions: MyInputRouteObject<T, ExtendedProps>,
    ): MyOutputRouteObject<ExtendedProps>
}
const myWrapRoute: MyWrapRoute = wrapRoute;

const root = myWrapRoute({
    title: '',
    path: '/',
    component: () => import('#views/Root'),
    componentProps: {},
    errorElement: <PageError />,
});

const home = myWrapRoute({
    title: 'Home',
    index: true,
    component: () => import('#views/Home'),
    componentProps: { name: 'Montandon' },
    parent: root,
});

export const wrappedRoutes = {
    root,
    home,
};

export const unwrappedRoutes = unwrapRoute(Object.values(wrappedRoutes));
export type WrappedRoutes = typeof wrappedRoutes;
