"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ClipboardList, FileText, MessageSquareText, Printer, Receipt, Search, ShieldCheck, Sparkles, UserCheck, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SessionStatus = "agendada" | "em_andamento" | "realizada" | "faltou" | "cancelada";

type ClinicalSession = {
  id: string;
  patient: string;
  date: string;
  time: string;
  mode: "presencial" | "online";
  status: SessionStatus;
  payment: "pago" | "pendente" | "cortesia";
  value: number;
  focus: string;
  evolution: string;
  intervention: string;
  task: string;
  nextPlan: string;
  risk: "baixo" | "moderado" | "alto";
  documents: string[];
};

const initialSessions: ClinicalSession[] = [];

const statusLabel: Record<SessionStatus, string> = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  realizada: "Realizada",
  faltou: "Faltou",
  cancelada: "Cancelada"
};

const statusVariant: Record<SessionStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  agendada: "default",
  em_andamento: "warning",
  realizada: "success",
  faltou: "destructive",
  cancelada: "muted"
};

const paymentVariant = {
  pago: "success",
  pendente: "warning",
  cortesia: "muted"
} as const;

type SessionManagementProps = {
  createdCount: number;
  searchQuery?: string;
  onNotify: (message: string) => void;
};

export function SessionManagement({ createdCount, searchQuery = "", onNotify }: SessionManagementProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | SessionStatus>("todas");

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (createdCount > 0) createSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdCount]);

  const visibleSessions = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesStatus = statusFilter === "todas" || session.status === statusFilter;
      const matchesSearch = !search || [session.patient, session.focus, session.evolution, session.task].join(" ").toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [query, sessions, statusFilter]);

  const selected = sessions.find((session) => session.id === selectedId) ?? sessions[0] ?? null;
  const completed = sessions.filter((session) => session.status === "realizada").length;
  const pendingEvolution = sessions.filter((session) => session.status !== "realizada").length;
  const openPayments = sessions.filter((session) => session.payment === "pendente").length;

  function createSession() {
    const next = sessions.length + 1;
    const session: ClinicalSession = {
      id: `ses-${Date.now()}`,
      patient: `Paciente a definir ${next}`,
      date: "2026-07-20",
      time: "15:00",
      mode: "presencial",
      status: "agendada",
      payment: "pendente",
      value: 320,
      focus: "Sessão inicial",
      evolution: "Campo de evolução pronto para preenchimento após o atendimento.",
      intervention: "Definir técnica utilizada na sessão.",
      task: "Adicionar tarefa terapêutica para casa.",
      nextPlan: "Planejar objetivo da próxima sessão.",
      risk: "baixo",
      documents: ["Evolução"]
    };
    setSessions((current) => [session, ...current]);
    setSelectedId(session.id);
    onNotify("Nova sessão criada com checklist clínico completo.");
  }

  function updateSelected(patch: Partial<ClinicalSession>, message: string) {
    if (!selected) return;
    setSessions((current) => current.map((session) => (session.id === selected.id ? { ...session, ...patch } : session)));
    onNotify(message);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarClock} label="Sessões planejadas" value={sessions.length.toString()} helper="Agenda clínica ativa" />
        <Metric icon={CheckCircle2} label="Evoluções prontas" value={completed.toString()} helper="Registros finalizados" />
        <Metric icon={ClipboardList} label="Pendências clínicas" value={pendingEvolution.toString()} helper="Precisam de revisão" tone="warning" />
        <Metric icon={Receipt} label="Pagamentos abertos" value={openPayments.toString()} helper="Vinculados a sessões" tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Gestão de sessões</CardTitle>
                <CardDescription>Agenda clínica, evolução, presença, pagamento, tarefas e documentos.</CardDescription>
              </div>
              <Button type="button" onClick={createSession}>
                <CalendarClock className="h-4 w-4" />
                Nova sessão
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input className="pl-9" placeholder="Buscar por paciente, foco, evolução ou tarefa" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <select className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "todas" | SessionStatus)}>
                <option value="todas">Todos os status</option>
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {visibleSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedId(session.id)}
                  className={cn("w-full rounded-md border border-border bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary-soft", selected?.id === session.id && "border-primary bg-primary-soft")}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-ink">{session.patient}</p>
                      <p className="mt-1 text-sm font-semibold text-ink-muted">{formatDate(session.date)} as {session.time} - {session.mode}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusVariant[session.status]}>{statusLabel[session.status]}</Badge>
                      <Badge variant={paymentVariant[session.payment]}>{session.payment}</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{session.focus}</p>
                </button>
              ))}
              {visibleSessions.length === 0 ? (
                <div className="rounded-md border border-border bg-background p-4 text-sm font-semibold text-ink-muted">
                  Nenhuma sessão cadastrada. Clique em Nova sessão para testar o fluxo clínico.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {selected ? (
          <SessionDetail selected={selected} updateSelected={updateSelected} onNotify={onNotify} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma sessão selecionada</CardTitle>
              <CardDescription>Crie a primeira sessão para liberar evolução, pagamento, tarefas e documentos.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" onClick={createSession}>
                <CalendarClock className="h-4 w-4" />
                Criar primeira sessão
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SessionDetail({ selected, updateSelected, onNotify }: { selected: ClinicalSession; updateSelected: (patch: Partial<ClinicalSession>, message: string) => void; onNotify: (message: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{selected.patient}</CardTitle>
            <CardDescription>{formatDate(selected.date)} as {selected.time} - {selected.mode}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge>
            <Badge variant={paymentVariant[selected.payment]}>{selected.payment}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={Sparkles} label="Foco da sessão" value={selected.focus} />
          <InfoTile icon={ShieldCheck} label="Risco clínico" value={selected.risk} />
          <InfoTile icon={Receipt} label="Valor" value={selected.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          <InfoTile icon={selected.mode === "online" ? Video : UserCheck} label="Formato" value={selected.mode} />
        </div>

        <div className="grid gap-4">
          <TextBlock title="Evolução clínica" value={selected.evolution} onChange={(value) => updateSelected({ evolution: value }, "Evolução clínica atualizada.")} />
          <TextBlock title="Intervenções e técnicas" value={selected.intervention} onChange={(value) => updateSelected({ intervention: value }, "Intervenções da sessão atualizadas.")} />
          <TextBlock title="Tarefa terapêutica" value={selected.task} onChange={(value) => updateSelected({ task: value }, "Tarefa terapêutica atualizada.")} />
          <TextBlock title="Plano para próxima sessão" value={selected.nextPlan} onChange={(value) => updateSelected({ nextPlan: value }, "Plano da próxima sessão atualizado.")} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Button type="button" onClick={() => updateSelected({ status: "realizada" }, "Sessão marcada como realizada e evolução salva.")}><CheckCircle2 className="h-4 w-4" />Finalizar sessão</Button>
          <Button type="button" variant="outline" onClick={() => updateSelected({ payment: "pago" }, "Pagamento da sessão marcado como pago.")}><Receipt className="h-4 w-4" />Dar baixa</Button>
          <Button type="button" variant="outline" onClick={() => onNotify("Resumo clínico preparado para impressão/PDF.")}><Printer className="h-4 w-4" />Imprimir resumo</Button>
          <Button type="button" variant="outline" onClick={() => onNotify("Mensagem de lembrete enviada ao paciente.")}><MessageSquareText className="h-4 w-4" />Lembrete</Button>
          <Button type="button" variant="outline" onClick={() => onNotify("Documento de evolução gerado para esta sessão.")}><FileText className="h-4 w-4" />Gerar evolução</Button>
          <Button type="button" variant="outline" onClick={() => updateSelected({ status: "faltou" }, "Falta registrada e cobrança sinalizada.")}><ClipboardList className="h-4 w-4" />Registrar falta</Button>
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <p className="text-sm font-black text-ink">Documentos vinculados</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.documents.map((document) => <Badge key={document} variant="secondary">{document}</Badge>)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value, helper, tone = "primary" }: { icon: LucideIcon; label: string; value: string; helper: string; tone?: "primary" | "warning" | "danger" }) {
  const toneClass = tone === "warning" ? "bg-amber-50 text-warning" : tone === "danger" ? "bg-red-50 text-destructive" : "bg-primary-soft text-primary";
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-md", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-muted">{label}</p>
          <p className="mt-1 text-2xl font-black text-ink">{value}</p>
          <p className="mt-1 text-sm text-ink-muted">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-black text-ink">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-ink-muted">{value}</p>
    </div>
  );
}

function TextBlock({ title, value, onChange }: { title: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-black text-ink">
      {title}
      <textarea className="mt-2 min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
