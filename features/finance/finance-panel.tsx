"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, FileText, Plus, Receipt, Search, Send, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/utils";

type InvoiceStatus = "paga" | "pendente" | "atrasada" | "cancelada";

type Invoice = {
  id: string;
  patient: string;
  description: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  method: string;
};

const initialInvoices: Invoice[] = [
  { id: "fat-001", patient: "Marina Duarte", description: "Mensalidade julho - 4 sessões", dueDate: "2026-07-10", amount: 1280, status: "paga", method: "Pix" },
  { id: "fat-002", patient: "Caio Martins", description: "Pacote terapêutico - parcela 2/3", dueDate: "2026-07-15", amount: 960, status: "atrasada", method: "Cartão" },
  { id: "fat-003", patient: "Helena Costa", description: "Avaliação inicial", dueDate: "2026-07-20", amount: 380, status: "pendente", method: "Boleto" },
  { id: "fat-004", patient: "Rafael Nogueira", description: "Sessões avulsas", dueDate: "2026-07-05", amount: 640, status: "atrasada", method: "Pix" },
  { id: "fat-005", patient: "Bianca Lima", description: "Mensalidade julho - 4 sessões", dueDate: "2026-07-25", amount: 1280, status: "pendente", method: "Pix" }
];

const statusStyle: Record<InvoiceStatus, "success" | "warning" | "destructive" | "muted"> = {
  paga: "success",
  pendente: "warning",
  atrasada: "destructive",
  cancelada: "muted"
};

export function FinancePanel({ onNotify }: { onNotify: (message: string) => void }) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "todas">("todas");

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesQuery = [invoice.patient, invoice.description, invoice.method].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "todas" || invoice.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, status]);

  const totals = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "paga").reduce((sum, invoice) => sum + invoice.amount, 0);
    const pending = invoices.filter((invoice) => invoice.status === "pendente").reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoices.filter((invoice) => invoice.status === "atrasada").reduce((sum, invoice) => sum + invoice.amount, 0);
    return { paid, pending, overdue, total: paid + pending + overdue };
  }, [invoices]);

  const chartData = [
    { name: "Pago", value: totals.paid, color: "#2F7D63" },
    { name: "Pendente", value: totals.pending, color: "#B7791F" },
    { name: "Atrasado", value: totals.overdue, color: "#B42318" }
  ];

  const monthlyData = [
    { month: "Mar", receita: 14600, atraso: 1800 },
    { month: "Abr", receita: 15800, atraso: 1200 },
    { month: "Mai", receita: 17100, atraso: 2100 },
    { month: "Jun", receita: 16400, atraso: 1600 },
    { month: "Jul", receita: totals.paid, atraso: totals.overdue }
  ];

  function markPaid(id: string) {
    setInvoices((current) => current.map((invoice) => (invoice.id === id ? { ...invoice, status: "paga" } : invoice)));
    onNotify("Fatura marcada como paga e recibo liberado.");
  }

  function createInvoice() {
    const invoice: Invoice = {
      id: `fat-${Date.now()}`,
      patient: "Novo paciente financeiro",
      description: "Mensalidade terapêutica - 4 sessões",
      dueDate: "2026-08-05",
      amount: 1280,
      status: "pendente",
      method: "Pix"
    };
    setInvoices((current) => [invoice, ...current]);
    onNotify("Nova fatura de mensalidade criada.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Recebido" value={brl.format(totals.paid)} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <Metric title="A receber" value={brl.format(totals.pending)} icon={<WalletCards className="h-5 w-5" />} tone="warning" />
        <Metric title="Inadimplente" value={brl.format(totals.overdue)} icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <Metric title="Carteira mensal" value={brl.format(totals.total)} icon={<Receipt className="h-5 w-5" />} tone="primary" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Receita e inadimplência</CardTitle>
            <CardDescription>Controle mensal de recebimentos, atrasos e previsibilidade.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => brl.format(Number(value)).replace(",00", "")} />
                  <Tooltip formatter={(value) => brl.format(Number(value))} />
                  <Bar dataKey="receita" name="Recebido" fill="#245B68" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="atraso" name="Atrasado" fill="#B42318" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adimplência</CardTitle>
            <CardDescription>Distribuição atual das faturas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" innerRadius={64} outerRadius={96} paddingAngle={4}>
                    {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => brl.format(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Faturas, mensalidades e cobranças</CardTitle>
              <CardDescription>Gerencie pagamentos, inadimplentes, recibos e lembretes.</CardDescription>
            </div>
            <Button type="button" onClick={createInvoice}>
              <Plus className="h-4 w-4" />
              Nova fatura
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Buscar paciente, fatura ou forma de pagamento" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["todas", "paga", "pendente", "atrasada"] as const).map((item) => (
                <Button key={item} type="button" size="sm" variant={status === item ? "default" : "outline"} onClick={() => setStatus(item)}>
                  {item === "todas" ? "Todas" : item}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="hidden grid-cols-[1fr_1.1fr_0.65fr_0.55fr_0.65fr_170px] gap-4 bg-background px-4 py-3 text-xs font-black uppercase text-ink-muted lg:grid">
              <span>Paciente</span>
              <span>Descrição</span>
              <span>Vencimento</span>
              <span>Valor</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            <div className="divide-y divide-border bg-white">
              {filtered.map((invoice) => (
                <div key={invoice.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_1.1fr_0.65fr_0.55fr_0.65fr_170px] lg:items-center">
                  <p className="font-bold text-ink">{invoice.patient}</p>
                  <p className="text-sm text-ink-muted">{invoice.description}</p>
                  <p className="text-sm font-semibold text-ink">{new Date(invoice.dueDate).toLocaleDateString("pt-BR")}</p>
                  <p className="font-black text-ink">{brl.format(invoice.amount)}</p>
                  <Badge variant={statusStyle[invoice.status]}>{invoice.status}</Badge>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => markPaid(invoice.id)}>Baixar</Button>
                    <Button type="button" size="icon" variant="ghost" aria-label="Enviar cobrança" onClick={() => onNotify(`Cobrança enviada para ${invoice.patient}.`)}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" aria-label="Gerar recibo" onClick={() => onNotify(`Recibo de ${invoice.patient} preparado.`)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, icon, tone }: { title: string; value: string; icon: React.ReactNode; tone: "primary" | "success" | "warning" | "danger" }) {
  const color = {
    primary: "bg-primary-soft text-primary",
    success: "bg-emerald-50 text-success",
    warning: "bg-amber-50 text-warning",
    danger: "bg-red-50 text-destructive"
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-ink-muted">{title}</p>
          <p className="mt-2 text-2xl font-black text-ink">{value}</p>
        </div>
        <div className={`rounded-md p-3 ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
