import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const defaultAppUrl = "https://nexopsi.app.br";

type SignupPayload = {
  email?: string;
  password?: string;
  activationCode?: string;
};

export async function POST(request: Request) {
  let payload: SignupPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados de cadastro invalidos." }, { status: 400 });
  }

  const email = payload.email?.trim();
  const password = payload.password;
  const activationCode = normalizeActivationCode(payload.activationCode);

  if (!email || !password || !activationCode) {
    return NextResponse.json({ error: "Preencha e-mail, senha e codigo de ativacao." }, { status: 400 });
  }

  if (!isValidActivationCode(activationCode)) {
    return NextResponse.json({ error: "Codigo de ativacao invalido. Fale com a ColliDev pelo WhatsApp para liberar seu acesso." }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Supabase nao configurado para criar contas." }, { status: 500 });
  }

  try {
    const appUrl = resolveAppUrl(request);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/dashboard`,
        data: {
          app_name: "Nexopsi",
          activation_status: "validated",
          created_by: "ColliDev"
        }
      }
    });

    if (result.error) {
      return NextResponse.json({ error: translateSignupError(readErrorMessage(result.error)) }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    return NextResponse.json({ error: `Erro ao conectar com o Supabase Auth: ${readErrorMessage(error)}` }, { status: 500 });
  }
}

function isValidActivationCode(value: string) {
  const configuredCodes = [
    process.env.NEXOPSI_ACTIVATION_CODE,
    ...(process.env.NEXOPSI_ACTIVATION_CODES?.split(",") ?? [])
  ]
    .map(normalizeActivationCode)
    .filter(Boolean);

  return configuredCodes.length > 0 && configuredCodes.includes(value);
}

function normalizeActivationCode(value?: string) {
  return value?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
}

function resolveAppUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const origin = request.headers.get("origin")?.trim();
  if (origin?.startsWith("http://localhost") || origin?.startsWith("http://127.0.0.1")) {
    return origin.replace(/\/$/, "");
  }

  return defaultAppUrl;
}

function translateSignupError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already") || normalized.includes("registered") || normalized.includes("exists")) {
    return "Este e-mail ja possui uma conta. Use Entrar ou redefina a senha.";
  }

  if (normalized.includes("password")) {
    return "A senha foi recusada pelo Supabase. Use pelo menos 8 caracteres, com letras e numeros.";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "O cadastro por e-mail esta desativado no Supabase Auth.";
  }

  if (normalized.includes("email")) {
    return "O e-mail foi recusado pelo Supabase. Verifique o endereco informado.";
  }

  return message || "O Supabase recusou o cadastro, mas nao retornou uma mensagem detalhada. Verifique Auth > Logs no Supabase.";
}

function readErrorMessage(error: unknown) {
  if (!error) return "Erro desconhecido.";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = record.message ?? record.error_description ?? record.error ?? record.code ?? record.name;
    if (typeof message === "string" && message.trim()) return message;
    try {
      const serialized = JSON.stringify(record);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      return "Erro desconhecido do Supabase.";
    }
  }

  return "Erro desconhecido do Supabase.";
}
