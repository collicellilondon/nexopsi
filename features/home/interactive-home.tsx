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

    async function loadProfessionalProfile() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, crp, phone")
          .eq("id", userId)
          .maybeSingle();

        const metadata = userData.user?.user_metadata ?? {};
        if (error || !active) return;

        setProfessionalProfile({
          name: data?.full_name ?? String(metadata.full_name ?? ""),
          register: data?.crp ?? String(metadata.crp ?? ""),
          email: String(metadata.email ?? userData.user?.email ?? ""),
          phone: data?.phone ?? String(metadata.phone ?? ""),
          specialty: String(metadata.specialty ?? "Psicologia clinica"),
          bio: String(metadata.bio ?? ""),
          photoUrl: data?.avatar_url ?? String(metadata.avatar_url ?? "")
        });
      } catch {
        // O painel continua utilizavel mesmo se o Supabase estiver indisponivel.
      }
    }

    loadProfessionalProfile();

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

  function savePatient(patient: Patient) {
    setPatients((current) => [patient, ...current]);
    setPatientModalOpen(false);
    notify(`Paciente ${patient.name} cadastrado com ficha completa.`);
    setActiveView("pacientes");
    setGlobalFilter(patient.name);
  }

  async function saveProfessionalProfile(profile: ProfessionalProfileData) {
    setProfessionalProfile(profile);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        notify("Cadastro salvo nesta tela, mas entre novamente para gravar no Supabase.");
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: profile.name || "Profissional Nexopsi",
          avatar_url: profile.photoUrl || null,
          crp: profile.register || null,
          phone: profile.phone || null
        },
        { onConflict: "id" }
      );

      const metadataResult = await supabase.auth.updateUser({
        data: {
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
        notify(`Não foi possível salvar no Supabase: ${metadataResult.error.message}`);
        return;
      }

      if (error) {
        notify("Cadastro salvo no Supabase. A tabela de perfis precisa receber a migração para gravar a ficha completa.");
        return;
      }

      notify(`Cadastro profissional salvo no Supabase para ${profile.name || "profissional"}.`);
    } catch {
      notify("Não foi possível conectar ao Supabase para salvar o cadastro profissional.");
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
          <ClinicalCalendar createdCount={sessionSeed} patients={patients} onNotify={notify} />
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
          <FinancePanel searchQuery={activeView === "financeiro" ? globalFilter : ""} onNotify={notify} />
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
        <ThemeSettings onNotify={notify} />
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
