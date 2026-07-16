"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/section-heading";
import { Dashboard } from "@/features/dashboard/dashboard";
import { PatientList } from "@/features/patients/patient-list";
import { ClinicalCalendar } from "@/features/calendar/clinical-calendar";

export function InteractiveHome() {
  const [patientSeed, setPatientSeed] = useState(0);
  const [sessionSeed, setSessionSeed] = useState(0);
  const [message, setMessage] = useState("Ambiente de testes ativo: os dados são mockados e reiniciam ao recarregar.");

  function notify(text: string) {
    setMessage(text);
  }

  function createPatient() {
    setPatientSeed((value) => value + 1);
    notify("Paciente de teste criado na listagem.");
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
            description="Busca instantânea, filtros, status, tags, saldos e próximos atendimentos em uma visão operacional."
            action="Novo paciente"
            icon={<Users className="h-4 w-4" />}
            onAction={createPatient}
          />
          <PatientList createdCount={patientSeed} onNotify={notify} />
        </section>

        <section id="agenda">
          <SectionHeading
            title="Agenda"
            description="Visualizações por dia, semana, mês e lista, com detalhes laterais para decisões rápidas."
            action="Nova sessão"
            icon={<Plus className="h-4 w-4" />}
            onAction={createSession}
          />
          <ClinicalCalendar createdCount={sessionSeed} onNotify={notify} />
        </section>
      </div>
    </AppShell>
  );
}
