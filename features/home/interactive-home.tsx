"use client";

import { useState } from "react";
import { Plus, Settings, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { Dashboard } from "@/features/dashboard/dashboard";
import { PatientList } from "@/features/patients/patient-list";
import { PatientRegistrationModal } from "@/features/patients/patient-registration-modal";
import { ClinicalCalendar } from "@/features/calendar/clinical-calendar";
import { ReportsPanel } from "@/features/reports/reports-panel";
import { ThemeSettings } from "@/features/settings/theme-settings";
import type { Patient } from "@/lib/types";

export function InteractiveHome() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [message, setMessage] = useState("Ambiente de testes ativo: os dados são mockados e reiniciam ao recarregar.");

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
    notify("Sessão de teste adicionada na agenda.");
    document.getElementById("agenda")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <AppShell onNotify={notify} onCreatePatient={createPatient} onCreateSession={createSession}>
      <div className="mx-auto max-w-[1500px] space-y-10">
        <div className="rounded-md border border-secondary/25 bg-secondary-soft px-4 py-3 text-sm font-semibold text-secondary">
          {message}
        </div>

        <Dashboard onCreatePatient={createPatient} onCreateSession={createSession} onNotify={notify} />

        <section id="pacientes">
          <SectionHeading
            title="Pacientes"
            description="Cadastro completo, busca instantânea, filtros, ficha clínica e saldos em uma visão operacional."
            action="Novo paciente"
            icon={<Users className="h-4 w-4" />}
            onAction={createPatient}
          />
          <PatientList patients={patients} onNotify={notify} />
        </section>

        <section id="agenda">
          <SectionHeading
            title="Agenda"
            description="Visualizações por dia, semana, mês e lista, com cores por status do agendamento."
            action="Nova sessão"
            icon={<Plus className="h-4 w-4" />}
            onAction={createSession}
          />
          <ClinicalCalendar createdCount={sessionSeed} onNotify={notify} />
        </section>

        <section id="relatorios">
          <SectionHeading
            title="Relatórios"
            description="Gráficos de desempenho, status da agenda e impressão de prontuários e resumos em PDF."
            action="Imprimir prontuário"
            icon={<Plus className="h-4 w-4" />}
            onAction={() => window.print()}
          />
          <ReportsPanel patients={patients} onNotify={notify} />
        </section>

        <section id="configuracoes">
          <SectionHeading
            title="Configurações"
            description="Temas visuais da plataforma, preferências da clínica e personalização da experiência."
            action="Tema padrão"
            icon={<Settings className="h-4 w-4" />}
            onAction={() => notify("Tema padrão Nexopsi selecionado.")}
          />
          <ThemeSettings onNotify={notify} />
        </section>
      </div>

      {patientModalOpen ? <PatientRegistrationModal onClose={() => setPatientModalOpen(false)} onCreate={savePatient} /> : null}
    </AppShell>
  );
}
