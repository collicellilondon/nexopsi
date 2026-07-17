import type { Appointment, DashboardMetric, Patient } from "@/lib/types";

export const patients: Patient[] = [];

export const appointments: Appointment[] = [];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Sessões hoje", value: "0", helper: "Nenhuma sessão cadastrada", tone: "primary" },
  { label: "Pacientes ativos", value: "0", helper: "Cadastre o primeiro paciente", tone: "secondary" },
  { label: "Documentos pendentes", value: "0", helper: "Nenhum documento pendente", tone: "warning" },
  { label: "Faltas do mês", value: "0", helper: "Sem faltas registradas", tone: "danger" },
  { label: "Pagamentos pendentes", value: "R$ 0", helper: "Nenhuma cobrança em aberto", tone: "success" },
  { label: "Próximo horário livre", value: "Livre", helper: "Agenda pronta para configurar", tone: "primary" }
];

export const clinicalPendencies: string[] = [];
