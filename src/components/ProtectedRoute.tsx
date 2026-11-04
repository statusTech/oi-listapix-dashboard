import { Navigate, Outlet } from "react-router-dom";
import { useAuth, type Role } from "../context/AuthContext";

interface ProtectedRouteProps {
  /** Papéis com acesso. Sem a prop, basta estar logado com qualquer papel. */
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { token, role, loading } = useAuth();
  if (loading) return null;
  if (!token || !role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
