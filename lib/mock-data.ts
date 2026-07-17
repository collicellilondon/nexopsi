import type { Appointment, DashboardMetric, Patient } from "@/lib/types";

export const patients: Patient[] = [];

export const appointments: Appointment[] = [];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Sessoes hoje", value: "0", helper: "Nenhuma sessao cadastrada", tone: "primary" },
  { label: "Pacientes ativos", value: "0", helper: "Cadastre o primeiro paciente", tone: "secondary" },
  { label: "Documentos pendentes", value: "0", helper: "Nenhum documento pendente", tone: "warning" },
  { label: "Faltas do mes", value: "0", helper: "Sem faltas registradas", tone: "danger" },
  { label: "Pagamentos pendentes", value: "R$ 0", helper: "Nenhuma cobranca em aberto", tone: "success" },
  { label: "Proximo horario livre", value: "Livre", helper: "Agenda pronta para configurar", tone: "primary" }
];

export const clinicalPendencies: string[] = [];
