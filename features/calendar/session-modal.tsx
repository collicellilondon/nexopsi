"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, ClipboardList, CreditCard, FileText, MessageCircle, Pencil, Receipt, ShieldCheck, Timer, Trash2, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types";

const statusVariant: Record<AppointmentStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  confirmada: "default",
  pendente: "warning",
  realizada: "success",
  faltou: "destructive",
  cancelada: "muted"
};

type SessionModalProps = {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: (patch: Partial<Appointment>, message: string) => void;
  onNotify: (message: string) => void;
};

const tabs = ["Resumo", "Prontuário", "Financeiro", "Comunicação"] as const;

export function SessionModal({ appointment, onClose, onUpdate, onNotify }: SessionModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Resumo");
  const [note, setNote] = useState("Paciente relatou melhora do sono e redução de ansiedade em situações sociais.");
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <Card className="max-h-[92vh] w-full max-w-5xl overflow-hidden border-primary/10 shadow-[0_30px_90px_rgba(31,41,55,0.22)]">
        <div className="grid max-h-[92vh] overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <section className="overflow-y-auto bg-white">
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-primary" />
                    <p className="text-sm font-bold text-ink-muted">Sessão clínica</p>
                    <Badge variant={statusVariant[appointment.status]}>{appointment.status}</Badge>
                    <Badge variant={appointment.mode === "online" ? "secondary" : "default"}>{appointment.mode}</Badge>
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-ink">{appointment.patientName}</h2>
                  <p className="mt-1 text-sm font-semibold text-ink-muted">
                    {start.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })} •{" "}
                    {start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} às{" "}
                    {end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="icon" variant="ghost" aria-label="Editar sessão" onClick={() => onNotify("Edição rápida aberta para esta sessão.")}>
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Fechar modal" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <InfoTile icon={<CalendarClock className="h-5 w-5" />} label="Tipo" value={appointment.type} />
                <InfoTile icon={<Timer className="h-5 w-5" />} label="Duração" value="50 min" />
                <InfoTile icon={<ShieldCheck className="h-5 w-5" />} label="Local" value={appointment.room} />
              </div>
            </div>

            <div className="border-b border-border px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("rounded-md px-3 py-2 text-sm font-bold text-ink-muted transition hover:bg-primary-soft hover:text-primary", activeTab === tab && "bg-primary text-white hover:bg-primary hover:text-white")}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-5">
              {activeTab === "Resumo" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button type="button" onClick={() => onUpdate({ status: "realizada" }, "Presença confirmada pelo popup.")}>
                      <CheckCircle2 className="h-4 w-4" /> Confirmar presença
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onUpdate({ paid: true }, "Pagamento registrado pelo popup.")}>
                      <CreditCard className="h-4 w-4" /> Registrar pagamento
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onNotify("Link de teleatendimento copiado.")}>
                      <Video className="h-4 w-4" /> Abrir atendimento online
                    </Button>
                    <Button type="button" variant="outline" onClick={() => onNotify("Recibo gerado para esta sessão.")}>
                      <Receipt className="h-4 w-4" /> Gerar recibo
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-black text-ink">Linha do tempo rápida</p>
                    <div className="mt-3 space-y-3 text-sm text-ink-muted">
                      <TimelineItem title="Confirmação enviada" description="Mensagem automática enviada 24h antes da sessão." />
                      <TimelineItem title="Pagamento" description={appointment.paid ? "Sessão paga." : "Pagamento ainda pendente."} />
                      <TimelineItem title="Evolução" description="Rascunho clínico disponível para revisão." />
                    </div>
                  </div>
                </>
              ) : null}

              {activeTab === "Prontuário" ? (
                <div className="space-y-3">
                  <label className="text-sm font-black text-ink" htmlFor="clinical-note">Evolução clínica</label>
                  <textarea id="clinical-note" value={note} onChange={(event) => setNote(event.target.value)} className="min-h-40 w-full rounded-md border border-border bg-white p-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button type="button" onClick={() => onNotify("Evolução salva como rascunho.")}>Salvar rascunho</Button>
                    <Button type="button" variant="outline" onClick={() => onNotify("Modelo de evolução aplicado.")}>Aplicar modelo</Button>
                    <Button type="button" variant="outline" onClick={() => onNotify("Objetivo terapêutico vinculado.")}>Vincular objetivo</Button>
                  </div>
                </div>
              ) : null}

              {activeTab === "Financeiro" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <FinanceTile label="Valor da sessão" value="R$ 320,00" />
                  <FinanceTile label="Status" value={appointment.paid ? "Pago" : "Pendente"} />
                  <Button type="button" onClick={() => onUpdate({ paid: true }, "Pagamento confirmado no financeiro.")}><CreditCard className="h-4 w-4" /> Dar baixa</Button>
                  <Button type="button" variant="outline" onClick={() => onNotify("Cobrança enviada por WhatsApp.")}><MessageCircle className="h-4 w-4" /> Enviar cobrança</Button>
                </div>
              ) : null}

              {activeTab === "Comunicação" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button type="button" onClick={() => onNotify("Mensagem de confirmação enviada ao paciente.")}><MessageCircle className="h-4 w-4" /> Enviar confirmação</Button>
                  <Button type="button" variant="outline" onClick={() => onNotify("Lembrete de retorno enviado.")}><CalendarClock className="h-4 w-4" /> Lembrete de retorno</Button>
                  <Button type="button" variant="outline" onClick={() => onNotify("Documento compartilhado com o paciente.")}><FileText className="h-4 w-4" /> Compartilhar documento</Button>
                  <Button type="button" variant="outline" onClick={() => onNotify("Tarefa terapêutica enviada.")}><ClipboardList className="h-4 w-4" /> Enviar tarefa</Button>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="overflow-y-auto border-l border-border bg-background p-5">
            <div className="rounded-lg border border-border bg-white p-4">
              <p className="text-sm font-black text-ink">Ações avançadas</p>
              <div className="mt-3 grid gap-2">
                <Button type="button" variant="outline" className="justify-start" onClick={() => onUpdate({ start: "2026-07-22T10:30:00", end: "2026-07-22T11:20:00", status: "confirmada" }, "Sessão reagendada pelo popup.")}><CalendarClock className="h-4 w-4" /> Reagendar</Button>
                <Button type="button" variant="outline" className="justify-start" onClick={() => onNotify("Sessão recorrente configurada.")}><Timer className="h-4 w-4" /> Tornar recorrente</Button>
                <Button type="button" variant="outline" className="justify-start" onClick={() => onNotify("Falta registrada e auditoria simulada.")}><ClipboardList className="h-4 w-4" /> Registrar falta</Button>
                <Button type="button" variant="destructive" className="justify-start" onClick={() => onUpdate({ status: "cancelada" }, "Sessão cancelada pelo popup.")}><Trash2 className="h-4 w-4" /> Cancelar sessão</Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-white p-4">
              <p className="text-sm font-black text-ink">Checklist antes da sessão</p>
              <div className="mt-3 space-y-2 text-sm font-semibold text-ink-muted">
                <CheckRow done label="Consentimento assinado" />
                <CheckRow done={appointment.paid} label="Pagamento confirmado" />
                <CheckRow done={appointment.status === "realizada"} label="Presença confirmada" />
                <CheckRow done={false} label="Evolução finalizada" />
              </div>
            </div>
          </aside>
        </div>
      </Card>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-md border border-border bg-background p-3"><div className="flex items-center gap-2 text-primary">{icon}<span className="text-xs font-black uppercase text-ink-muted">{label}</span></div><p className="mt-2 text-sm font-bold text-ink">{value}</p></div>;
}

function TimelineItem({ title, description }: { title: string; description: string }) {
  return <div className="border-l-2 border-primary/30 pl-3"><p className="font-bold text-ink">{title}</p><p>{description}</p></div>;
}

function FinanceTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-border bg-background p-4"><p className="text-xs font-black uppercase text-ink-muted">{label}</p><p className="mt-2 text-lg font-black text-ink">{value}</p></div>;
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return <div className="flex items-center gap-2"><span className={cn("h-2.5 w-2.5 rounded-full", done ? "bg-success" : "bg-amber-400")} /><span>{label}</span></div>;
}
