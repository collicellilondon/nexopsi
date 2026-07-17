import type { Appointment, CashFlowPoint, DashboardMetric, Patient } from "@/lib/types";

export const patients: Patient[] = [
  {
    id: "pac-001",
    name: "Marina Duarte",
    age: 34,
    status: "ativo",
    tags: ["TCC", "Ansiedade"],
    nextSession: "Hoje, 14:00",
    lastSession: "09/07/2026",
    pendingBalance: 0,
    phone: "(11) 99842-1022",
    email: "marina.duarte@email.com",
    therapist: "Tatiane Bonfin"
  },
  {
    id: "pac-002",
    name: "Caio Martins",
    age: 28,
    status: "ativo",
    tags: ["Online", "Retorno"],
    nextSession: "Amanhã, 09:30",
    lastSession: "11/07/2026",
    pendingBalance: 320,
    phone: "(21) 98733-4401",
    email: "caio.martins@email.com",
    therapist: "Tatiane Bonfin"
  },
  {
    id: "pac-003",
    name: "Helena Costa",
    age: 41,
    status: "triagem",
    tags: ["Primeira consulta"],
    nextSession: "Sex, 16:00",
    lastSession: "Sem histórico",
    pendingBalance: 0,
    phone: "(31) 97120-8802",
    email: "helena.costa@email.com",
    therapist: "Tatiane Bonfin"
  },
  {
    id: "pac-004",
    name: "Rafael Nogueira",
    age: 37,
    status: "pausado",
    tags: ["Casal", "Sem retorno"],
    nextSession: "Não agendada",
    lastSession: "02/06/2026",
    pendingBalance: 640,
    phone: "(41) 99310-5529",
    email: "rafael.nogueira@email.com",
    therapist: "Tatiane Bonfin"
  }
];

export const appointments: Appointment[] = [
  {
    id: "age-001",
    patientName: "Marina Duarte",
    start: "2026-07-16T14:00:00",
    end: "2026-07-16T14:50:00",
    type: "Terapia individual",
    mode: "presencial",
    status: "confirmada",
    paid: true,
    room: "Sala 2"
  },
  {
    id: "age-002",
    patientName: "Caio Martins",
    start: "2026-07-16T16:00:00",
    end: "2026-07-16T16:50:00",
    type: "Retorno",
    mode: "online",
    status: "pendente",
    paid: false,
    room: "Google Meet"
  },
  {
    id: "age-003",
    patientName: "Helena Costa",
    start: "2026-07-17T09:00:00",
    end: "2026-07-17T10:00:00",
    type: "Avaliação",
    mode: "presencial",
    status: "confirmada",
    paid: false,
    room: "Sala 1"
  },
  {
    id: "age-004",
    patientName: "Supervisão clínica",
    start: "2026-07-18T11:00:00",
    end: "2026-07-18T12:00:00",
    type: "Supervisão",
    mode: "online",
    status: "confirmada",
    paid: true,
    room: "Zoom"
  }
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Sessões hoje", value: "8", helper: "6 confirmadas, 2 pendentes", tone: "primary" },
  { label: "Receita do mês", value: "R$ 18.420", helper: "+12% em relação a junho", tone: "success" },
  { label: "Pagamentos pendentes", value: "R$ 2.180", helper: "5 cobranças em aberto", tone: "warning" },
  { label: "Pacientes ativos", value: "126", helper: "9 novos nos últimos 30 dias", tone: "secondary" },
  { label: "Faltas do mês", value: "4", helper: "Taxa de 3,1%", tone: "danger" },
  { label: "Próximo horário livre", value: "Sex, 10:30", helper: "Duração sugerida: 50 min", tone: "primary" }
];

export const cashFlow: CashFlowPoint[] = [
  { month: "Fev", receita: 15200, despesas: 6200 },
  { month: "Mar", receita: 16900, despesas: 6500 },
  { month: "Abr", receita: 18100, despesas: 7000 },
  { month: "Mai", receita: 17600, despesas: 6800 },
  { month: "Jun", receita: 16400, despesas: 6400 },
  { month: "Jul", receita: 18420, despesas: 7100 }
];

export const clinicalPendencies = [
  "3 sessões sem evolução registrada",
  "2 anamneses aguardando revisão",
  "4 pacientes sem retorno há mais de 30 dias",
  "1 termo de consentimento pendente"
];
