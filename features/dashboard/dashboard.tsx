"use client";

import { useState } from "react";
import {
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  Receipt,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appointments, clinicalPendencies, dashboardMetrics } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClass = {
  primary: "bg-primary-soft text-primary",
  secondary: "bg-secondary-soft text-secondary",
  warning: "bg-amber-50 text-warning",
  success: "bg-emerald-50 text-success",
  danger: "bg-red-50 text-destructive"
};

type DashboardProps = {
  professionalName: string;
  onCreatePatient: () => void;
  onCreateSession: () => void;
  onOpenDocuments: () => void;
  onNotify: (message: string) => void;
};

export function Dashboard({ professionalName, onCreatePatient, onCreateSession, onOpenDocuments, onNotify }: DashboardProps) {
  const [pendingItems, setPendingItems] = useState(clinicalPendencies);

  const quickActions = [
    { label: "Criar paciente", icon: UserPlus, action: onCreatePatient },
    { label: "Agendar sessão", icon: CalendarPlus, action: onCreateSession },
    { label: "Registrar pagamento", icon: Receipt, action: () => onNotify("Pagamento registrado como pago.") },
    { label: "Gerar documento", icon: FilePlus2, action: onOpenDocuments }
  ];

  function resolvePending(item: string) {
    setPendingItems((current) => current.filter((pending) => pending !== item));
    onNotify(`Pendência revisada: ${item}`);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg bg-primary px-5 py-6 text-white shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/75">Sexta-feira, 17 de julho de 2026</p>
          <h1 className="mt-2 text-2xl font-black md:text-3xl">Bom dia, {getFirstName(professionalName)}. Sua clínica está organizada para hoje.</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/78">
            Visão executiva da agenda, prontuários, pacientes e pendências clínicas para conduzir o dia com segurança.
          </p>
        </div>
        <button type="button" onClick={onCreateSession} className="rounded-md bg-white/12 p-4 text-left transition hover:bg-white/20">
          <p className="text-sm text-white/75">Próxima sessão</p>
          <p className="mt-1 text-xl font-black">Nenhuma hoje</p>
          <p className="text-sm text-white/75">Clique para criar a primeira sessão</p>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardMetrics.map((metric) => (
          <button key={metric.label} type="button" onClick={() => onNotify(`${metric.label}: ${metric.value}`)} className="text-left">
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink-muted">{metric.label}</p>
                    <p className="mt-2 text-2xl font-black text-ink">{metric.value}</p>
                    <p className="mt-1 text-sm text-ink-muted">{metric.helper}</p>
                  </div>
                  <span className={cn("h-3 w-3 rounded-full", toneClass[metric.tone])} />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Saúde operacional da clínica</CardTitle>
            <CardDescription>Resumo profissional dos pontos de atenção para hoje.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <OperationalItem icon={CheckCircle2} title="Agenda configurada" value="0" description="Sessões cadastradas para acompanhamento." tone="success" />
            <OperationalItem icon={ShieldCheck} title="Prontuários ativos" value="0" description="Registros clínicos vinculados a pacientes." tone="primary" />
            <OperationalItem icon={CalendarPlus} title="Retornos a confirmar" value="0" description="Pacientes com próxima sessão ainda sem confirmação." tone="warning" />
            <OperationalItem icon={ClipboardCheck} title="Documentos pendentes" value="0" description="Termos, relatórios ou evoluções aguardando revisão." tone="danger" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendências clínicas</CardTitle>
            <CardDescription>Clique em uma pendência para marcar como revisada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-4 text-sm font-semibold text-success">
                Nenhuma pendência clínica cadastrada.
              </div>
            ) : null}
            {pendingItems.map((item, index) => (
              <button key={item} type="button" onClick={() => resolvePending(item)} className="flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-left transition hover:bg-primary-soft">
                <Badge variant={index === 0 ? "warning" : "default"}>{index + 1}</Badge>
                <p className="text-sm font-semibold text-ink">{item}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
            <CardDescription>Atalhos funcionais para tarefas recorrentes da clínica.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Button key={action.label} type="button" variant="outline" className="justify-start" onClick={action.action}>
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda de hoje</CardTitle>
            <CardDescription>Clique em uma sessão para abrir a agenda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointments.slice(0, 3).map((appointment) => (
              <button key={appointment.id} type="button" onClick={onCreateSession} className="flex w-full flex-col gap-3 rounded-md border border-border p-3 text-left transition hover:bg-primary-soft sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-ink">{appointment.patientName}</p>
                  <p className="text-sm text-ink-muted">
                    {new Date(appointment.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {appointment.type} - {appointment.room}
                  </p>
                </div>
                <Badge variant={appointment.paid ? "success" : "warning"}>{appointment.paid ? "Pago" : "Pagamento pendente"}</Badge>
              </button>
            ))}
            {appointments.length === 0 ? (
              <div className="rounded-md border border-border bg-background p-4 text-sm font-semibold text-ink-muted">
                Nenhuma sessão agendada para hoje. Use Nova sessão para começar.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function OperationalItem({ icon: Icon, title, value, description, tone }: { icon: LucideIcon; title: string; value: string; description: string; tone: keyof typeof toneClass }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-ink">{title}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
          <p className="mt-1 text-sm font-semibold text-ink-muted">{description}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", toneClass[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "Tatiane";
}
