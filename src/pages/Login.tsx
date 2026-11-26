import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import logoBlue from "@/assets/images/logo_blue.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-oi-bg p-4">
      <section className="w-full max-w-sm bg-white border border-oi-border rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xs">
        <div className="flex flex-col items-center gap-3">
          <img src={logoBlue} alt="Oi Tickets" className="h-8 w-auto object-contain" />
          <h1 className="text-lg sm:text-xl font-bold text-oi-text">Lista Pix — Dashboard</h1>
        </div>

        <form autoComplete="off" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="E-mail" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </FormField>
          <FormField label="Senha" htmlFor="login-password" error={error ?? undefined}>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </FormField>
          <Button type="submit" disabled={submitting} className="w-full bg-oi-blue hover:bg-oi-blue/90 text-white">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
