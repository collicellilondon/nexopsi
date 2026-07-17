"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarPlus, FilePlus2, Receipt, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { appointments, cashFlow, clinicalPendencies, dashboardMetrics } from "@/lib/mock-data";
import { brl, cn } from "@/lib/utils";

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
  onNotify: (message: string) => void;
};

export function Dashboard({ professionalName, onCreatePatient, onCreateSession, onNotify }: DashboardProps) {
  const [pendingItems, setPendingItems] = useState(clinicalPendencies);

  const quickActions = [
    { label: "Criar paciente", icon: UserPlus, action: onCreatePatient },
    { label: "Agendar sessão", icon: CalendarPlus, action: onCreateSession },
    { label: "Registrar pagamento", icon: Receipt, action: () => onNotify("Pagamento de teste registrado como pago.") },
    { label: "Gerar documento", icon: FilePlus2, action: () => onNotify("Documento de teste gerado com variáveis automáticas.") }
  ];

  function resolvePending(item: string) {
    setPendingItems((current) => current.filter((pending) => pending !== item));
    onNotify(`Pendência revisada: ${item}`);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg bg-primary px-5 py-6 text-white shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/75">Quinta-feira, 16 de julho de 2026</p>
          <h1 className="mt-2 text-2xl font-black md:text-3xl">Bom dia, {getFirstName(professionalName)}. Sua clínica está organizada para hoje.</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/78">
            Há sessões confirmadas, pendências clínicas para revisar e pagamentos que podem ser resolvidos sem sair do fluxo de atendimento.
          </p>
        </div>
        <button type="button" onClick={onCreateSession} className="rounded-md bg-white/12 p-4 text-left transition hover:bg-white/20">
          <p className="text-sm text-white/75">Próxima sessão</p>
          <p className="mt-1 text-xl font-black">14:00</p>
          <p className="text-sm text-white/75">Marina Duarte, presencial</p>
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fluxo de caixa</CardTitle>
            <CardDescription>Clique nas ações financeiras para simular pagamentos e relatórios.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="receita" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#245B68" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#245B68" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="despesas" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#5F9E8C" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5F9E8C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => brl.format(Number(value)).replace(",00", "")} />
                  <Tooltip formatter={(value) => brl.format(Number(value))} labelStyle={{ color: "#1F2937" }} />
                  <Area dataKey="receita" name="Receita" type="monotone" stroke="#245B68" fill="url(#receita)" strokeWidth={2} />
                  <Area dataKey="despesas" name="Despesas" type="monotone" stroke="#5F9E8C" fill="url(#despesas)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
                Todas as pendências clínicas foram revisadas nesta sessão de teste.
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
                    {new Date(appointment.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} • {appointment.type} • {appointment.room}
                  </p>
                </div>
                <Badge variant={appointment.paid ? "success" : "warning"}>{appointment.paid ? "Pago" : "Pagamento pendente"}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "Tatiane";
}
