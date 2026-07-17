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

const statusColors: Record<AppointmentStatus, { label: string; color: string }> = {
  confirmada: { label: "Confirmada", color: "#245B68" },
  pendente: { label: "Pendente", color: "#B7791F" },
  realizada: { label: "Realizada", color: "#2F7D63" },
  faltou: { label: "Faltou", color: "#B42318" },
  cancelada: { label: "Cancelada", color: "#6B7280" }
};

type ClinicalCalendarProps = {
  createdCount: number;
  onNotify: (message: string) => void;
};

export function ClinicalCalendar({ createdCount, onNotify }: ClinicalCalendarProps) {
  const [items, setItems] = useState<Appointment[]>(initialAppointments);
  const [selectedId, setSelectedId] = useState<string | null>(initialAppointments[0]?.id ?? null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<string[]>([]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const modalAppointment = items.find((item) => item.id === modalId);
  const activeLegend = Object.entries(statusColors).map(([, value]) => value);

  useEffect(() => {
    if (createdCount === 0) return;
    const hour = 9 + createdCount;
    const appointment: Appointment = {
      id: `age-teste-${createdCount}`,
      patientName: `Paciente a definir ${createdCount}`,
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
        title: `${appointment.patientName} - ${statusColors[appointment.status].label}`,
        start: appointment.start,
        end: appointment.end,
        backgroundColor: statusColors[appointment.status].color,
        borderColor: statusColors[appointment.status].color
      })),
    [items]
  );

  function handleEventClick(arg: EventClickArg) {
    setSelectedId(arg.event.id);
    setModalId(arg.event.id);
    onNotify("Popup avancado da sessao aberto.");
  }

  function handleEventDrop(arg: EventDropArg) {
    setItems((current) => current.map((appointment) => (appointment.id === arg.event.id ? { ...appointment, start: arg.event.start?.toISOString() ?? appointment.start, end: arg.event.end?.toISOString() ?? appointment.end } : appointment)));
    onNotify("Sessao reagendada por arrastar e soltar.");
  }

  function handleSelect(arg: DateSelectArg) {
    const appointment: Appointment = { id: `age-selecao-${Date.now()}`, patientName: "Horario bloqueado", start: arg.startStr, end: arg.endStr, type: "Retorno", mode: "presencial", status: "confirmada", paid: true, room: "Bloqueio" };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
    onNotify("Horario selecionado e bloqueado na agenda.");
  }

  function updateAppointment(appointmentId: string, patch: Partial<Appointment>, message: string) {
    setItems((current) => current.map((appointment) => (appointment.id === appointmentId ? { ...appointment, ...patch } : appointment)));
    onNotify(message);
  }

  function updateSelected(patch: Partial<Appointment>, message: string) {
    if (!selected) return;
    updateAppointment(selected.id, patch, message);
  }

  function createManualSession() {
    const next = items.length + 1;
    const appointment: Appointment = { id: `age-manual-${next}`, patientName: `Sessao avulsa ${next}`, start: "2026-07-20T15:00:00", end: "2026-07-20T15:50:00", type: "Retorno", mode: "online", status: "pendente", paid: false, room: "Google Meet" };
    setItems((current) => [...current, appointment]);
    setSelectedId(appointment.id);
    setModalId(appointment.id);
    onNotify("Nova sessao criada na agenda.");
  }

  function addFromWaitlist(item: string) {
    setWaitlist((current) => current.filter((entry) => entry !== item));
    createManualSession();
    onNotify(`${item} encaixado em uma sessao de teste.`);
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Agenda clinica</CardTitle>
                <CardDescription>Clique em um horario com cliente para abrir o popup moderno com acoes completas.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-md border border-border bg-primary-soft px-3 py-2 text-sm font-bold text-primary">Cores por status do agendamento</div>
                <Button type="button" variant="outline" size="sm" onClick={() => handleSelect({ startStr: "2026-07-21T08:00:00", endStr: "2026-07-21T09:00:00" } as DateSelectArg)}>Bloquear horario</Button>
                <Button type="button" size="sm" onClick={createManualSession}>Nova sessao</Button>
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
              buttonText={{ today: "Hoje", day: "Dia", week: "Semana", month: "Mes", list: "Lista" }}
            />
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cores por status</CardTitle>
              <CardDescription>A cor mostra a situacao atual do agendamento da Tatiane Bonfin.</CardDescription>
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
                <CardTitle>Detalhes da sessao</CardTitle>
                <CardDescription>Resumo rapido. O clique no evento abre o popup completo.</CardDescription>
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
                  <div className="flex gap-3"><Clock className="h-5 w-5 text-primary" /><span>{new Date(selected.start).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} ate {new Date(selected.end).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>
                  <div className="flex gap-3"><MapPin className="h-5 w-5 text-primary" /><span>{selected.room}</span></div>
                  <div className="flex gap-3"><Repeat className="h-5 w-5 text-primary" /><span>Recorrencia semanal disponivel</span></div>
                </div>
                <div className="grid gap-2">
                  <Button type="button" onClick={() => updateSelected({ status: "realizada" }, "Presenca confirmada e sessao marcada como realizada.")}><UserCheck className="h-4 w-4" />Confirmar presenca</Button>
                  <Button type="button" variant="outline" onClick={() => updateSelected({ paid: true }, "Pagamento registrado sem sair da agenda.")}><CreditCard className="h-4 w-4" />Registrar pagamento</Button>
                  <Button type="button" variant="outline" onClick={() => updateSelected({ start: "2026-07-22T10:30:00", end: "2026-07-22T11:20:00", status: "confirmada" }, "Sessao reagendada para 22/07 as 10:30.")}><CalendarCheck className="h-4 w-4" />Reagendar</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da sessao</CardTitle>
                <CardDescription>Nenhum horario selecionado ainda.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border bg-background p-4 text-sm font-semibold text-ink-muted">
                  A agenda esta limpa para a apresentacao. Clique em Nova sessao ou selecione um horario no calendario para criar o primeiro item.
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Lista de espera</CardTitle><CardDescription>Clique para encaixar um paciente.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {waitlist.length === 0 ? <div className="rounded-md border border-border bg-background p-3 text-sm font-semibold text-ink-muted">Lista de espera vazia.</div> : null}
              {waitlist.map((item) => <button key={item} type="button" onClick={() => addFromWaitlist(item)} className="w-full rounded-md border border-border bg-background p-3 text-left text-sm font-semibold text-ink transition hover:bg-primary-soft">{item}</button>)}
            </CardContent>
          </Card>
        </aside>
      </div>
      {modalAppointment ? <SessionModal appointment={modalAppointment} onClose={() => setModalId(null)} onNotify={onNotify} onUpdate={(patch, message) => updateAppointment(modalAppointment.id, patch, message)} /> : null}
    </>
  );
}
