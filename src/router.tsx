import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainPage from './pages/MainPage'
import AppOneLayout, { AppOneHome } from './apps/app-one/AppOne'
import AppTwoLayout, { AppTwoHome } from './apps/app-two/AppTwo'
import AppThreeLayout, { AppThreeOverview, appThreeLoader } from './apps/app-three/AppThree'
import ErrorPage from './ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/apps/app-one" replace />,
  },
  {
    path: '/apps',
    element: <MainPage />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'app-one',
        element: <AppOneLayout />,
        children: [{ index: true, element: <AppOneHome /> }],
      },
      {
        path: 'app-two', 
        element: <AppTwoLayout />,
        children: [{ index: true, element: <AppTwoHome /> }],
      },
      {
        path: 'app-three',
        element: <AppThreeLayout />,
        children: [{ index: true, element: <AppThreeOverview />, loader: appThreeLoader }],
      },
    ],
  },
])
