import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const defaultAppUrl = "https://nexopsi.app.br";

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.signInWithPassword({ email, password });
  } catch {
    return {
      data: null,
      error: { message: "Supabase nao configurado. Verifique as variaveis de ambiente." }
    };
  }
}

export async function signUpWithEmail(email: string, password: string, activationCode: string) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, activationCode })
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      return {
        data: null,
        error: { message: readPayloadError(payload) }
      };
    }

    const session = readSession(payload);
    if (session?.access_token && session.refresh_token) {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });

      if (error) {
        return {
          data: null,
          error: { message: `Conta criada, mas nao foi possivel iniciar a sessao no navegador: ${error.message}` }
        };
      }
    }

    return {
      data: payload.data ?? null,
      error: null
    };
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel criar a conta agora." }
    };
  }
}

function readPayloadError(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Nao foi possivel criar a conta agora.";
  const error = (payload as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) {
    if (error.trim() === "{}") {
      return "O Supabase recusou o cadastro sem mensagem. Verifique o SMTP customizado do Auth, principalmente remetente, dominio, usuario, senha/API key e porta.";
    }
    return error;
  }
  if (error && typeof error === "object") {
    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      return "Nao foi possivel ler o erro retornado pelo servidor.";
    }
  }
  return "O servidor recusou o cadastro sem mensagem detalhada. Verifique os logs do Supabase Auth.";
}

async function readJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return { error: `Resposta inesperada do servidor (${response.status}).` };
  }
}

function readSession(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const session = (data as { session?: unknown }).session;
  if (!session || typeof session !== "object") return null;
  return session as { access_token?: string; refresh_token?: string };
}

export async function sendPasswordRecovery(email: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/login?modo=redefinir-senha`
    });
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel enviar o email de redefinicao. Verifique o SMTP no Supabase." }
    };
  }
}

export async function updatePassword(password: string) {
  try {
    const supabase = createBrowserSupabaseClient();
    return await supabase.auth.updateUser({ password });
  } catch {
    return {
      data: null,
      error: { message: "Nao foi possivel redefinir a senha agora." }
    };
  }
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || window.location.origin || defaultAppUrl).replace(/\/$/, "");
}
