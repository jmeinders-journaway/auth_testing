import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import AssetPage from './pages/asset/asset-page.tsx';
import ProfilePage from './pages/profile/profile-page.tsx';
import SignInPage from './pages/sign-in/sign-in-page.tsx';
import SignUpPage from './pages/sign-up/sign-up-page.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import ProtectedRoute from './routes/protected-route.tsx';
import PublicRoute from './routes/public-route.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to='/sign-in' replace />
  },
  {
    path: '/sign-in',
    element: <PublicRoute><SignInPage /></PublicRoute>
  },
  {
    path: '/sign-up',
    element: <PublicRoute><SignUpPage /></PublicRoute>
  },
  {
    path: '/asset',
    element: <ProtectedRoute><AssetPage /></ProtectedRoute>
  },
  {
    path: '/profile',
    element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
  },
  {
    path: '*',
    element: <Navigate to='/sign-in' replace />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastContainer />
    </Provider>
  </StrictMode>
);
