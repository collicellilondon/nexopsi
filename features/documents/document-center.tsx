"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FileSignature,
  FileText,
  LockKeyhole,
  Mail,
  PenLine,
  Printer,
  Search,
  ShieldCheck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DocumentStatus = "rascunho" | "pronto" | "assinado" | "enviado" | "vencendo";
type DocumentKind = "Prontuario" | "Contrato" | "Atestado" | "Declaracao" | "Recibo" | "Encaminhamento" | "Consentimento";

type ClinicalDocument = {
  id: string;
  title: string;
  patient: string;
  kind: DocumentKind;
  status: DocumentStatus;
  updatedAt: string;
  expiresAt?: string;
  owner: string;
  content: string;
  tags: string[];
};

type Template = {
  title: string;
  kind: DocumentKind;
  icon: LucideIcon;
  description: string;
  content: string;
};

const templates: Template[] = [
  {
    title: "Evolucao clinica",
    kind: "Prontuario",
    icon: FileText,
    description: "Registro de sessao com evolucao, intervencoes, tarefa e plano.",
    content: "Registro de evolucao clinica com foco da sessao, resposta do paciente, intervencoes realizadas e plano para continuidade."
  },
  {
    title: "Contrato terapeutico",
    kind: "Contrato",
    icon: FileSignature,
    description: "Combinados de atendimento, faltas, sigilo, pagamentos e canais.",
    content: "Contrato terapeutico com regras de atendimento, politica de remarcacao, valores, sigilo profissional e consentimento."
  },
  {
    title: "Termo de consentimento LGPD",
    kind: "Consentimento",
    icon: ShieldCheck,
    description: "Autorizacao de tratamento de dados sensiveis e prontuario.",
    content: "Termo de consentimento para tratamento de dados pessoais e sensiveis, guarda de prontuario e comunicacao com paciente."
  },
  {
    title: "Atestado psicologico",
    kind: "Atestado",
    icon: ClipboardCheck,
    description: "Modelo de atestado com cabecalho, CRP, finalidade e assinatura.",
    content: "Atesto, para os devidos fins, que o paciente esteve em atendimento psicologico na data informada."
  },
  {
    title: "Declaracao de comparecimento",
    kind: "Declaracao",
    icon: FileCheck2,
    description: "Declaracao simples de presenca para paciente ou responsavel.",
    content: "Declaramos que o paciente compareceu ao atendimento psicologico no horario informado."
  },
  {
    title: "Encaminhamento",
    kind: "Encaminhamento",
    icon: Mail,
    description: "Documento para encaminhar paciente a outro profissional.",
    content: "Encaminhamento clinico com motivo, historico resumido e sugestao de avaliacao complementar."
  }
];

const initialDocuments: ClinicalDocument[] = [
  {
    id: "doc-001",
    title: "Evolucao clinica - Marina Duarte",
    patient: "Marina Duarte",
    kind: "Prontuario",
    status: "pronto",
    updatedAt: "2026-07-17",
    owner: "Tatiane Bonfin",
    content: "Paciente compareceu a sessao, relatou melhora parcial da ansiedade e recebeu tarefa de registro de pensamentos automaticos.",
    tags: ["evolucao", "ansiedade", "TCC"]
  },
  {
    id: "doc-002",
    title: "Contrato terapeutico - Caio Martins",
    patient: "Caio Martins",
    kind: "Contrato",
    status: "assinado",
    updatedAt: "2026-07-12",
    owner: "Tatiane Bonfin",
    content: "Contrato terapeutico assinado, com politica de faltas, valores e autorizacao de comunicacao por WhatsApp.",
    tags: ["contrato", "assinatura"]
  },
  {
    id: "doc-003",
    title: "Termo LGPD - Helena Costa",
    patient: "Helena Costa",
    kind: "Consentimento",
    status: "vencendo",
    updatedAt: "2026-06-02",
    expiresAt: "2026-07-25",
    owner: "Tatiane Bonfin",
    content: "Termo de consentimento para tratamento de dados pessoais e sensiveis precisa de revisao anual.",
    tags: ["LGPD", "consentimento"]
  },
  {
    id: "doc-004",
    title: "Declaracao de comparecimento - Rafael Nogueira",
    patient: "Rafael Nogueira",
    kind: "Declaracao",
    status: "rascunho",
    updatedAt: "2026-07-15",
    owner: "Tatiane Bonfin",
    content: "Declaracao em rascunho aguardando confirmacao de horario final.",
    tags: ["declaracao", "comparecimento"]
  }
];

const statusVariant: Record<DocumentStatus, "default" | "warning" | "success" | "destructive" | "muted"> = {
  rascunho: "muted",
  pronto: "default",
  assinado: "success",
  enviado: "success",
  vencendo: "warning"
};

const statusLabel: Record<DocumentStatus, string> = {
  rascunho: "Rascunho",
  pronto: "Pronto",
  assinado: "Assinado",
  enviado: "Enviado",
  vencendo: "Vencendo"
};

type DocumentCenterProps = {
  professionalName: string;
  professionalRegister: string;
  onNotify: (message: string) => void;
};

export function DocumentCenter({ professionalName, professionalRegister, onNotify }: DocumentCenterProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(initialDocuments[0].id);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"todos" | DocumentKind>("todos");

  const visibleDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesKind = kindFilter === "todos" || document.kind === kindFilter;
      const matchesSearch = !search || [document.title, document.patient, document.kind, document.content, document.tags.join(" ")].join(" ").toLowerCase().includes(search);
      return matchesKind && matchesSearch;
    });
  }, [documents, kindFilter, query]);

  const selected = documents.find((document) => document.id === selectedId) ?? documents[0];
  const readyCount = documents.filter((document) => ["pronto", "assinado", "enviado"].includes(document.status)).length;
  const pendingCount = documents.filter((document) => ["rascunho", "vencendo"].includes(document.status)).length;

  function createFromTemplate(template: Template) {
    const document: ClinicalDocument = {
      id: `doc-${Date.now()}`,
      title: `${template.title} - Novo paciente`,
      patient: "Novo paciente",
      kind: template.kind,
      status: "rascunho",
      updatedAt: "2026-07-17",
      owner: professionalName,
      content: template.content,
      tags: [template.kind.toLowerCase(), "novo"]
    };
    setDocuments((current) => [document, ...current]);
    setSelectedId(document.id);
    onNotify(`${template.title} criado em rascunho.`);
  }

  function updateSelected(patch: Partial<ClinicalDocument>, message: string) {
    setDocuments((current) => current.map((document) => (document.id === selected.id ? { ...document, ...patch, updatedAt: "2026-07-17" } : document)));
    onNotify(message);
  }

  function printSelected() {
    onNotify(`${selected.title} preparado para impressao em PDF.`);
    setTimeout(() => window.print(), 120);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={FileText} label="Documentos" value={documents.length.toString()} helper="Modelos e arquivos clinicos" />
        <Metric icon={CheckCircle2} label="Prontos" value={readyCount.toString()} helper="Assinados, enviados ou finalizados" tone="success" />
        <Metric icon={FileClock} label="Pendentes" value={pendingCount.toString()} helper="Rascunhos e termos vencendo" tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Central de documentos</CardTitle>
            <CardDescription>Crie, revise, assine, imprima e acompanhe documentos clinicos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <Input className="pl-9" placeholder="Buscar por paciente, tipo, tag ou conteudo" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <select className="h-10 rounded-md border border-border bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={kindFilter} onChange={(event) => setKindFilter(event.target.value as "todos" | DocumentKind)}>
                <option value="todos">Todos os tipos</option>
                {Array.from(new Set(templates.map((template) => template.kind))).map((kind) => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {visibleDocuments.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => setSelectedId(document.id)}
                  className={cn(
                    "w-full rounded-md border border-border bg-white p-4 text-left transition hover:border-primary/40 hover:bg-primary-soft",
                    selected.id === document.id && "border-primary bg-primary-soft"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-ink">{document.title}</p>
                      <p className="mt-1 text-sm font-semibold text-ink-muted">{document.patient} - {document.kind}</p>
                    </div>
                    <Badge variant={statusVariant[document.status]}>{statusLabel[document.status]}</Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-medium text-ink-muted">{document.content}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <CardTitle>{selected.title}</CardTitle>
                  <CardDescription>{selected.patient} - atualizado em {formatDate(selected.updatedAt)}</CardDescription>
                </div>
                <Badge variant={statusVariant[selected.status]}>{statusLabel[selected.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Info icon={FileText} label="Tipo" value={selected.kind} />
                <Info icon={LockKeyhole} label="Responsavel" value={selected.owner} />
                <Info icon={ShieldCheck} label="Seguranca" value="Documento clinico confidencial" />
                <Info icon={FileClock} label="Vencimento" value={selected.expiresAt ? formatDate(selected.expiresAt) : "Sem vencimento"} />
              </div>

              <label className="text-sm font-black text-ink">
                Conteudo do documento
                <textarea
                  className="mt-2 min-h-40 w-full rounded-md border border-border bg-white p-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  value={selected.content}
                  onChange={(event) => updateSelected({ content: event.target.value, status: "rascunho" }, "Documento atualizado e salvo como rascunho.")}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Button type="button" onClick={() => updateSelected({ status: "pronto" }, "Documento marcado como pronto.")}>
                  <CheckCircle2 className="h-4 w-4" />
                  Aprovar
                </Button>
                <Button type="button" variant="outline" onClick={() => updateSelected({ status: "assinado", owner: professionalName }, "Documento assinado digitalmente na previa.")}>
                  <PenLine className="h-4 w-4" />
                  Assinar
                </Button>
                <Button type="button" variant="outline" onClick={() => updateSelected({ status: "enviado" }, "Documento enviado ao paciente em modo teste.")}>
                  <Mail className="h-4 w-4" />
                  Enviar
                </Button>
                <Button type="button" variant="outline" onClick={printSelected}>
                  <Printer className="h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modelos rapidos</CardTitle>
              <CardDescription>Escolha um modelo para gerar um novo rascunho.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {templates.map((template) => (
                <button key={template.title} type="button" onClick={() => createFromTemplate(template)} className="rounded-md border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-primary-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft text-primary">
                      <template.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-ink">{template.title}</p>
                      <p className="text-xs font-semibold text-ink-muted">{template.kind}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-ink-muted">{template.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="print-sheet rounded-lg border border-border bg-white p-8 shadow-soft">
        <div className="watermark">Nexopsi</div>
        <header className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Nexopsi</p>
            <h3 className="mt-2 text-2xl font-black text-ink">{selected.title}</h3>
            <p className="text-sm text-ink-muted">Documento clinico confidencial.</p>
          </div>
          <div className="text-right text-sm text-ink-muted">
            <p>{professionalName}</p>
            <p>{professionalRegister}</p>
            <p>Emitido em 17/07/2026</p>
          </div>
        </header>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <InfoBlock title="Paciente" value={selected.patient} />
          <InfoBlock title="Tipo" value={selected.kind} />
          <InfoBlock title="Status" value={statusLabel[selected.status]} />
          <InfoBlock title="Responsavel" value={selected.owner} />
          <div className="md:col-span-2">
            <InfoBlock title="Conteudo" value={selected.content} />
          </div>
        </div>
        <footer className="mt-8 border-t border-border pt-5 text-sm text-ink-muted">
          Assinatura: {professionalName} - {professionalRegister}
        </footer>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, helper, tone = "primary" }: { icon: LucideIcon; label: string; value: string; helper: string; tone?: "primary" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "bg-emerald-50 text-success" : tone === "warning" ? "bg-amber-50 text-warning" : "bg-primary-soft text-primary";
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

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
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

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-xs font-black uppercase text-ink-muted">{title}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
