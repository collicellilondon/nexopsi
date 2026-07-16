"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { CalendarCheck, Clock, CreditCard, MapPin, Repeat, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionModal } from "@/features/calendar/session-modal";
import { appointments as initialAppointments } from "@/lib/mock-data";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const statusVariant: Record<AppointmentStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  confirmada: "default",
  pendente: "warning",
  realizada: "success",
  faltou: "destructive",
  cancelada: "muted"
};

type CalendarColorMode = "psychologist" | "status";

const statusColors: Record<AppointmentStatus, { label: string; color: string }> = {
  confirmada: { label: "Confirmada", color: "#245B68" },
  pendente: { label: "Pendente", color: "#B7791F" },
  realizada: { label: "Realizada", color: "#2F7D63" },
  faltou: { label: "Faltou", color: "#B42318" },
  cancelada: { label: "Cancelada", color: "#6B7280" }
};

const psychologistColors = {
  "Dra. Ana Ribeiro": "#245B68",
  "Dr. Paulo Mendes": "#5F9E8C",
  "Dra. Camila Torres": "#7C3AED",
  "Dra. Luiza Rocha": "#C2410C"
};

const editablePalette = ["#245B68", "#5F9E8C", "#7C3AED", "#C2410C", "#BE185D", "#0F766E", "#2563EB"];

type ClinicalCalendarProps = {
  createdCount: number;
  onNotify: (message: string) => void;
};

function getPsychologist(appointment: Appointment) {
  if (appointment.patientName.includes("Helena") || appointment.patientName.includes("Supervisão")) return "Dr. Paulo Mendes";
  if (appointment.patientName.includes("Caio") || appointment.patientName.includes("Teste")) return "Dra. Camila Torres";
  if (appointment.patientName.includes("avulsa") || appointment.patientName.includes("Bloqueado")) return "Dra. Luiza Rocha";
  return "Dra. Ana Ribeiro";
}

function getAppointmentColor(appointment: Appointment, colorMode: CalendarColorMode, professionalColors: Record<string, string>) {
  if (colorMode === "status") return statusColors[appointment.status].color;
  return professionalColors[getPsychologist(appointment)] ?? "#245B68";
}

export function ClinicalCalendar({ createdCount, onNotify }: ClinicalCalendarProps) {
  const [items, setItems] = useState<Appointment[]>(initialAppointments);
  const [selectedId, setSelectedId] = useState(initialAppointments[0].id);
  const [modalId, setModalId] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<CalendarColorMode>("psychologist");
  const [professionalColors, setProfessionalColors] = useState<Record<string, string>>(psychologistColors);
  const [waitlist, setWaitlist] = useState(["Helena Costa • manhã", "Rafael Nogueira • online", "Bianca Lima • sexta"]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0];
  const modalAppointment = items.find((item) => item.id === modalId);

  useEffect(() => {
    if (createdCount === 0) return;
    const hour = 9 + createdCount;
    const appointment: Appointment = {
      id: `age-teste-${createdCount}`,
      patientName: `Paciente Teste ${createdCount}`,
      start: `2026-07-19T${String(hour).padStart(2, "0")}:00:00`,
      end: `2026-07-19T${String(hour).padStart(2, "0")}:50:00`,
      type: "Terapia individual",
      mode: createdCount % 2 === 0 ? "online" : "presencial",
      status: "pendente",
      paid: false,
      room: createdCount % 2 === 0 ? "Google Meet" : "Sala 1"
    };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
  }, [createdCount]);

  const events = useMemo(
    () =>
      items.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.patientName} • ${colorMode === "psychologist" ? getPsychologist(appointment) : statusColors[appointment.status].label}`,
        start: appointment.start,
        end: appointment.end,
        backgroundColor: getAppointmentColor(appointment, colorMode, professionalColors),
        borderColor: getAppointmentColor(appointment, colorMode, professionalColors)
      })),
    [items, colorMode, professionalColors]
  );

  const activeLegend =
    colorMode === "psychologist"
      ? Object.entries(professionalColors).map(([label, color]) => ({ label, color }))
      : Object.entries(statusColors).map(([, value]) => value);

  function changeColorMode(mode: CalendarColorMode) {
    setColorMode(mode);
    onNotify(mode === "psychologist" ? "Agenda colorida por psicólogo." : "Agenda colorida por status do agendamento.");
  }

  function cycleProfessionalColor(label: string) {
    setProfessionalColors((current) => {
      const currentColor = current[label] ?? editablePalette[0];
      const nextColor = editablePalette[(editablePalette.indexOf(currentColor) + 1) % editablePalette.length];
      onNotify(`${label} definiu a cor ${nextColor} para a agenda.`);
      return { ...current, [label]: nextColor };
    });
  }

  function handleEventClick(arg: EventClickArg) {
    setSelectedId(arg.event.id);
    setModalId(arg.event.id);
    onNotify("Popup avançado da sessão aberto.");
  }

  function handleEventDrop(arg: EventDropArg) {
    setItems((current) => current.map((appointment) => (appointment.id === arg.event.id ? { ...appointment, start: arg.event.start?.toISOString() ?? appointment.start, end: arg.event.end?.toISOString() ?? appointment.end } : appointment)));
    onNotify("Sessão reagendada por arrastar e soltar.");
  }

  function handleSelect(arg: DateSelectArg) {
    const appointment: Appointment = { id: `age-selecao-${Date.now()}`, patientName: "Horário bloqueado", start: arg.startStr, end: arg.endStr, type: "Retorno", mode: "presencial", status: "confirmada", paid: true, room: "Bloqueio" };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
    onNotify("Horário selecionado e bloqueado na agenda.");
  }

  function updateAppointment(appointmentId: string, patch: Partial<Appointment>, message: string) {
    setItems((current) => current.map((appointment) => (appointment.id === appointmentId ? { ...appointment, ...patch } : appointment)));
    onNotify(message);
  }

  function updateSelected(patch: Partial<Appointment>, message: string) {
    updateAppointment(selected.id, patch, message);
  }

  function createManualSession() {
    const next = items.length + 1;
    const appointment: Appointment = { id: `age-manual-${next}`, patientName: `Sessão avulsa ${next}`, start: "2026-07-20T15:00:00", end: "2026-07-20T15:50:00", type: "Retorno", mode: "online", status: "pendente", paid: false, room: "Google Meet" };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
    onNotify("Nova sessão criada na agenda.");
  }

  function addFromWaitlist(item: string) {
    setWaitlist((current) => current.filter((entry) => entry !== item));
    createManualSession();
    onNotify(`${item} encaixado em uma sessão de teste.`);
  }

  if (!selected) return null;

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Agenda clínica</CardTitle>
                <CardDescription>Clique em um horário com cliente para abrir o popup moderno com ações completas.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-md border border-border bg-white p-1">
                  <button
                    type="button"
                    onClick={() => changeColorMode("psychologist")}
                    className={`rounded-sm px-3 py-1.5 text-sm font-bold transition ${colorMode === "psychologist" ? "bg-primary text-white" : "text-ink-muted hover:bg-primary-soft hover:text-primary"}`}
                  >
                    Cores por psicólogo
                  </button>
                  <button
                    type="button"
                    onClick={() => changeColorMode("status")}
                    className={`rounded-sm px-3 py-1.5 text-sm font-bold transition ${colorMode === "status" ? "bg-primary text-white" : "text-ink-muted hover:bg-primary-soft hover:text-primary"}`}
                  >
                    Cores por status
                  </button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => handleSelect({ startStr: "2026-07-21T08:00:00", endStr: "2026-07-21T09:00:00" } as DateSelectArg)}>Bloquear horário</Button>
                <Button type="button" size="sm" onClick={createManualSession}>Nova sessão</Button>
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
              <CardTitle>{colorMode === "psychologist" ? "Cores por psicólogo" : "Cores por status"}</CardTitle>
              <CardDescription>
                {colorMode === "psychologist" ? "Cada profissional define uma cor para seus atendimentos." : "A cor mostra a situação atual do agendamento."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeLegend.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (colorMode === "psychologist") cycleProfessionalColor(item.label);
                  }}
                  className="flex w-full items-center justify-between rounded-md border border-border bg-background p-2 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  {colorMode === "psychologist" ? <span className="text-xs text-ink-muted">editar cor</span> : <span className="text-xs text-ink-muted">fixo</span>}
                </button>
              ))}
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader><CardTitle>Lista de espera</CardTitle><CardDescription>Clique para encaixar um paciente.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {waitlist.length === 0 ? <div className="rounded-md border border-border bg-background p-3 text-sm font-semibold text-success">Lista de espera resolvida.</div> : null}
              {waitlist.map((item) => <button key={item} type="button" onClick={() => addFromWaitlist(item)} className="w-full rounded-md border border-border bg-background p-3 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft">{item}</button>)}
            </CardContent>
          </Card>
        </aside>
      </div>
      {modalAppointment ? <SessionModal appointment={modalAppointment} onClose={() => setModalId(null)} onNotify={onNotify} onUpdate={(patch, message) => updateAppointment(modalAppointment.id, patch, message)} /> : null}
    </>
  );
}
