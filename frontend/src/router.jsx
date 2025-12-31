import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Preview from "./pages/Preview";
import AppLayout from "./layouts/AppLayout.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },

  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "create", element: <Create /> },
      { path: "preview/:id", element: <Preview /> },
    ],
  },
]);

export default router;
