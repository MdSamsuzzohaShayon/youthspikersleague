import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home.tsx';
import AdminList from './pages/AdminList.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Page404 from './pages/Page404.tsx';
import SingleEvent from './pages/SingleEvent.tsx';
import Score from './pages/Score.tsx';
import AdminRoot from './pages/AdminRoot.tsx';
import AdminIndex from './pages/AdminIndex.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Page404 />,
  },
  {
    path: "/home",
    element: <Home />,
    errorElement: <Page404 />,
  },
  {
    path: "/admin",
    element: <AdminRoot />,
    errorElement: <Page404 />,
    children: [
      {
        children: [
          { index: true, element: <AdminIndex /> },
          {
            path: "list",
            element: <AdminList />,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
          },
          {
            path: "dashboard/event/:id",
            element: <SingleEvent />,
          }
        ],
      },
    ],

  },
  {
    path: "/event/:id",
    element: <Score admin={false} />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
