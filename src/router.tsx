import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import MainPage from './pages/MainPage'
import AppOneLayout, { AppOneHome } from './apps/app-one/AppOne'
import AppTwoLayout, { AppTwoHome } from './apps/app-two/AppTwo'
import AppThreeLayout, { AppThreeOverview, appThreeLoader } from './apps/app-three/AppThree'
import ErrorPage from './ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/apps/app-one',
    element: <AppOneLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AppOneHome /> },
    ],
  },
  {
    path: '/apps/app-two',
    element: <AppTwoLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AppTwoHome /> },
    ],
  },
  {
    path: '/apps/app-three',
    element: <AppThreeLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Demonstration loader: loads a post and provides it to the component
      { index: true, element: <AppThreeOverview />, loader: appThreeLoader },
    ],
  },
])
