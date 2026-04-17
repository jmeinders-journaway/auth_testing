import { Navigate } from 'react-router';
import { useAppSelector } from '../redux/hooks';

interface Props {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: Props) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to='/profile' replace />;
  }

  return children;
}
