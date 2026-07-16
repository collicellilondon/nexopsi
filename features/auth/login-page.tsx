"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, recoverySchema, type LoginFormValues, type RecoveryFormValues } from "@/lib/validation/auth";
import { sendPasswordRecovery, signInWithEmail, signInWithGoogle } from "@/lib/auth/supabase-auth";
import { cn } from "@/lib/utils";

type AuthState =
  | "normal"
  | "loading"
  | "invalid"
  | "connection"
  | "disabled"
  | "unconfirmed"
  | "success"
  | "recovery-sent";

const demoEmail = "demo@nexopsi.com";
const demoPassword = "nexopsi123";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("normal");
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true }
  });

  const recoveryForm = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" }
  });

  const alert = useMemo(() => getAuthAlert(authState), [authState]);

  async function onSubmit(values: LoginFormValues) {
    setAuthState("loading");
    const isDemo = values.email.toLowerCase() === demoEmail && values.password === demoPassword;

    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      document.cookie = `nexopsi_session=demo; path=/; max-age=${values.remember ? 60 * 60 * 24 * 30 : 60 * 60}; samesite=lax`;
      setAuthState("success");
      setTimeout(() => router.push(returnTo), 650);
      return;
    }

    const result = await signInWithEmail(values.email, values.password);
    if (!result.error) {
      document.cookie = `nexopsi_session=demo; path=/; max-age=${values.remember ? 60 * 60 * 24 * 30 : 60 * 60}; samesite=lax`;
      setAuthState("success");
      setTimeout(() => router.push(returnTo), 650);
      return;
    }

    const message = result.error.message.toLowerCase();
    if (message.includes("disabled")) setAuthState("disabled");
    else if (message.includes("confirm")) setAuthState("unconfirmed");
    else if (message.includes("network") || message.includes("fetch")) setAuthState("connection");
    else setAuthState("invalid");
  }

  async function onRecovery(values: RecoveryFormValues) {
    await sendPasswordRecovery(values.email);
    setAuthState("recovery-sent");
    setRecoveryOpen(false);
  }

  async function onGoogle() {
    setAuthState("loading");
    const result = await signInWithGoogle();
    if (result.error) {
      setAuthState("connection");
      return;
    }
    setAuthState("success");
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
        <InstitutionalPanel />

        <section className="flex min-h-screen flex-col bg-[#F8FAF9] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandMark compact />
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Acesso seguro</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[430px] animate-[authEnter_520ms_ease-out]">
              <div className="mb-8">
                <p className="text-sm font-bold text-secondary">Nexopsi</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">Bem-vindo de volta</h1>
                <p className="mt-2 text-sm leading-6 text-[#667085]">Entre para continuar cuidando da sua clínica.</p>
              </div>

              {alert ? <AuthAlert state={authState} title={alert.title} description={alert.description} /> : null}

              <form className="mt-5 space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <Field label="E-mail" error={form.formState.errors.email?.message} htmlFor="email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@clinica.com"
                      className="h-12 rounded-md border-[#E4E7EC] pl-10"
                      aria-invalid={Boolean(form.formState.errors.email)}
                      aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                      {...form.register("email")}
                    />
                  </div>
                </Field>

                <Field label="Senha" error={form.formState.errors.password?.message} htmlFor="password">
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Sua senha"
                      className="h-12 rounded-md border-[#E4E7EC] px-10"
                      aria-invalid={Boolean(form.formState.errors.password)}
                      aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[#667085] transition hover:bg-primary-soft hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 font-semibold text-[#667085]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#E4E7EC] accent-primary"
                      {...form.register("remember")}
                    />
                    Manter-me conectado
                  </label>
                  <button
                    type="button"
                    className="font-bold text-primary transition hover:text-[#173E47]"
                    onClick={() => {
                      recoveryForm.setValue("email", form.getValues("email"));
                      setRecoveryOpen(true);
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={authState === "loading"}
                  className="h-12 w-full rounded-md bg-primary text-base transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  {authState === "loading" ? <Spinner /> : null}
                  {authState === "loading" ? "Entrando..." : "Entrar na plataforma"}
                  {authState !== "loading" ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-[#E4E7EC]" />
                  <span className="text-xs font-bold text-[#667085]">ou continue com</span>
                  <span className="h-px flex-1 bg-[#E4E7EC]" />
                </div>

                <Button type="button" variant="outline" className="h-12 w-full rounded-md border-[#E4E7EC] bg-white hover:bg-primary-soft" onClick={onGoogle}>
                  <GoogleIcon />
                  Continuar com Google
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-[#667085]">
                Ainda não possui uma conta?{" "}
                <button type="button" className="font-black text-primary hover:text-[#173E47]" onClick={() => setAuthState("success")}>
                  Solicite uma demonstração
                </button>
              </div>

              <p className="mt-8 text-center text-xs font-semibold text-[#667085]">Privacidade · Termos de uso · Suporte</p>
              <p className="mt-3 text-center text-xs text-[#667085]">Demo: {demoEmail} / {demoPassword}</p>
            </div>
          </div>
        </section>
      </div>

      {recoveryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(31,41,55,0.22)]">
            <h2 className="text-xl font-black text-ink">Recuperar senha</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">Informe seu e-mail e enviaremos as instruções de recuperação.</p>
            <form className="mt-5 space-y-4" onSubmit={recoveryForm.handleSubmit(onRecovery)} noValidate>
              <Field label="E-mail" error={recoveryForm.formState.errors.email?.message} htmlFor="recovery-email">
                <Input id="recovery-email" type="email" autoComplete="email" placeholder="voce@clinica.com" className="h-12" {...recoveryForm.register("email")} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => setRecoveryOpen(false)}>Cancelar</Button>
                <Button type="submit">Enviar instruções</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function InstitutionalPanel() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#173E47] px-10 py-9 text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(95,158,140,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(145deg,#173E47_0%,#0F2E35_100%)]" />
      <div className="absolute left-[-8%] top-[18%] h-72 w-72 animate-[softFloat_9s_ease-in-out_infinite] rounded-full border border-white/10" />
      <div className="absolute bottom-[12%] right-[8%] h-56 w-56 animate-[softFloat_11s_ease-in-out_infinite] rounded-[42%] border border-secondary/20" />
      <div className="absolute inset-x-20 top-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10">
        <BrandMark />
        <p className="mt-3 text-sm text-white/70">Gestão clínica simples, segura e humana.</p>
      </div>

      <div className="relative z-10 my-auto max-w-2xl">
        <h2 className="text-5xl font-black leading-tight tracking-tight">
          Mais tempo para cuidar.
          <br />
          Menos tempo para administrar.
        </h2>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/72">Organize sua agenda, seus pacientes e sua clínica em um só lugar.</p>
        <div className="mt-8 grid gap-3">
          <Benefit icon={<ShieldCheck className="h-4 w-4" />} text="Seus dados protegidos" />
          <Benefit icon={<Sparkles className="h-4 w-4" />} text="Rotina clínica organizada" />
          <Benefit icon={<HeartHandshake className="h-4 w-4" />} text="Informações sempre acessíveis" />
        </div>
      </div>

      <p className="relative z-10 text-sm text-white/55">Desenvolvido para profissionais que cuidam de pessoas.</p>
    </section>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex items-center justify-center rounded-md bg-white text-primary", compact ? "h-10 w-10" : "h-11 w-11")}>
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className={cn("font-black", compact ? "text-lg text-ink" : "text-xl text-white")}>Nexopsi</p>
      </div>
    </div>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex w-fit items-center gap-3 rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm font-semibold text-white/82">
      <span className="text-secondary">{icon}</span>
      {text}
    </div>
  );
}

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-bold text-ink">{label}</label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="mt-2 text-sm font-semibold text-[#D64545]">{error}</p> : null}
    </div>
  );
}

function AuthAlert({ state, title, description }: { state: AuthState; title: string; description: string }) {
  const positive = state === "success" || state === "recovery-sent";
  const connection = state === "connection";
  return (
    <div className={cn("flex gap-3 rounded-md border p-3 text-sm", positive ? "border-emerald-200 bg-emerald-50 text-[#176B4D]" : "border-red-100 bg-red-50 text-[#9F2F2F]")}>
      {positive ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : connection ? <WifiOff className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function getAuthAlert(state: AuthState) {
  const alerts: Partial<Record<AuthState, { title: string; description: string }>> = {
    invalid: { title: "Não foi possível entrar", description: "E-mail ou senha incorretos." },
    connection: { title: "Conexão indisponível", description: "Tente novamente em instantes." },
    disabled: { title: "Conta desativada", description: "Entre em contato com o suporte da clínica." },
    unconfirmed: { title: "E-mail não confirmado", description: "Confirme seu e-mail antes de acessar." },
    success: { title: "Acesso confirmado", description: "Redirecionando para sua clínica..." },
    "recovery-sent": { title: "Instruções enviadas", description: "Enviamos as instruções de recuperação para o seu e-mail." }
  };
  return alerts[state];
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}
