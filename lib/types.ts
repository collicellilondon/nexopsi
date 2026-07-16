export type AppointmentStatus = "confirmada" | "pendente" | "realizada" | "faltou" | "cancelada";
export type AppointmentMode = "presencial" | "online";
export type PatientStatus = "ativo" | "pausado" | "alta" | "triagem";

export type Patient = {
  id: string;
  name: string;
  age: number;
  status: PatientStatus;
  tags: string[];
  nextSession: string;
  lastSession: string;
  pendingBalance: number;
  phone: string;
  email: string;
  therapist: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  guardian?: string;
  occupation?: string;
  referralSource?: string;
  mainComplaint?: string;
  clinicalNotes?: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  start: string;
  end: string;
  type: "Terapia individual" | "Avaliação" | "Retorno" | "Supervisão";
  mode: AppointmentMode;
  status: AppointmentStatus;
  paid: boolean;
  room: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  tone: "primary" | "secondary" | "warning" | "success" | "danger";
};

export type CashFlowPoint = {
  month: string;
  receita: number;
  despesas: number;
};
