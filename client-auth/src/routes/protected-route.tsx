import { Navigate } from 'react-router';
import { useAppSelector } from '../redux/hooks';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to='/sign-in' replace />;
  }

  return children;
}
