import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
const Landing = lazy(() => import('./pages/Landing'));
const Home = lazy(() => import('./pages/Home'));
const Create = lazy(() => import('./pages/Create'));
const Preview = lazy(() => import('./pages/Preview'));
const PortfolioList = lazy(() => import('./pages/PortfolioList'));
const PortfolioAdmin = lazy(() => import('./pages/PortfolioAdmin'));
const PortfolioView = lazy(() => import('./pages/PortfolioView'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Verify = lazy(() => import('./pages/Verify'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

const withSuspense = (element) => (
  <Suspense
    fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-white">
        <div className="h-9 w-9 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
      </div>
    }
  >
    {element}
  </Suspense>
);

const protectedPage = (element) => <ProtectedRoute>{withSuspense(element)}</ProtectedRoute>;

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(<Landing />),
  },

  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: protectedPage(<Home />),
      },
      {
        path: 'login',
        element: withSuspense(<Login />),
      },
      {
        path: 'register',
        element: withSuspense(<Register />),
      },
      {
        path: 'verify',
        element: withSuspense(<Verify />),
      },
      {
        path: 'create',
        element: protectedPage(<Create />),
      },
      {
        path: 'create/:id',
        element: protectedPage(<Create />),
      },
      {
        path: 'preview/:id',
        element: protectedPage(<Preview />),
      },
      {
        path: 'portfolios',
        element: protectedPage(<PortfolioList />),
      },
      {
        path: 'portfolios/new',
        element: protectedPage(<PortfolioAdmin />),
      },
      {
        path: 'portfolios/:id',
        element: protectedPage(<PortfolioView />),
      },
      {
        path: 'portfolios/:id/edit',
        element: protectedPage(<PortfolioAdmin />),
      },
      {
        path: 'privacy',
        element: withSuspense(<Privacy />),
      },
      {
        path: 'terms',
        element: withSuspense(<Terms />),
      },
    ],
  },
]);

export default router;
