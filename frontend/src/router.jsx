import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
const Landing = lazy(() => import("./pages/Landing"));
const Home = lazy(() => import("./pages/Home"));
const Create = lazy(() => import("./pages/Create"));
const Preview = lazy(() => import("./pages/Preview"));
const PortfolioList = lazy(() => import("./pages/PortfolioList"));
const PortfolioAdmin = lazy(() => import("./pages/PortfolioAdmin"));
const PortfolioView = lazy(() => import("./pages/PortfolioView"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Verify = lazy(() => import("./pages/Verify"));
import AppLayout from "./layouts/AppLayout.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Suspense fallback={<div />}> <Landing /> </Suspense> },

  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Suspense fallback={<div />}> <Home /> </Suspense> },
      { path: "login", element: <Suspense fallback={<div />}> <Login /> </Suspense> },
      { path: "register", element: <Suspense fallback={<div />}> <Register /> </Suspense> },
      { path: "verify", element: <Suspense fallback={<div />}> <Verify /> </Suspense> },
      { path: "create", element: <Suspense fallback={<div />}> <Create /> </Suspense> },
      { path: "create/:id", element: <Suspense fallback={<div />}> <Create /> </Suspense> },
      { path: "preview/:id", element: <Suspense fallback={<div />}> <Preview /> </Suspense> },
      { path: "portfolios", element: <Suspense fallback={<div />}> <PortfolioList /> </Suspense> },
      { path: "portfolios/new", element: <Suspense fallback={<div />}> <PortfolioAdmin /> </Suspense> },
      { path: "portfolios/:id", element: <Suspense fallback={<div />}> <PortfolioView /> </Suspense> },
      { path: "portfolios/:id/edit", element: <Suspense fallback={<div />}> <PortfolioAdmin /> </Suspense> },
    ],
  },
]);

export default router;
