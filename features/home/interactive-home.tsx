"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Settings, Stethoscope, Users, WalletCards } from "lucide-react";
import { AppShell, type AppView, type SearchSuggestion } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { Dashboard } from "@/features/dashboard/dashboard";
import { PatientList } from "@/features/patients/patient-list";
import { PatientRegistrationModal } from "@/features/patients/patient-registration-modal";
import { ClinicalCalendar } from "@/features/calendar/clinical-calendar";
import { ReportsPanel } from "@/features/reports/reports-panel";
import { ThemeSettings } from "@/features/settings/theme-settings";
import { FinancePanel } from "@/features/finance/finance-panel";
import { SessionManagement } from "@/features/sessions/session-management";
import { DocumentCenter } from "@/features/documents/document-center";
import { ProfessionalProfile, type ProfessionalProfileData } from "@/features/settings/professional-profile";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Patient } from "@/lib/types";

export function InteractiveHome() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [activeView, setActiveView] = useState<AppView>("inicio");
  const [globalFilter, setGlobalFilter] = useState("");
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfileData>({
    name: "",
    register: "",
    email: "",
    phone: "",
    specialty: "Psicologia clinica",
    bio: "",
    photoUrl: ""
  });
  const [message, setMessage] = useState("Ambiente zerado: complete o cadastro profissional e comece criando pacientes, sessoes e documentos.");
  const allPatients = useMemo(() => dedupePatients(patients), [patients]);
  const patientSuggestions = useMemo<SearchSuggestion[]>(
    () =>
      allPatients.map((patient) => ({
        id: patient.id,
        label: patient.name,
        description: `${patient.phone} - ${patient.email}`,
        searchText: [patient.cpf, patient.address, patient.therapist, patient.status, ...patient.tags].filter(Boolean).join(" ")
      })),
    [allPatients]
  );

  useEffect(() => {
    let active = true;

    async function loadAppData() {
      try {
        const storedPatients = readStoredPatients();
        if (active && storedPatients.length > 0) {
          setPatients(dedupePatients(storedPatients));
        }

        const supabase = createBrowserSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return;
        const metadata = userData.user?.user_metadata ?? {};

        const { data: ensuredWorkspaceId, error: workspaceError } = await supabase.rpc("ensure_personal_workspace", {
          profile_name: String(metadata.full_name ?? userData.user?.email ?? "Profissional Nexopsi")
        });
        if (workspaceError || !ensuredWorkspaceId) {
          notify(`Nao foi possivel preparar o banco de dados: ${workspaceError?.message ?? "workspace nao encontrado"}.`);
          return;
        }
        if (!active) return;
        setWorkspaceId(String(ensuredWorkspaceId));

        const { data, error } = await supabase
          .from("professional_profiles")
          .select("full_name, avatar_url, crp, phone, email, specialty, bio")
          .eq("organization_id", ensuredWorkspaceId)
          .eq("profile_id", userId)
          .maybeSingle();

        const { data: baseProfile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, crp, phone, email, specialty, bio")
          .eq("id", userId)
          .maybeSingle();

        if (error || !active) return;
        const profileData = data ?? baseProfile;

        setProfessionalProfile({
          name: profileData?.full_name ?? String(metadata.full_name ?? ""),
          register: profileData?.crp ?? String(metadata.crp ?? ""),
          email: profileData?.email ?? String(metadata.email ?? userData.user?.email ?? ""),
          phone: profileData?.phone ?? String(metadata.phone ?? ""),
          specialty: profileData?.specialty ?? String(metadata.specialty ?? "Psicologia clinica"),
          bio: profileData?.bio ?? String(metadata.bio ?? ""),
          photoUrl: profileData?.avatar_url ?? String(metadata.avatar_url ?? "")
        });

        const { data: savedPatients, error: patientsError } = await supabase
          .from("patients")
          .select("id, full_name, cpf, birth_date, status, tags, notes, email, phone, address, emergency_contact, guardian, occupation, referral_source, main_complaint, pending_balance, next_session, last_session")
          .eq("organization_id", ensuredWorkspaceId)
          .order("created_at", { ascending: false });

        if (patientsError) {
          notify(`Nao foi possivel carregar pacientes do Supabase: ${patientsError.message}`);
          return;
        }

        const nextPatients = (savedPatients ?? []).map((patient) => mapDatabasePatient(patient, profileData?.full_name ?? String(metadata.full_name ?? "")));
        if (active) {
          setPatients(nextPatients);
          storePatientsLocally(nextPatients);
        }
      } catch {
        // O painel continua utilizavel mesmo se o Supabase estiver indisponivel.
      }
    }

    loadAppData();

    return () => {
      active = false;
    };
  }, []);

  function notify(text: string) {
    setMessage(text);
  }

  function createPatient() {
    setActiveView("pacientes");
    setGlobalFilter("");
    setPatientModalOpen(true);
    notify("Cadastro completo de paciente aberto.");
  }

  async function savePatient(patient: Patient) {
    const optimisticPatients = dedupePatients([patient, ...patients]);
    setPatients(optimisticPatients);
    storePatientsLocally(optimisticPatients);
    setPatientModalOpen(false);
    notify(`Salvando paciente ${patient.name} no Supabase...`);
    setActiveView("pacientes");
    setGlobalFilter(patient.name);

    try {
      const supabase = createBrowserSupabaseClient();
      const organizationId = workspaceId ?? (await ensureWorkspace(supabase, professionalProfile.name || "Profissional Nexopsi"));
      setWorkspaceId(organizationId);

      const payload = mapPatientToDatabase(patient, organizationId);
      const { data, error } = await supabase.from("patients").insert(payload).select("id, full_name, cpf, birth_date, status, tags, notes, email, phone, address, emergency_contact, guardian, occupation, referral_source, main_complaint, pending_balance, next_session, last_session").single();
      if (error) {
        notify(`Nao foi possivel salvar o paciente no Supabase: ${error.message}`);
        return;
      }

      const savedPatient = mapDatabasePatient(data, professionalProfile.name || patient.therapist);
      const nextPatients = dedupePatients([savedPatient, ...patients.filter((item) => item.id !== patient.id)]);
      setPatients(nextPatients);
      storePatientsLocally(nextPatients);
      notify(`Paciente ${patient.name} salvo no Supabase.`);
    } catch {
      notify("Nao foi possivel conectar ao Supabase para salvar o paciente.");
    }
  }

  async function saveProfessionalProfile(profile: ProfessionalProfileData) {
    setProfessionalProfile(profile);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        notify("Cadastro salvo nesta tela, mas entre novamente para gravar no Supabase.");
        return false;
      }

      const organizationId = workspaceId ?? (await ensureWorkspace(supabase, profile.name || "Profissional Nexopsi"));
      setWorkspaceId(organizationId);

      const { data: rpcProfile, error: rpcError } = await supabase
        .rpc("save_professional_profile", {
          profile_name: profile.name || "Profissional Nexopsi",
          profile_register: profile.register || null,
          profile_email: profile.email || userData.user?.email || null,
          profile_phone: profile.phone || null,
          profile_specialty: profile.specialty || null,
          profile_bio: profile.bio || null,
          profile_photo_url: profile.photoUrl || null
        })
        .single();

      if (rpcError) {
        notify(`Nao foi possivel salvar o cadastro profissional no Supabase: ${rpcError.message}`);
        return false;
      }

      if (rpcProfile) {
        const profileRow = rpcProfile as DatabaseProfessionalProfile;
        setProfessionalProfile({
          name: profileRow.full_name ?? profile.name,
          register: profileRow.crp ?? "",
          email: profileRow.email ?? profile.email,
          phone: profileRow.phone ?? "",
          specialty: profileRow.specialty ?? profile.specialty,
          bio: profileRow.bio ?? profile.bio,
          photoUrl: profileRow.avatar_url ?? ""
        });
      }

      const currentMetadata = userData.user?.user_metadata ?? {};
      const metadataResult = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          full_name: profile.name || "Profissional Nexopsi",
          avatar_url: profile.photoUrl || "",
          crp: profile.register || "",
          phone: profile.phone || "",
          email: profile.email || userData.user?.email || "",
          specialty: profile.specialty || "",
          bio: profile.bio || ""
        }
      });

      if (metadataResult.error) {
        notify(`Cadastro salvo no Supabase, mas os metadados do login nao foram atualizados: ${metadataResult.error.message}`);
      } else {
        notify(`Cadastro profissional salvo no Supabase para ${profile.name || "profissional"}.`);
      }

      return true;
    } catch {
      notify("Não foi possível conectar ao Supabase para salvar o cadastro profissional.");
      return false;
    }
  }


  function createSession() {
    setActiveView("agenda");
    setGlobalFilter("");
    setSessionSeed((value) => value + 1);
    notify("Sessão de teste adicionada na agenda.");
  }

  function openDocuments() {
    setActiveView("documentos");
    setGlobalFilter("");
    notify("Central de Documentos aberta para gerar um novo arquivo.");
  }

  function runGlobalSearch(rawQuery: string) {
    const query = rawQuery.trim();
    const normalized = normalizeSearch(query);
    if (!normalized) {
      notify("Digite algo para executar a busca global.");
      return;
    }

    const foundPatient = allPatients.find((patient) =>
      [patient.name, patient.email, patient.phone, patient.cpf, patient.address, patient.therapist, ...patient.tags]
        .filter(Boolean)
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(normalized)
    );

    if (foundPatient || includesAny(normalized, ["paciente", "cpf", "telefone", "contato", "endereco", "saldo"])) {
      setActiveView("pacientes");
      setGlobalFilter(query);
      notify(foundPatient ? `Paciente encontrado: ${foundPatient.name}.` : `Busca aberta em Pacientes por "${query}".`);
      return;
    }

    if (includesAny(normalized, ["documento", "document", "prontuario", "contrato", "atestado", "declaracao", "lgpd", "termo", "recibo", "encaminhamento", "pdf"])) {
      setActiveView("documentos");
      setGlobalFilter(query);
      notify(`Busca aberta em Documentos por "${query}".`);
      return;
    }

    if (includesAny(normalized, ["sessao", "sessões", "sessoes", "evolucao", "tarefa", "intervencao", "falta", "presenca"])) {
      setActiveView("sessoes");
      setGlobalFilter(query);
      notify(`Busca aberta em Sessões por "${query}".`);
      return;
    }

    if (includesAny(normalized, ["agenda", "horario", "calendario", "retorno", "consulta"])) {
      setActiveView("agenda");
      setGlobalFilter("");
      notify(`Agenda aberta para localizar "${query}".`);
      return;
    }

    if (includesAny(normalized, ["financeiro", "fatura", "mensalidade", "pagamento", "inadimplente", "adimplente", "cobranca", "pix", "boleto"])) {
      setActiveView("financeiro");
      setGlobalFilter(query);
      notify(`Busca aberta no Financeiro por "${query}".`);
      return;
    }

    if (includesAny(normalized, ["relatorio", "grafico", "imprimir", "resumo"])) {
      setActiveView("relatorios");
      setGlobalFilter("");
      notify(`Relatórios abertos para "${query}".`);
      return;
    }

    if (includesAny(normalized, ["configuracao", "config", "tema", "psicologo", "cadastro", "foto", "logo", "crp", "registro"])) {
      setActiveView("configuracoes");
      setGlobalFilter("");
      notify(`Configurações abertas para "${query}".`);
      return;
    }

    setActiveView("inicio");
    setGlobalFilter("");
    notify(`Não encontrei resultado direto para "${query}". Tente paciente, documento, sessão, financeiro ou configurações.`);
  }

  function renderActiveView() {
    if (activeView === "inicio") {
      return (
        <Dashboard
          professionalName={professionalProfile.name}
          professionalRegister={professionalProfile.register}
          onCreatePatient={createPatient}
          onCreateSession={createSession}
          onOpenDocuments={openDocuments}
          onOpenSettings={() => {
            setActiveView("configuracoes");
            setGlobalFilter("");
            notify("Cadastro profissional aberto.");
          }}
          onNotify={notify}
        />
      );
    }

    if (activeView === "pacientes") {
      return (
        <>
          <SectionHeading
            title="Pacientes"
            description="Cadastro completo, busca instantânea, filtros, ficha clínica e saldos em uma visão operacional."
            action="Novo paciente"
            icon={<Users className="h-4 w-4" />}
            onAction={createPatient}
          />
          <PatientList patients={patients} searchQuery={activeView === "pacientes" ? globalFilter : ""} onNotify={notify} />
        </>
      );
    }

    if (activeView === "agenda") {
      return (
        <>
          <SectionHeading
            title="Agenda"
            description="Visualizações por dia, semana, mês e lista, com cores por status do agendamento."
            action="Nova sessão"
            icon={<Plus className="h-4 w-4" />}
            onAction={createSession}
          />
          <ClinicalCalendar createdCount={sessionSeed} workspaceId={workspaceId} patients={patients} onNotify={notify} />
        </>
      );
    }

    if (activeView === "sessoes") {
      return (
        <>
          <SectionHeading
            title="Sessões"
            description="Evolução clínica, presença, tarefas terapêuticas, pagamentos, documentos e resumo de atendimento."
            action="Nova sessão"
            icon={<Stethoscope className="h-4 w-4" />}
            onAction={createSession}
          />
          <SessionManagement createdCount={sessionSeed} searchQuery={activeView === "sessoes" ? globalFilter : ""} onNotify={notify} />
        </>
      );
    }

    if (activeView === "financeiro") {
      return (
        <>
          <SectionHeading
            title="Financeiro"
            description="Faturas, mensalidades, adimplência, inadimplência, cobranças, recibos e previsibilidade de caixa."
            action="Nova fatura"
            icon={<WalletCards className="h-4 w-4" />}
            onAction={() => notify("Use o botão Nova fatura dentro do financeiro.")}
          />
          <FinancePanel workspaceId={workspaceId} patients={patients} searchQuery={activeView === "financeiro" ? globalFilter : ""} onNotify={notify} />
        </>
      );
    }

    if (activeView === "documentos") {
      return (
        <>
          <SectionHeading
            title="Documentos"
            description="Modelos clínicos, prontuários, contratos, termos, atestados, assinaturas, envio e impressão em PDF."
            action="Novo documento"
            icon={<FileText className="h-4 w-4" />}
            onAction={openDocuments}
          />
          <DocumentCenter
            professionalName={professionalProfile.name}
            professionalRegister={professionalProfile.register}
            professionalEmail={professionalProfile.email}
            professionalPhone={professionalProfile.phone}
            searchQuery={activeView === "documentos" ? globalFilter : ""}
            onNotify={notify}
          />
        </>
      );
    }

    if (activeView === "relatorios") {
      return (
        <>
          <SectionHeading
            title="Relatórios"
            description="Gráficos de desempenho, status da agenda e impressão de prontuários e resumos em PDF."
            action="Imprimir prontuário"
            icon={<Plus className="h-4 w-4" />}
            onAction={() => window.print()}
          />
          <ReportsPanel
            patients={patients}
            professionalName={professionalProfile.name}
            professionalRegister={professionalProfile.register}
            professionalEmail={professionalProfile.email}
            professionalPhone={professionalProfile.phone}
            onNotify={notify}
          />
        </>
      );
    }

    return (
      <>
        <SectionHeading
          title="Configurações"
          description="Temas visuais da plataforma, preferências da clínica e personalização da experiência."
          action="Tema padrão"
          icon={<Settings className="h-4 w-4" />}
          onAction={() => notify("Tema padrão Nexopsi selecionado.")}
        />
        <ThemeSettings workspaceId={workspaceId} onNotify={notify} />
        <div className="mt-6">
          <ProfessionalProfile initialProfile={professionalProfile} onNotify={notify} onSave={saveProfessionalProfile} />
        </div>
      </>
    );
  }

  return (
    <AppShell
      professionalName={professionalProfile.name}
      professionalSpecialty={professionalProfile.specialty}
      professionalPhotoUrl={professionalProfile.photoUrl}
      activeView={activeView}
      onNavigate={(view) => {
        setActiveView(view);
        setGlobalFilter("");
      }}
      onGlobalSearch={runGlobalSearch}
      searchSuggestions={patientSuggestions}
      onNotify={notify}
      onCreatePatient={createPatient}
      onCreateSession={createSession}
    >
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="rounded-md border border-secondary/25 bg-secondary-soft px-4 py-3 text-sm font-semibold text-secondary">
          {message}
        </div>
        <div className="min-h-[calc(100vh-10rem)]">{renderActiveView()}</div>
      </div>

      {patientModalOpen ? <PatientRegistrationModal professionalName={professionalProfile.name} onClose={() => setPatientModalOpen(false)} onCreate={savePatient} /> : null}
    </AppShell>
  );
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function dedupePatients(items: Patient[]) {
  const seen = new Set<string>();
  return items.filter((patient) => {
    const key = patient.id || patient.email || patient.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const patientStorageKey = "nexopsi_patients";

type DatabasePatient = {
  id: string;
  full_name: string;
  cpf: string | null;
  birth_date: string | null;
  status: "active" | "paused" | "discharged" | "intake";
  tags: string[] | null;
  notes: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  emergency_contact: string | null;
  guardian: string | null;
  occupation: string | null;
  referral_source: string | null;
  main_complaint: string | null;
  pending_balance: number | string | null;
  next_session: string | null;
  last_session: string | null;
};

type DatabaseProfessionalProfile = {
  full_name: string | null;
  avatar_url: string | null;
  crp: string | null;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  bio: string | null;
};

async function ensureWorkspace(supabase: ReturnType<typeof createBrowserSupabaseClient>, profileName: string) {
  const { data, error } = await supabase.rpc("ensure_personal_workspace", {
    profile_name: profileName
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Workspace nao encontrado.");
  }

  return String(data);
}

function mapDatabasePatient(patient: DatabasePatient, therapist: string): Patient {
  return {
    id: patient.id,
    name: patient.full_name,
    age: calculateAge(patient.birth_date),
    status: mapDatabaseStatus(patient.status),
    tags: patient.tags ?? [],
    nextSession: patient.next_session ?? "A agendar",
    lastSession: patient.last_session ?? "Sem historico",
    pendingBalance: Number(patient.pending_balance ?? 0),
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    therapist,
    cpf: patient.cpf ?? "",
    birthDate: patient.birth_date ?? "",
    address: patient.address ?? "",
    emergencyContact: patient.emergency_contact ?? "",
    guardian: patient.guardian ?? "",
    occupation: patient.occupation ?? "",
    referralSource: patient.referral_source ?? "",
    mainComplaint: patient.main_complaint ?? "",
    clinicalNotes: patient.notes ?? ""
  };
}

function mapPatientToDatabase(patient: Patient, organizationId: string) {
  return {
    organization_id: organizationId,
    full_name: patient.name,
    cpf: patient.cpf || null,
    birth_date: patient.birthDate || null,
    status: mapPatientStatus(patient.status),
    tags: patient.tags ?? [],
    notes: patient.clinicalNotes || null,
    email: patient.email || null,
    phone: patient.phone || null,
    address: patient.address || null,
    emergency_contact: patient.emergencyContact || null,
    guardian: patient.guardian || null,
    occupation: patient.occupation || null,
    referral_source: patient.referralSource || null,
    main_complaint: patient.mainComplaint || null,
    pending_balance: patient.pendingBalance ?? 0,
    next_session: patient.nextSession || "A agendar",
    last_session: patient.lastSession || "Sem historico"
  };
}

function calculateAge(birthDate?: string | null) {
  if (!birthDate) return 0;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
}

function mapDatabaseStatus(status: DatabasePatient["status"]): Patient["status"] {
  const statusMap: Record<DatabasePatient["status"], Patient["status"]> = {
    active: "ativo",
    paused: "pausado",
    discharged: "alta",
    intake: "triagem"
  };
  return statusMap[status] ?? "triagem";
}

function mapPatientStatus(status: Patient["status"]) {
  const statusMap: Record<Patient["status"], DatabasePatient["status"]> = {
    ativo: "active",
    pausado: "paused",
    alta: "discharged",
    triagem: "intake"
  };
  return statusMap[status] ?? "intake";
}

function readStoredPatients() {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(patientStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return readMetadataPatients(parsed);
  } catch {
    return [];
  }
}

function readMetadataPatients(value: unknown): Patient[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Patient => {
    if (!item || typeof item !== "object") return false;
    const patient = item as Partial<Patient>;
    return typeof patient.id === "string" && typeof patient.name === "string";
  });
}

function storePatientsLocally(items: Patient[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(patientStorageKey, JSON.stringify(items));
  } catch {
    // O Supabase continua sendo a fonte principal.
  }
}
