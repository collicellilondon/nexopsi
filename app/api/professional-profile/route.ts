import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SupabaseAdmin = any;

type ProfilePayload = {
  name?: string;
  register?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  photoUrl?: string;
};

type ProfessionalRow = {
  id?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  crp?: string | null;
  phone?: string | null;
  email?: string | null;
  specialty?: string | null;
  bio?: string | null;
  professional_name?: string | null;
  professional_registration?: string | null;
  professional_bio?: string | null;
  profile_photo_url?: string | null;
};

export async function GET(request: Request) {
  const context = await createRequestContext(request);
  if (!context.ok) return context.response;

  const workspace = await ensureWorkspace(context.admin, context.user.id, context.user.email, context.user.email ?? "Profissional Nexopsi");
  if (!workspace.ok) return errorResponse(workspace.message, 500);

  const profile = await loadProfile(context.admin, workspace.organizationId, context.user.id);
  return NextResponse.json({
    organizationId: workspace.organizationId,
    profile: mapProfileResponse(profile, context.user.email ?? "")
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

  const fullName = clean(payload.name) || "Profissional Nexopsi";
  const email = clean(payload.email) || context.user.email || "";
  const workspace = await ensureWorkspace(context.admin, context.user.id, email, fullName);
  if (!workspace.ok) return errorResponse(workspace.message, 500);

  const saved = await saveProfile(context.admin, workspace.organizationId, context.user.id, {
    name: fullName,
    register: clean(payload.register),
    email,
    phone: clean(payload.phone),
    specialty: clean(payload.specialty) || "Psicologia clinica",
    bio: clean(payload.bio),
    photoUrl: clean(payload.photoUrl)
  });

  if (!saved.ok) return errorResponse(saved.message, 500);

  return NextResponse.json({
    organizationId: workspace.organizationId,
    profile: mapProfileResponse(saved.profile, email)
  });
}

async function createRequestContext(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !anonKey) {
    return { ok: false as const, response: errorResponse("Supabase nao configurado.", 500) };
  }

  if (!serviceRoleKey) {
    return {
      ok: false as const,
      response: errorResponse("Configure SUPABASE_SERVICE_ROLE_KEY na Vercel para salvar o cadastro profissional pelo servidor.", 500)
    };
  }

  const token = readBearerToken(request);
  if (!token) return { ok: false as const, response: errorResponse("Sessao ausente. Entre novamente.", 401) };

  const authClient = createClient(supabaseUrl, anonKey);
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return { ok: false as const, response: errorResponse("Sessao invalida. Entre novamente.", 401) };

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  }) as SupabaseAdmin;

  return { ok: true as const, admin, user: data.user };
}

async function ensureWorkspace(admin: SupabaseAdmin, userId: string, email: string | undefined, profileName: string) {
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: profileName,
      email: email || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );
  if (profileError) return { ok: false as const, message: profileError.message, organizationId: "" };

  const { data: membership, error: membershipError } = await admin
    .from("organization_members")
    .select("organization_id")
    .eq("profile_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (membershipError) return { ok: false as const, message: membershipError.message, organizationId: "" };
  if (membership?.organization_id) return { ok: true as const, message: "", organizationId: String(membership.organization_id) };

  const { data: organization, error: organizationError } = await admin
    .from("organizations")
    .insert({ name: `${profileName} - Nexopsi` })
    .select("id")
    .single();

  if (organizationError || !organization?.id) {
    return { ok: false as const, message: organizationError?.message ?? "Organizacao nao criada.", organizationId: "" };
  }

  const { error: memberError } = await admin.from("organization_members").insert({
    organization_id: organization.id,
    profile_id: userId,
    role: "owner",
    active: true
  });

  if (memberError) return { ok: false as const, message: memberError.message, organizationId: "" };
  return { ok: true as const, message: "", organizationId: String(organization.id) };
}

async function loadProfile(admin: SupabaseAdmin, organizationId: string, userId: string) {
  const modern = await admin
    .from("professional_profiles")
    .select("id, full_name, avatar_url, crp, phone, email, specialty, bio, professional_name, professional_registration, professional_bio, profile_photo_url")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!modern.error && modern.data) return modern.data as ProfessionalRow;

  const legacy = await admin
    .from("professional_profiles")
    .select("id, full_name, avatar_url, crp, phone, email, specialty, bio")
    .eq("organization_id", organizationId)
    .eq("profile_id", userId)
    .maybeSingle();
  if (!legacy.error && legacy.data) return legacy.data as ProfessionalRow;

  const base = await admin
    .from("profiles")
    .select("full_name, avatar_url, crp, phone, email, specialty, bio")
    .eq("id", userId)
    .maybeSingle();
  return (base.data as ProfessionalRow | null) ?? null;
}

async function saveProfile(admin: SupabaseAdmin, organizationId: string, userId: string, payload: Required<ProfilePayload>) {
  const now = new Date().toISOString();
  const legacyPayload = {
    organization_id: organizationId,
    profile_id: userId,
    full_name: payload.name,
    avatar_url: payload.photoUrl || null,
    crp: payload.register || null,
    phone: payload.phone || null,
    email: payload.email || null,
    specialty: payload.specialty || null,
    bio: payload.bio || null
  };
  const modernPayload = {
    ...legacyPayload,
    user_id: userId,
    clinic_id: organizationId,
    professional_name: payload.name,
    professional_registration: payload.register || null,
    professional_bio: payload.bio || null,
    document_signature: payload.register ? `${payload.name} - ${payload.register}` : payload.name,
    profile_photo_url: payload.photoUrl || null,
    currency: "BRL",
    timezone: "America/Sao_Paulo"
  };

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: payload.name,
      avatar_url: payload.photoUrl || null,
      crp: payload.register || null,
      phone: payload.phone || null,
      email: payload.email || null,
      specialty: payload.specialty || null,
      bio: payload.bio || null,
      updated_at: now
    },
    { onConflict: "id" }
  );
  if (profileError) return { ok: false as const, message: profileError.message, profile: null };

  const existing = await loadProfile(admin, organizationId, userId);
  const query = existing?.id
    ? admin.from("professional_profiles").update({ ...modernPayload, updated_at: now }).eq("id", existing.id)
    : admin.from("professional_profiles").insert(modernPayload);

  const { data, error } = await query
    .select("id, full_name, avatar_url, crp, phone, email, specialty, bio, professional_name, professional_registration, professional_bio, profile_photo_url")
    .single();

  if (!error && data) return { ok: true as const, message: "", profile: data as ProfessionalRow };

  const legacyQuery = existing?.id
    ? admin.from("professional_profiles").update({ ...legacyPayload, updated_at: now }).eq("id", existing.id)
    : admin.from("professional_profiles").insert(legacyPayload);
  const legacyResult = await legacyQuery.select("id, full_name, avatar_url, crp, phone, email, specialty, bio").single();

  if (legacyResult.error) return { ok: false as const, message: legacyResult.error.message || error?.message || "", profile: null };
  return { ok: true as const, message: "", profile: legacyResult.data as ProfessionalRow };
}

function mapProfileResponse(profile: ProfessionalRow | null, fallbackEmail: string) {
  return {
    name: profile?.professional_name ?? profile?.full_name ?? "",
    register: profile?.professional_registration ?? profile?.crp ?? "",
    email: profile?.email ?? fallbackEmail,
    phone: profile?.phone ?? "",
    specialty: profile?.specialty ?? "Psicologia clinica",
    bio: profile?.professional_bio ?? profile?.bio ?? "",
    photoUrl: profile?.profile_photo_url ?? profile?.avatar_url ?? ""
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
