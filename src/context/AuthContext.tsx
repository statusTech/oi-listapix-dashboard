import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";

// Mesma allowlist de UID usada em admin/src/service/auth.js:8,18 — mesmos 2
// super-admins de hoje, mesmo projeto Firebase.
const ALLOWED_UIDS = ["mIx721WKurVotrfVmggEOqKYCfl1", "mxG5BZs7hUd1qsas4wKH6Lh0fZg1"];

interface AuthContextValue {
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !ALLOWED_UIDS.includes(user.uid)) {
        setToken(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!ALLOWED_UIDS.includes(credential.user.uid)) {
        await signOut(auth);
        return { error: "Usuario sem permissao de acesso a este painel." };
      }
      const response = await api.post("/authenticateDash", { userKey: credential.user.uid });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      return { error: null };
    } catch (err) {
      console.error("[AuthContext] login failed:", err);
      return { error: "E-mail ou senha invalidos." };
    }
  }

  async function logout() {
    await signOut(auth);
    setToken(null);
    localStorage.removeItem("token");
  }

  return <AuthContext.Provider value={{ token, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
