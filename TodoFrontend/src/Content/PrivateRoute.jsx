import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, checking } = useAuth();

  if (checking) return <p>Giriş kontrol ediliyor...</p>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
