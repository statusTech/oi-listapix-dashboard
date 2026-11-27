import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import logoBlue from "@/assets/images/logo_blue.png";
import logoListaPix from "@/assets/images/logo_listapix.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="flex w-full items-center justify-center gap-4">
            <div className="flex-1">
              <img src={logoBlue} alt="Oi Tickets" className="h-auto w-full" />
            </div>
            <div className="flex-1">
              <img src={logoListaPix} alt="Lista PIX" className="h-auto w-full" />
            </div>
          </div>
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
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                className="pr-10"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:text-oi-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormField>
          <Button type="submit" disabled={submitting} className="w-full bg-oi-blue hover:bg-oi-blue/90 text-white">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
