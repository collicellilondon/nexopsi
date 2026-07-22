import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ProfilePayload = {
  name?: string;
  register?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  photoUrl?: string;
};

export async function GET(request: Request) {
  const context = await createRequestContext(request);
  if (!context.ok) return context.response;

  const { data, error } = await context.supabase
    .from("professional_profiles")
    .select("full_name, crp, email, phone, specialty, bio, avatar_url")
    .eq("user_id", context.user.id)
    .maybeSingle();

  if (error) return errorResponse(`Nao foi possivel carregar o cadastro profissional: ${error.message}`, 500);

  return NextResponse.json({
    userId: context.user.id,
    profile: mapProfileResponse(data, context.user.email ?? "")
  });
}

export async function POST(request: Request) {
  const context = await createRequestContext(request);
  if (!context.ok) return context.response;

  let payload: ProfilePayload;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("Dados do cadastro profissional invalidos.", 400);
  }

  const profileRow = {
    id: context.user.id,
    user_id: context.user.id,
    full_name: clean(payload.name) || "Profissional Nexopsi",
    crp: clean(payload.register) || null,
    email: clean(payload.email) || context.user.email || null,
    phone: clean(payload.phone) || null,
    specialty: clean(payload.specialty) || "Psicologia clinica",
    bio: clean(payload.bio) || null,
    avatar_url: clean(payload.photoUrl) || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await context.supabase
    .from("professional_profiles")
    .upsert(profileRow, { onConflict: "user_id" })
    .select("full_name, crp, email, phone, specialty, bio, avatar_url")
    .single();

  if (error) return errorResponse(`Nao foi possivel salvar o cadastro profissional: ${error.message}`, 500);

  await context.supabase.from("profiles").upsert(profileRow, { onConflict: "user_id" });

  return NextResponse.json({
    userId: context.user.id,
    profile: mapProfileResponse(data, context.user.email ?? "")
  });
}

async function createRequestContext(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return { ok: false as const, response: errorResponse("Supabase nao configurado.", 500) };
  }

  const token = readBearerToken(request);
  if (!token) return { ok: false as const, response: errorResponse("Sessao ausente. Entre novamente.", 401) };

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  }) as any;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { ok: false as const, response: errorResponse("Sessao invalida. Entre novamente.", 401) };

  return { ok: true as const, supabase, user: data.user };
}

function mapProfileResponse(profile: any, fallbackEmail: string) {
  return {
    name: profile?.full_name ?? "",
    register: profile?.crp ?? "",
    email: profile?.email ?? fallbackEmail,
    phone: profile?.phone ?? "",
    specialty: profile?.specialty ?? "Psicologia clinica",
    bio: profile?.bio ?? "",
    photoUrl: profile?.avatar_url ?? ""
  };
}

function readBearerToken(request: Request) {
  const value = request.headers.get("authorization") ?? "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
