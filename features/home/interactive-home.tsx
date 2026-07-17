"use client";

import { useState } from "react";
import { Plus, Settings, Users, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { Dashboard } from "@/features/dashboard/dashboard";
import { PatientList } from "@/features/patients/patient-list";
import { PatientRegistrationModal } from "@/features/patients/patient-registration-modal";
import { ClinicalCalendar } from "@/features/calendar/clinical-calendar";
import { ReportsPanel } from "@/features/reports/reports-panel";
import { ThemeSettings } from "@/features/settings/theme-settings";
import { FinancePanel } from "@/features/finance/finance-panel";
import { ProfessionalProfile, type ProfessionalProfileData } from "@/features/settings/professional-profile";
import type { Patient } from "@/lib/types";

export function InteractiveHome() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfileData>({
    name: "Tatiane Bonfin",
    register: "CRP 06/123456",
    email: "tatiane@nexopsi.com",
    phone: "(11) 99999-0000",
    specialty: "Psicologia clinica",
    bio: "Atendimento adulto com foco em ansiedade, organizacao emocional e qualidade de vida."
  });
  const [message, setMessage] = useState("Ambiente de testes ativo: os dados sao mockados e reiniciam ao recarregar.");

  function notify(text: string) {
    setMessage(text);
  }

  function createPatient() {
    setPatientModalOpen(true);
    notify("Cadastro completo de paciente aberto.");
  }

  function savePatient(patient: Patient) {
    setPatients((current) => [patient, ...current]);
    setPatientModalOpen(false);
    notify(`Paciente ${patient.name} cadastrado com ficha completa.`);
    document.getElementById("pacientes")?.scrollIntoView({ behavior: "smooth" });
  }

  function createSession() {
    setSessionSeed((value) => value + 1);
    notify("Sessao de teste adicionada na agenda.");
    document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <AppShell
      professionalName={professionalProfile.name}
      professionalSpecialty={professionalProfile.specialty}
      onNotify={notify}
      onCreatePatient={createPatient}
      onCreateSession={createSession}
    >
      <div className="mx-auto max-w-[1500px] space-y-10">
        <div className="rounded-md border border-secondary/25 bg-secondary-soft px-4 py-3 text-sm font-semibold text-secondary">
          {message}
        </div>

        <Dashboard professionalName={professionalProfile.name} onCreatePatient={createPatient} onCreateSession={createSession} onNotify={notify} />

        <section id="pacientes">
          <SectionHeading
            title="Pacientes"
            description="Cadastro completo, busca instantanea, filtros, ficha clinica e saldos em uma visao operacional."
            action="Novo paciente"
            icon={<Users className="h-4 w-4" />}
            onAction={createPatient}
          />
          <PatientList patients={patients} onNotify={notify} />
        </section>

        <section id="agenda">
          <SectionHeading
            title="Agenda"
            description="Visualizacoes por dia, semana, mes e lista, com cores por status do agendamento."
            action="Nova sessao"
            icon={<Plus className="h-4 w-4" />}
            onAction={createSession}
          />
          <ClinicalCalendar createdCount={sessionSeed} onNotify={notify} />
        </section>

        <section id="financeiro">
          <SectionHeading
            title="Financeiro"
            description="Faturas, mensalidades, adimplencia, inadimplencia, cobrancas, recibos e previsibilidade de caixa."
            action="Nova fatura"
            icon={<WalletCards className="h-4 w-4" />}
            onAction={() => notify("Use o botao Nova fatura dentro do financeiro.")}
          />
          <FinancePanel onNotify={notify} />
        </section>

        <section id="relatorios">
          <SectionHeading
            title="Relatorios"
            description="Graficos de desempenho, status da agenda e impressao de prontuarios e resumos em PDF."
            action="Imprimir prontuario"
            icon={<Plus className="h-4 w-4" />}
            onAction={() => window.print()}
          />
          <ReportsPanel patients={patients} onNotify={notify} />
        </section>

        <section id="configuracoes">
          <SectionHeading
            title="Configuracoes"
            description="Temas visuais da plataforma, preferencias da clinica e personalizacao da experiencia."
            action="Tema padrao"
            icon={<Settings className="h-4 w-4" />}
            onAction={() => notify("Tema padrao Nexopsi selecionado.")}
          />
          <ThemeSettings onNotify={notify} />
          <div className="mt-6">
            <ProfessionalProfile initialProfile={professionalProfile} onNotify={notify} onSave={setProfessionalProfile} />
          </div>
        </section>
      </div>

      {patientModalOpen ? <PatientRegistrationModal onClose={() => setPatientModalOpen(false)} onCreate={savePatient} /> : null}
    </AppShell>
  );
}
