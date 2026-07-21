"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { CalendarCheck, Clock, CreditCard, MapPin, Repeat, UserCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SessionModal } from "@/features/calendar/session-modal";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { Appointment, AppointmentMode, AppointmentStatus, Patient } from "@/lib/types";

const statusVariant: Record<AppointmentStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  confirmada: "default",
  pendente: "warning",
  realizada: "success",
  faltou: "destructive",
  cancelada: "muted"
};

const statusColors: Record<AppointmentStatus, { label: string; color: string }> = {
  confirmada: { label: "Confirmada", color: "#245B68" },
  pendente: { label: "Pendente", color: "#B7791F" },
  realizada: { label: "Realizada", color: "#2F7D63" },
  faltou: { label: "Faltou", color: "#B42318" },
  cancelada: { label: "Cancelada", color: "#6B7280" }
};

type ClinicalCalendarProps = {
  createdCount: number;
  workspaceId?: string | null;
  patients?: Patient[];
  onNotify: (message: string) => void;
};

type ScheduleDraft = {
  start: string;
  end: string;
};

export function ClinicalCalendar({ createdCount, workspaceId, patients = [], onNotify }: ClinicalCalendarProps) {
  const [items, setItems] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [scheduler, setScheduler] = useState<ScheduleDraft | null>(null);
  const [waitlist, setWaitlist] = useState<string[]>([]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const modalAppointment = items.find((item) => item.id === modalId);
  const activeLegend = Object.entries(statusColors).map(([, value]) => value);
  const patientNames = useMemo(() => new Map(patients.map((patient) => [patient.id, patient.name])), [patients]);

  useEffect(() => {
    if (createdCount === 0) return;
    const hour = 9 + createdCount;
    openScheduler(`2026-07-19T${String(hour).padStart(2, "0")}:00:00`, `2026-07-19T${String(hour).padStart(2, "0")}:50:00`);
  }, [createdCount]);

  useEffect(() => {
    if (!workspaceId) return;
    let mounted = true;

    async function loadAppointments() {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("appointments")
        .select("id, patient_id, starts_at, ends_at, status, mode, type, paid, room, location")
        .eq("organization_id", workspaceId)
        .order("starts_at", { ascending: true });

      if (!mounted) return;
      if (error) {
        onNotify(`Nao foi possivel carregar a agenda do Supabase: ${error.message}`);
        return;
      }

      const nextItems = (data ?? []).map((row) => mapDatabaseAppointment(row as DatabaseAppointment, patientNames));
      setItems(nextItems);
      setSelectedId((current) => current ?? nextItems[0]?.id ?? null);
    }

    loadAppointments();

    return () => {
      mounted = false;
    };
  }, [workspaceId, patientNames]);

  const events = useMemo(
    () =>
      items.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.patientName} - ${statusColors[appointment.status].label}`,
        start: appointment.start,
        end: appointment.end,
        backgroundColor: statusColors[appointment.status].color,
        borderColor: statusColors[appointment.status].color
      })),
    [items]
  );

  function openScheduler(start: string, end?: string) {
    setScheduler({ start, end: end || addMinutes(start, 50) });
    onNotify("Selecione o paciente cadastrado para vincular a sessão ao horário.");
  }

  function handleEventClick(arg: EventClickArg) {
    setSelectedId(arg.event.id);
    setModalId(arg.event.id);
    onNotify("Popup avançado da sessão aberto.");
  }

  async function handleEventDrop(arg: EventDropArg) {
    setItems((current) =>
      current.map((appointment) =>
        appointment.id === arg.event.id
          ? { ...appointment, start: arg.event.start?.toISOString() ?? appointment.start, end: arg.event.end?.toISOString() ?? appointment.end }
          : appointment
      )
    );
    if (workspaceId && arg.event.start && arg.event.end) {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("appointments")
        .update({ starts_at: arg.event.start.toISOString(), ends_at: arg.event.end.toISOString() })
        .eq("id", arg.event.id)
        .eq("organization_id", workspaceId);
      if (error) {
        onNotify(`Nao foi possivel salvar o reagendamento: ${error.message}`);
        return;
      }
    }
    onNotify("Sessão reagendada por arrastar e soltar.");
  }

  function handleSelect(arg: DateSelectArg) {
    openScheduler(arg.startStr, arg.endStr);
  }

  async function createAppointmentFromScheduler(values: {
    patientId: string;
    type: Appointment["type"];
    mode: AppointmentMode;
    status: AppointmentStatus;
    room: string;
    paid: boolean;
  }) {
    if (!scheduler) return;
    const patient = patients.find((item) => item.id === values.patientId);
    const appointment: Appointment = {
      id: `age-${Date.now()}`,
      patientId: patient?.id,
      patientName: patient?.name ?? "Paciente a definir",
      start: scheduler.start,
      end: scheduler.end,
      type: values.type,
      mode: values.mode,
      status: values.status,
      paid: values.paid,
      room: values.room || (values.mode === "online" ? "Google Meet" : "Sala 1")
    };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
    setScheduler(null);
    if (workspaceId) {
      const supabase = createBrowserSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("appointments")
        .insert(mapAppointmentToDatabase(appointment, workspaceId, userData.user?.id ?? null))
        .select("id, patient_id, starts_at, ends_at, status, mode, type, paid, room, location")
        .single();

      if (error) {
        onNotify(`Nao foi possivel salvar a sessao no Supabase: ${error.message}`);
        return;
      }

      const savedAppointment = mapDatabaseAppointment(data as DatabaseAppointment, patientNames);
      setItems((current) => [savedAppointment, ...current.filter((item) => item.id !== appointment.id)]);
      setSelectedId(savedAppointment.id);
      setModalId(savedAppointment.id);
    }
    onNotify(patient ? `Sessão vinculada ao paciente ${patient.name}.` : "Sessão criada sem paciente vinculado.");
  }

  async function updateAppointment(appointmentId: string, patch: Partial<Appointment>, message: string) {
    setItems((current) => current.map((appointment) => (appointment.id === appointmentId ? { ...appointment, ...patch } : appointment)));
    if (workspaceId) {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase
        .from("appointments")
        .update(mapAppointmentPatchToDatabase(patch))
        .eq("id", appointmentId)
        .eq("organization_id", workspaceId);
      if (error) {
        onNotify(`Nao foi possivel salvar a sessao: ${error.message}`);
        return;
      }
    }
    onNotify(message);
  }

  function updateSelected(patch: Partial<Appointment>, message: string) {
    if (!selected) return;
    updateAppointment(selected.id, patch, message);
  }

  function addFromWaitlist(item: string) {
    setWaitlist((current) => current.filter((entry) => entry !== item));
    openScheduler("2026-07-20T15:00:00", "2026-07-20T15:50:00");
    onNotify(`${item} pronto para encaixe em uma sessão.`);
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Agenda clínica</CardTitle>
                <CardDescription>Clique em um horário vazio para vincular um paciente cadastrado à sessão.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm font-bold text-primary">Cores por status do agendamento</div>
                <Button type="button" variant="outline" size="sm" onClick={() => openScheduler("2026-07-21T08:00:00", "2026-07-21T09:00:00")}>Bloquear horário</Button>
                <Button type="button" size="sm" onClick={() => openScheduler("2026-07-20T15:00:00", "2026-07-20T15:50:00")}>Nova sessão</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-5">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              initialDate="2026-07-16"
              locale="pt-br"
              height="auto"
              editable
              selectable
              nowIndicator
              allDaySlot={false}
              slotMinTime="07:00:00"
              slotMaxTime="21:00:00"
              events={events}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              select={handleSelect}
              headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek" }}
              buttonText={{ today: "Hoje", day: "Dia", week: "Semana", month: "Mês", list: "Lista" }}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cores por status</CardTitle>
              <CardDescription>A cor mostra a situação atual de cada agendamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeLegend.map((item) => (
                <button key={item.label} type="button" onClick={() => onNotify(`Status ${item.label} usa esta cor na agenda.`)} className="flex w-full items-center justify-between rounded-md border border-border bg-background p-2 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft">
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  <span className="text-xs text-ink-muted">fixo</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da sessão</CardTitle>
                <CardDescription>Resumo rápido. O clique no evento abre o popup completo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-black text-ink">{selected.patientName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={statusVariant[selected.status]}>{selected.status}</Badge>
                    <Badge variant={selected.mode === "online" ? "secondary" : "default"}>{selected.mode}</Badge>
                    {selected.paid ? <Badge variant="success">Pago</Badge> : <Badge variant="warning">Pagamento pendente</Badge>}
                  </div>
                </div>
                <div className="space-y-3 text-sm text-ink">
                  <div className="flex gap-3"><Clock className="h-5 w-5 text-primary" /><span>{new Date(selected.start).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} até {new Date(selected.end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>
                  <div className="flex gap-3"><MapPin className="h-5 w-5 text-primary" /><span>{selected.room}</span></div>
                  <div className="flex gap-3"><Repeat className="h-5 w-5 text-primary" /><span>Recorrência semanal disponível</span></div>
                </div>
                <div className="grid gap-2">
                  <Button type="button" onClick={() => updateSelected({ status: "realizada" }, "Presença confirmada e sessão marcada como realizada.")}><UserCheck className="h-4 w-4" />Confirmar presença</Button>
                  <Button type="button" variant="outline" onClick={() => updateSelected({ paid: true }, "Pagamento registrado sem sair da agenda.")}><CreditCard className="h-4 w-4" />Registrar pagamento</Button>
                  <Button type="button" variant="outline" onClick={() => updateSelected({ start: "2026-07-22T10:30:00", end: "2026-07-22T11:20:00", status: "confirmada" }, "Sessão reagendada para 22/07 às 10:30.")}><CalendarCheck className="h-4 w-4" />Reagendar</Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>Lista de espera</CardTitle><CardDescription>Clique para encaixar um paciente.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {waitlist.length === 0 ? <div className="rounded-md border border-border bg-background p-3 text-sm font-semibold text-ink-muted">Lista de espera vazia.</div> : null}
              {waitlist.map((item) => <button key={item} type="button" onClick={() => addFromWaitlist(item)} className="w-full rounded-md border border-border bg-background p-3 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft">{item}</button>)}
            </CardContent>
          </Card>
        </aside>
      </div>
      {scheduler ? <ScheduleSessionModal draft={scheduler} patients={patients} onClose={() => setScheduler(null)} onCreate={createAppointmentFromScheduler} /> : null}
      {modalAppointment ? <SessionModal appointment={modalAppointment} onClose={() => setModalId(null)} onNotify={onNotify} onUpdate={(patch, message) => updateAppointment(modalAppointment.id, patch, message)} /> : null}
    </>
  );
}

function ScheduleSessionModal({
  draft,
  patients,
  onClose,
  onCreate
}: {
  draft: ScheduleDraft;
  patients: Patient[];
  onClose: () => void;
  onCreate: (values: { patientId: string; type: Appointment["type"]; mode: AppointmentMode; status: AppointmentStatus; room: string; paid: boolean }) => void;
}) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [type, setType] = useState<Appointment["type"]>("Terapia individual");
  const [mode, setMode] = useState<AppointmentMode>("presencial");
  const [status, setStatus] = useState<AppointmentStatus>("confirmada");
  const [room, setRoom] = useState("Sala 1");
  const [paid, setPaid] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-[0_30px_90px_rgba(31,41,55,0.22)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border">
          <div>
            <CardTitle>Agendar sessão</CardTitle>
            <CardDescription>Vincule um paciente cadastrado ao horário selecionado.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar agendamento">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="rounded-md border border-border bg-background p-3 text-sm font-semibold text-ink">
            {new Date(draft.start).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })} até{" "}
            {new Date(draft.end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>

          {patients.length === 0 ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              Nenhum paciente cadastrado ainda. Cadastre o paciente primeiro para vincular corretamente a sessão.
            </div>
          ) : null}

          <label className="block text-sm font-bold text-ink">
            Paciente
            <select value={patientId} onChange={(event) => setPatientId(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              {patients.length === 0 ? <option value="">Paciente a definir</option> : null}
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name} - {patient.phone}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-bold text-ink">
              Tipo de sessão
              <select value={type} onChange={(event) => setType(event.target.value as Appointment["type"])} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                <option>Terapia individual</option>
                <option>Avaliação</option>
                <option>Retorno</option>
                <option>Supervisão</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-ink">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as AppointmentStatus)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                <option value="confirmada">Confirmada</option>
                <option value="pendente">Pendente</option>
                <option value="realizada">Realizada</option>
                <option value="faltou">Faltou</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-ink">
              Modalidade
              <select value={mode} onChange={(event) => setMode(event.target.value as AppointmentMode)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                <option value="presencial">Presencial</option>
                <option value="online">Online</option>
              </select>
            </label>
            <label className="block text-sm font-bold text-ink">
              Sala ou link
              <Input value={room} onChange={(event) => setRoom(event.target.value)} className="mt-2" placeholder="Sala 1 ou link da chamada" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-ink">
            <input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
            Pagamento já realizado
          </label>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={() => onCreate({ patientId, type, mode, status, room, paid })}>Salvar sessão</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function addMinutes(value: string, minutes: number) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

type DatabaseAppointment = {
  id: string;
  patient_id: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  mode: string;
  type: Appointment["type"] | null;
  paid: boolean | null;
  room: string | null;
  location: string | null;
};

function mapDatabaseAppointment(row: DatabaseAppointment, patientNames: Map<string, string>): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id ?? undefined,
    patientName: row.patient_id ? patientNames.get(row.patient_id) ?? "Paciente cadastrado" : "Paciente a definir",
    start: row.starts_at,
    end: row.ends_at,
    type: row.type ?? "Terapia individual",
    mode: mapDatabaseMode(row.mode),
    status: mapDatabaseStatus(row.status),
    paid: Boolean(row.paid),
    room: row.room ?? row.location ?? "Sala 1"
  };
}

function mapAppointmentToDatabase(appointment: Appointment, organizationId: string, professionalId: string | null) {
  return {
    organization_id: organizationId,
    patient_id: appointment.patientId && isUuid(appointment.patientId) ? appointment.patientId : null,
    professional_id: professionalId,
    starts_at: appointment.start,
    ends_at: appointment.end,
    status: mapAppointmentStatus(appointment.status),
    mode: mapAppointmentMode(appointment.mode),
    type: appointment.type,
    paid: appointment.paid,
    room: appointment.room,
    location: appointment.room
  };
}

function mapAppointmentPatchToDatabase(patch: Partial<Appointment>) {
  const payload: Record<string, string | boolean | null> = {};
  if (patch.start) payload.starts_at = patch.start;
  if (patch.end) payload.ends_at = patch.end;
  if (patch.status) payload.status = mapAppointmentStatus(patch.status);
  if (patch.mode) payload.mode = mapAppointmentMode(patch.mode);
  if (patch.type) payload.type = patch.type;
  if (typeof patch.paid === "boolean") payload.paid = patch.paid;
  if (patch.room) {
    payload.room = patch.room;
    payload.location = patch.room;
  }
  if (patch.patientId !== undefined) payload.patient_id = patch.patientId && isUuid(patch.patientId) ? patch.patientId : null;
  return payload;
}

function mapAppointmentStatus(status: AppointmentStatus) {
  const statusMap: Record<AppointmentStatus, string> = {
    confirmada: "confirmed",
    pendente: "scheduled",
    realizada: "completed",
    faltou: "missed",
    cancelada: "cancelled"
  };
  return statusMap[status];
}

function mapDatabaseStatus(status: string): AppointmentStatus {
  const statusMap: Record<string, AppointmentStatus> = {
    confirmed: "confirmada",
    scheduled: "pendente",
    completed: "realizada",
    missed: "faltou",
    cancelled: "cancelada",
    cancelada: "cancelada",
    confirmada: "confirmada",
    pendente: "pendente",
    realizada: "realizada",
    faltou: "faltou"
  };
  return statusMap[status] ?? "pendente";
}

function mapAppointmentMode(mode: AppointmentMode) {
  return mode === "online" ? "online" : "in_person";
}

function mapDatabaseMode(mode: string): AppointmentMode {
  return mode === "online" ? "online" : "presencial";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
