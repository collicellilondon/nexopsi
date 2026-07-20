"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  KeyRound,
  LockKeyhole,
  Mail,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  WifiOff,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, passwordResetSchema, recoverySchema, signupSchema, type LoginFormValues, type PasswordResetFormValues, type RecoveryFormValues } from "@/lib/validation/auth";
import { sendPasswordRecovery, signInWithEmail, signUpWithEmail, updatePassword } from "@/lib/auth/supabase-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthState =
  | "normal"
  | "loading"
  | "invalid"
  | "connection"
  | "disabled"
  | "unconfirmed"
  | "success"
  | "signup-sent"
  | "recovery-sent"
  | "password-reset-ready"
  | "password-reset-success";

type AuthMode = "signin" | "signup" | "reset";

const salesMessage = "Olá, quero contratar a Nexopsi para minha clínica.";
const salesWhatsAppUrl = process.env.NEXT_PUBLIC_SALES_WHATSAPP_URL || `https://wa.me/4407726425982?text=${encodeURIComponent(salesMessage)}`;

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("normal");
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [resetReady, setResetReady] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", activationCode: "", remember: true }
  });

  const recoveryForm = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: "" }
  });

  const resetForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const alert = useMemo(() => getAuthAlert(authState), [authState]);
  const isSignup = authMode === "signup";
  const isReset = authMode === "reset";

  useEffect(() => {
    const isRecoveryUrl = searchParams.get("modo") === "redefinir-senha" || searchParams.get("type") === "recovery" || window.location.hash.includes("type=recovery");
    if (!isRecoveryUrl) return;

    setAuthMode("reset");
    setAuthState("password-reset-ready");

    try {
      const supabase = createBrowserSupabaseClient();
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setResetReady(true);
      });

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || session) {
          setResetReady(true);
          setAuthMode("reset");
          setAuthState("password-reset-ready");
        }
      });

      return () => data.subscription.unsubscribe();
    } catch {
      setResetReady(false);
    }
  }, [searchParams]);

  async function onSubmit(values: LoginFormValues) {
    setAuthState("loading");

    if (isSignup) {
      const parsed = signupSchema.safeParse(values);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        if (errors.confirmPassword?.[0]) {
          form.setError("confirmPassword", { message: errors.confirmPassword[0] });
        } else if (errors.activationCode?.[0]) {
          form.setError("activationCode", { message: errors.activationCode[0] });
        } else {
          form.setError("password", { message: errors.password?.[0] ?? "Revise os dados do cadastro." });
        }
        setAuthState("normal");
        return;
      }

      const result = await signUpWithEmail(values.email, values.password, values.activationCode ?? "");
      if (!result.error) {
        if (result.data?.session) {
          setSessionCookie(values.remember);
          setAuthState("success");
          setTimeout(() => router.push(returnTo), 650);
          return;
        }

        setAuthState("signup-sent");
        return;
      }

      if (result.error.message.toLowerCase().includes("codigo")) {
        form.setError("activationCode", { message: result.error.message });
        setAuthState("normal");
        return;
      }

      handleAuthError(result.error.message);
      return;
    }

    const result = await signInWithEmail(values.email, values.password);
    if (!result.error) {
      setSessionCookie(values.remember);
      setAuthState("success");
      setTimeout(() => router.push(returnTo), 650);
      return;
    }

    handleAuthError(result.error.message);
  }

  async function onRecovery(values: RecoveryFormValues) {
    setAuthState("loading");
    const result = await sendPasswordRecovery(values.email);
    if (result.error) {
      recoveryForm.setError("email", { message: result.error.message });
      setAuthState("connection");
      return;
    }

    setAuthState("recovery-sent");
    setRecoveryOpen(false);
  }

  async function onResetPassword(values: PasswordResetFormValues) {
    setAuthState("loading");
    const result = await updatePassword(values.password);

    if (!result.error) {
      setAuthState("password-reset-success");
      resetForm.reset();
      setTimeout(() => {
        setAuthMode("signin");
        router.replace("/login");
      }, 1200);
      return;
    }

    resetForm.setError("password", { message: result.error.message });
    setAuthState("password-reset-ready");
  }

  function handleAuthError(message: string) {
    const normalized = message.toLowerCase();
    if (normalized.includes("disabled")) setAuthState("disabled");
    else if (normalized.includes("confirm")) setAuthState("unconfirmed");
    else if (normalized.includes("network") || normalized.includes("fetch") || normalized.includes("supabase")) setAuthState("connection");
    else setAuthState("invalid");
  }

  function switchMode(mode: AuthMode) {
    setAuthMode(mode);
    setAuthState("normal");
    form.clearErrors();
    resetForm.clearErrors();
  }

  return (
    <main className="min-h-screen bg-[#FBFAFF] text-ink">
      <div className="grid min-h-screen lg:grid-cols-[55fr_45fr]">
        <InstitutionalPanel />

        <section className="flex min-h-screen flex-col bg-[#FBFAFF] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <BrandMark compact />
            <Button asChild variant="outline" size="sm" className="rounded-full border-primary/20 bg-white text-primary">
              <Link href="/">Voltar ao site</Link>
            </Button>
          </div>
          <div className="mb-6 hidden justify-end lg:flex">
            <Button asChild variant="outline" className="rounded-full border-primary/20 bg-white px-5 text-primary shadow-line">
              <Link href="/">Voltar para a landing page</Link>
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[430px] animate-[authEnter_520ms_ease-out]">
              <div className="mb-8">
                <div className="mb-6 flex h-24 w-72 items-center overflow-hidden rounded-md bg-white">
                  <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={320} height={160} priority className="h-full w-full object-contain" />
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">{isReset ? "Crie uma nova senha" : isSignup ? "Crie seu acesso" : "Bem-vindo de volta"}</h1>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  {isReset ? "Defina uma senha segura para voltar a acessar sua conta Nexopsi." : isSignup ? "Cadastre seu e-mail para iniciar a experiencia Nexopsi." : "Entre para continuar cuidando da sua clinica."}
                </p>
              </div>

              <div className={cn("grid grid-cols-2 gap-2 rounded-md bg-white p-1 shadow-line", isReset && "hidden")}>
                <button type="button" onClick={() => switchMode("signin")} className={cn("rounded-md px-3 py-2 text-sm font-black transition", !isSignup ? "bg-primary text-white" : "text-[#667085] hover:bg-primary-soft hover:text-primary")}>
                  Entrar
                </button>
                <button type="button" onClick={() => switchMode("signup")} className={cn("rounded-md px-3 py-2 text-sm font-black transition", isSignup ? "bg-primary text-white" : "text-[#667085] hover:bg-primary-soft hover:text-primary")}>
                  Criar conta
                </button>
              </div>

              {alert ? <AuthAlert state={authState} title={alert.title} description={alert.description} /> : null}

              {isReset ? (
                <form className="mt-5 space-y-5" onSubmit={resetForm.handleSubmit(onResetPassword)} noValidate>
                  {!resetReady ? (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                      Abra esta tela pelo link recebido no e-mail de redefinicao para liberar a troca da senha.
                    </div>
                  ) : null}
                  <Field label="Nova senha" error={resetForm.formState.errors.password?.message} htmlFor="new-password">
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Digite a nova senha"
                        className="h-12 rounded-md border-[#E4E7EC] px-10"
                        {...resetForm.register("password")}
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
                  <Field label="Confirmar nova senha" error={resetForm.formState.errors.confirmPassword?.message} htmlFor="new-password-confirm">
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                      <Input
                        id="new-password-confirm"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repita a nova senha"
                        className="h-12 rounded-md border-[#E4E7EC] px-10"
                        {...resetForm.register("confirmPassword")}
                      />
                    </div>
                  </Field>
                  <Button type="submit" disabled={authState === "loading" || !resetReady} className="h-12 w-full rounded-md bg-primary text-base transition duration-200 hover:-translate-y-0.5 hover:brightness-110">
                    {authState === "loading" ? <Spinner /> : null}
                    Salvar nova senha
                    {authState !== "loading" ? <ArrowRight className="h-4 w-4" /> : null}
                  </Button>
                  <button type="button" className="w-full text-sm font-bold text-primary" onClick={() => switchMode("signin")}>
                    Voltar para o login
                  </button>
                </form>
              ) : null}

              <form className={cn("mt-5 space-y-5", isReset && "hidden")} onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <Field label="E-mail" error={form.formState.errors.email?.message} htmlFor="email">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="contato@clinica.com"
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
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      placeholder={isSignup ? "Crie uma senha segura" : "Sua senha"}
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

                {isSignup ? (
                  <Field label="Confirmar senha" error={form.formState.errors.confirmPassword?.message} htmlFor="confirmPassword">
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repita a senha criada"
                        className="h-12 rounded-md border-[#E4E7EC] px-10"
                        aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                        aria-describedby={form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined}
                        {...form.register("confirmPassword")}
                      />
                    </div>
                  </Field>
                ) : null}

                {isSignup ? (
                  <Field label="Codigo de ativacao" error={form.formState.errors.activationCode?.message} htmlFor="activationCode">
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                      <Input
                        id="activationCode"
                        type="text"
                        autoComplete="off"
                        placeholder="Digite a chave recebida apos a compra"
                        className="h-12 rounded-md border-[#E4E7EC] pl-10 uppercase tracking-[0.08em]"
                        aria-invalid={Boolean(form.formState.errors.activationCode)}
                        aria-describedby={form.formState.errors.activationCode ? "activationCode-error" : undefined}
                        {...form.register("activationCode")}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#667085]">
                      Essa chave e liberada pela ColliDev apos a contratacao pelo WhatsApp.
                    </p>
                  </Field>
                ) : null}

                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 font-semibold text-[#667085]">
                    <input type="checkbox" className="h-4 w-4 rounded border-[#E4E7EC] accent-primary" {...form.register("remember")} />
                    Manter-me conectado
                  </label>
                  {!isSignup ? (
                    <button
                      type="button"
                      className="font-bold text-primary transition hover:text-[#5632C6]"
                      onClick={() => {
                        recoveryForm.setValue("email", form.getValues("email"));
                        setRecoveryOpen(true);
                      }}
                    >
                      Esqueci minha senha
                    </button>
                  ) : null}
                </div>

                <Button type="submit" disabled={authState === "loading"} className="h-12 w-full rounded-md bg-primary text-base transition duration-200 hover:-translate-y-0.5 hover:brightness-110">
                  {authState === "loading" ? <Spinner /> : null}
                  {authState === "loading" ? "Processando..." : isSignup ? "Criar conta" : "Entrar na plataforma"}
                  {authState !== "loading" ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>

              </form>

              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSalesOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-2 text-xs font-black text-primary shadow-line transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-soft"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </span>
                  Conhecer a Nexopsi
                </button>
              </div>

              <a href={salesWhatsAppUrl} target="_blank" rel="noreferrer" className="hidden">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-primary">Quero contratar a Nexopsi</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[#667085]">Fale no WhatsApp e comece com uma conta nova para sua clínica.</span>
                </span>
              </a>

              <p className="mt-8 text-center text-xs font-semibold text-[#667085]">Privacidade · Termos de uso · Suporte</p>
              <p className="mt-2 text-center text-xs font-semibold text-[#667085]">
                Criado por <strong className="font-black text-primary">ColliDev</strong>
              </p>
            </div>
          </div>
        </section>
      </div>

      {recoveryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(31,41,55,0.22)]">
            <h2 className="text-xl font-black text-ink">Redefinir senha</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Informe o e-mail cadastrado. Você receberá uma mensagem com um link seguro para criar uma nova senha. Se não encontrar o e-mail em alguns minutos, verifique a caixa de spam.
            </p>
            <form className="mt-5 space-y-4" onSubmit={recoveryForm.handleSubmit(onRecovery)} noValidate>
              <Field label="E-mail" error={recoveryForm.formState.errors.email?.message} htmlFor="recovery-email">
                <Input id="recovery-email" type="email" autoComplete="email" placeholder="contato@clinica.com" className="h-12" {...recoveryForm.register("email")} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => setRecoveryOpen(false)}>Cancelar</Button>
                <Button type="submit">Enviar link seguro</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {salesOpen ? <SalesPopup onClose={() => setSalesOpen(false)} /> : null}
    </main>
  );
}

function setSessionCookie(remember: boolean) {
  document.cookie = `nexopsi_session=auth; path=/; max-age=${remember ? 60 * 60 * 24 * 30 : 60 * 60}; samesite=lax`;
}

function SalesPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-[0_28px_90px_rgba(31,41,55,0.28)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-line transition hover:bg-primary-soft hover:text-primary"
          aria-label="Fechar apresentacao"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-primary px-6 py-8 text-white">
            <div className="auth-flow-lines auth-flow-lines-a opacity-30" />
            <div className="relative z-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/12 text-secondary ring-1 ring-white/15">
                <Rocket className="h-7 w-7" />
              </div>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-white/62">Nexopsi para clínicas</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight">
                Seu consultório com cara de app profissional.
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/72">
                Uma plataforma pronta para organizar agenda, pacientes, documentos, financeiro e relatórios em um único lugar.
              </p>
            </div>
          </div>

          <div className="px-6 py-8">
            <p className="text-sm font-black text-primary">Licença com ativação exclusiva</p>
            <h3 className="mt-2 text-2xl font-black text-ink">Venda com controle, acesso com chave.</h3>
            <p className="mt-3 text-sm leading-6 text-[#667085]">
              A Nexopsi protege o acesso com código de ativação, mantendo o ambiente da clínica mais controlado desde o primeiro cadastro.
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-md border border-primary/15 bg-primary-soft px-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-black text-primary">Seguro e confidencial</span>
                <span className="mt-1 block text-xs font-semibold leading-5 text-[#667085]">
                  Acesso protegido, dados organizados e rotina clínica tratada com privacidade.
                </span>
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                "Agenda clínica com sessões e status de atendimento",
                "Cadastro completo de pacientes e prontuários",
                "Financeiro com mensalidades, faturas e inadimplência",
                "Documentos e relatórios padronizados em PDF"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm font-semibold leading-5 text-ink">{item}</span>
                </div>
              ))}
            </div>

            <a
              href={salesWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-black text-white transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" />
              Contrate agora
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstitutionalPanel() {
  return (
    <section className="relative hidden min-h-screen overflow-hidden bg-[#24145F] px-10 py-9 text-white lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,111,241,0.28),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.10),transparent_28%),linear-gradient(145deg,#24145F_0%,#120B31_100%)]" />
      <div className="auth-flow-lines auth-flow-lines-a" />
      <div className="auth-flow-lines auth-flow-lines-b" />
      <div className="auth-flow-grid" />
      <div className="absolute left-[-8%] top-[18%] h-72 w-72 animate-[softFloat_9s_ease-in-out_infinite] rounded-full border border-white/10" />
      <div className="absolute bottom-[12%] right-[8%] h-56 w-56 animate-[softFloat_11s_ease-in-out_infinite] rounded-[42%] border border-secondary/20" />
      <div className="absolute inset-x-20 top-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10">
        <p className="text-xl font-black text-white">Nexopsi</p>
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
      <div className={cn("flex items-center justify-center overflow-hidden rounded-md bg-white", compact ? "h-14 w-44" : "h-16 w-56")}>
        <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={260} height={130} priority={compact} className="h-full w-full object-contain" />
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
  const positive = state === "success" || state === "recovery-sent" || state === "signup-sent" || state === "password-reset-ready" || state === "password-reset-success";
  const connection = state === "connection";
  return (
    <div className={cn("mt-4 flex gap-3 rounded-md border p-3 text-sm", positive ? "border-emerald-200 bg-emerald-50 text-[#176B4D]" : "border-red-100 bg-red-50 text-[#9F2F2F]")}>
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
    invalid: { title: "Não foi possível continuar", description: "Revise o e-mail e a senha informados." },
    connection: { title: "Conexão indisponível", description: "Tente novamente em instantes ou verifique a configuração do Supabase." },
    disabled: { title: "Conta desativada", description: "Entre em contato com o suporte da clínica." },
    unconfirmed: { title: "E-mail não confirmado", description: "Confirme seu e-mail antes de acessar." },
    success: { title: "Acesso confirmado", description: "Redirecionando para sua clínica..." },
    "signup-sent": { title: "Cadastro iniciado", description: "Enviamos um e-mail de confirmação. Depois de confirmar, volte para entrar na plataforma." },
    "recovery-sent": { title: "Link de redefinição enviado", description: "Enviamos um e-mail em português com o link seguro para criar uma nova senha." },
    "password-reset-ready": { title: "Redefinicao liberada", description: "Digite e confirme sua nova senha para concluir a troca com seguranca." },
    "password-reset-success": { title: "Senha redefinida", description: "Sua nova senha foi salva. Voce ja pode entrar novamente na Nexopsi." }
  };
  return alerts[state];
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}
