import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ListaNegra } from "./pages/ListaNegra";
import { LogsIngressos } from "./pages/logs/LogsIngressos";
import { LogsSplit } from "./pages/logs/LogsSplit";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute allowedRoles={["master"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lista-negra" element={<ListaNegra />} />
              <Route path="/logs" element={<Navigate to="/logs/ingressos" replace />} />
              <Route path="/logs/ingressos" element={<LogsIngressos />} />
              <Route path="/logs/split" element={<LogsSplit />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
