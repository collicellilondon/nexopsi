import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const result = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/dashboard` : undefined
    }
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
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
  return value?.trim().toUpperCase().replace(/\s+/g, "") ?? "";
}
