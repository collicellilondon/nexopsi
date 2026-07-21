"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Receipt,
  Search,
  Settings2,
  WalletCards,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SegmentedTabs } from "@/components/ui/tabs";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { brl } from "@/lib/utils";
import type { Patient } from "@/lib/types";

type InvoiceStatus = "paga" | "pendente" | "atrasada" | "cancelada";
type InvoiceKind = "sessao" | "mensalidade" | "pacote" | "avulsa";
type FinanceTab = "Visao geral" | "Valores" | "Pagamentos" | "Faturas";

type Invoice = {
  id: string;
  patientId?: string;
  patient: string;
  patientCpf?: string;
  patientPhone?: string;
  patientEmail?: string;
  description: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  method: string;
  kind: InvoiceKind;
  installments?: string;
};

type ServicePrice = {
  id: string;
  name: string;
  duration: string;
  value: number;
  recurrence: string;
  active: boolean;
};

type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  settlement: string;
};

const initialInvoices: Invoice[] = [];

const initialPrices: ServicePrice[] = [
  { id: "preco-individual", name: "Sessao individual", duration: "50 min", value: 320, recurrence: "Por sessao", active: true },
  { id: "preco-avaliacao", name: "Avaliacao psicologica", duration: "90 min", value: 480, recurrence: "Por atendimento", active: true },
  { id: "preco-mensal", name: "Mensalidade terapeutica", duration: "4 sessoes", value: 1280, recurrence: "Mensal", active: true },
  { id: "preco-pacote", name: "Pacote de acompanhamento", duration: "8 sessoes", value: 2400, recurrence: "Pacote", active: false }
];

const initialMethods: PaymentMethod[] = [
  { id: "pix", name: "Pix", description: "Chave Pix, QR Code ou copia e cola.", enabled: true, settlement: "Na hora" },
  { id: "cartao", name: "Cartao", description: "Credito, debito ou link de pagamento.", enabled: true, settlement: "1 a 30 dias" },
  { id: "boleto", name: "Boleto", description: "Cobranca bancaria para mensalidades.", enabled: false, settlement: "1 a 3 dias" },
  { id: "dinheiro", name: "Dinheiro", description: "Pagamento presencial no consultorio.", enabled: true, settlement: "Na hora" }
];

const statusStyle: Record<InvoiceStatus, "success" | "warning" | "destructive" | "muted"> = {
  paga: "success",
  pendente: "warning",
  atrasada: "destructive",
  cancelada: "muted"
};

const statusLabel: Record<InvoiceStatus, string> = {
  paga: "Paga",
  pendente: "Pendente",
  atrasada: "Atrasada",
  cancelada: "Cancelada"
};

const kindLabel: Record<InvoiceKind, string> = {
  sessao: "Sessao",
  mensalidade: "Mensalidade",
  pacote: "Pacote",
  avulsa: "Avulsa"
};

export function FinancePanel({ workspaceId, patients = [], searchQuery = "", onNotify }: { workspaceId?: string | null; patients?: Patient[]; searchQuery?: string; onNotify: (message: string) => void }) {
  const [activeTab, setActiveTab] = useState<FinanceTab>("Visao geral");
  const [invoices, setInvoices] = useState(initialInvoices);
  const [prices, setPrices] = useState(initialPrices);
  const [methods, setMethods] = useState(initialMethods);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "todas">("todas");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    setQuery(searchQuery);
    if (searchQuery) setActiveTab("Faturas");
  }, [searchQuery]);

  useEffect(() => {
    if (!workspaceId) return;

    async function loadFinanceData() {
      try {
        const supabase = createBrowserSupabaseClient();
        const [{ data: savedPrices, error: pricesError }, { data: savedInvoices, error: invoicesError }] = await Promise.all([
          supabase.from("service_prices").select("id, name, duration, value, recurrence, active").eq("organization_id", workspaceId).order("created_at", { ascending: true }),
          supabase.from("invoices").select("id, patient_id, patient_name, patient_cpf, patient_phone, patient_email, description, due_date, amount, status, method, kind, installments").eq("organization_id", workspaceId).order("created_at", { ascending: false })
        ]);

        if (pricesError) onNotify(`Nao foi possivel carregar valores: ${pricesError.message}`);
        if (invoicesError) onNotify(`Nao foi possivel carregar faturas: ${invoicesError.message}`);

        if (savedPrices && savedPrices.length > 0) setPrices(savedPrices.map(mapDatabasePrice));
        if (savedInvoices) setInvoices(savedInvoices.map(mapDatabaseInvoice));
      } catch {
        onNotify("Nao foi possivel conectar ao Supabase para carregar o financeiro.");
      }
    }

    loadFinanceData();
  }, [workspaceId, onNotify]);

  const filtered = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesQuery = [invoice.patient, invoice.patientPhone, invoice.patientEmail, invoice.description, invoice.method, kindLabel[invoice.kind]]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === "todas" || invoice.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [invoices, query, status]);

  const totals = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "paga").reduce((sum, invoice) => sum + invoice.amount, 0);
    const pending = invoices.filter((invoice) => invoice.status === "pendente").reduce((sum, invoice) => sum + invoice.amount, 0);
    const overdue = invoices.filter((invoice) => invoice.status === "atrasada").reduce((sum, invoice) => sum + invoice.amount, 0);
    const canceled = invoices.filter((invoice) => invoice.status === "cancelada").reduce((sum, invoice) => sum + invoice.amount, 0);
    const activeTotal = paid + pending + overdue;
    const openCount = invoices.filter((invoice) => invoice.status === "pendente" || invoice.status === "atrasada").length;
    const paidCount = invoices.filter((invoice) => invoice.status === "paga").length;
    const billableCount = invoices.filter((invoice) => invoice.status !== "cancelada").length;
    const complianceRate = billableCount > 0 ? Math.round((paidCount / billableCount) * 100) : 100;
    return { paid, pending, overdue, canceled, activeTotal, openCount, paidCount, complianceRate };
  }, [invoices]);

  const chartData = [
    { name: "Pago", value: totals.paid, color: "#2F7D63" },
    { name: "Pendente", value: totals.pending, color: "#B7791F" },
    { name: "Atrasado", value: totals.overdue, color: "#B42318" }
  ];

  const monthlyData = [
    { month: "Mar", receita: 0, atraso: 0 },
    { month: "Abr", receita: 0, atraso: 0 },
    { month: "Mai", receita: 0, atraso: 0 },
    { month: "Jun", receita: 0, atraso: 0 },
    { month: "Jul", receita: totals.paid, atraso: totals.overdue }
  ];

  async function markPaid(id: string) {
    setInvoices((current) => current.map((invoice) => (invoice.id === id ? { ...invoice, status: "paga" } : invoice)));
    if (workspaceId) {
      const supabase = createBrowserSupabaseClient();
      await supabase.from("invoices").update({ status: "paga" }).eq("id", id).eq("organization_id", workspaceId);
    }
    onNotify("Fatura marcada como paga e recibo liberado.");
  }

  async function cancelInvoice(id: string) {
    setInvoices((current) => current.map((invoice) => (invoice.id === id ? { ...invoice, status: "cancelada" } : invoice)));
    if (workspaceId) {
      const supabase = createBrowserSupabaseClient();
      await supabase.from("invoices").update({ status: "cancelada" }).eq("id", id).eq("organization_id", workspaceId);
    }
    onNotify("Fatura cancelada.");
  }

  async function saveInvoice(invoice: Omit<Invoice, "id">) {
    const nextInvoice = { ...invoice, id: `fat-${Date.now()}` };
    setInvoices((current) => [nextInvoice, ...current]);
    setInvoiceModalOpen(false);
    setActiveTab("Faturas");
    if (!workspaceId) {
      onNotify("Fatura criada nesta tela. Aguarde o workspace carregar para salvar no Supabase.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.from("invoices").insert(mapInvoiceToDatabase(nextInvoice, workspaceId)).select("id, patient_id, patient_name, patient_cpf, patient_phone, patient_email, description, due_date, amount, status, method, kind, installments").single();
    if (error) {
      onNotify(`Nao foi possivel salvar a fatura no Supabase: ${error.message}`);
      return;
    }
    setInvoices((current) => [mapDatabaseInvoice(data), ...current.filter((item) => item.id !== nextInvoice.id)]);
    onNotify(`Fatura de ${brl.format(invoice.amount)} salva para ${invoice.patient}.`);
  }

  async function savePrice(price: Omit<ServicePrice, "id" | "active">) {
    const nextPrice = { ...price, id: `preco-${Date.now()}`, active: true };
    setPrices((current) => [nextPrice, ...current]);
    setPriceModalOpen(false);
    if (!workspaceId) {
      onNotify(`Valor "${price.name}" cadastrado nesta tela. Aguarde o workspace carregar para salvar no Supabase.`);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { data, error } = await supabase.from("service_prices").insert(mapPriceToDatabase(nextPrice, workspaceId)).select("id, name, duration, value, recurrence, active").single();
    if (error) {
      onNotify(`Nao foi possivel salvar o valor no Supabase: ${error.message}`);
      return;
    }
    setPrices((current) => [mapDatabasePrice(data), ...current.filter((item) => item.id !== nextPrice.id)]);
    onNotify(`Valor "${price.name}" salvo no Supabase.`);
  }

  async function saveAllPrices() {
    if (!workspaceId) {
      onNotify("Aguarde o workspace carregar para salvar os valores.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const payload = prices.map((price) => mapPriceToDatabase(price, workspaceId));
    const { data, error } = await supabase.from("service_prices").upsert(payload, { onConflict: "id" }).select("id, name, duration, value, recurrence, active");
    if (error) {
      onNotify(`Nao foi possivel atualizar os valores: ${error.message}`);
      return;
    }
    setPrices((data ?? []).map(mapDatabasePrice));
    onNotify("Valores atualizados e salvos no Supabase.");
  }

  function togglePrice(id: string) {
    setPrices((current) => current.map((price) => (price.id === id ? { ...price, active: !price.active } : price)));
    onNotify("Status do valor atualizado.");
  }

  function updatePriceValue(id: string, value: number) {
    setPrices((current) => current.map((price) => (price.id === id ? { ...price, value } : price)));
  }

  function toggleMethod(id: string) {
    setMethods((current) => current.map((method) => (method.id === id ? { ...method, enabled: !method.enabled } : method)));
    onNotify("Forma de pagamento atualizada.");
  }

  function generateInvoicePdf(invoice: Invoice) {
    setPrintInvoice(invoice);
    onNotify(`PDF da fatura de ${invoice.patient} preparado.`);
    window.setTimeout(() => window.print(), 120);
  }

  function sendInvoiceWhatsApp(invoice: Invoice) {
    const phone = normalizePhoneForWhatsApp(invoice.patientPhone);
    if (!phone) {
      onNotify(`Informe o WhatsApp de ${invoice.patient} no cadastro ou na fatura.`);
      return;
    }

    const message = buildInvoiceMessage(invoice, "whatsapp");

    setPrintInvoice(invoice);
    window.setTimeout(() => window.print(), 120);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    onNotify(`PDF da fatura aberto. Salve o arquivo e anexe no WhatsApp de ${invoice.patient}.`);
  }

  function sendInvoiceEmail(invoice: Invoice) {
    if (!invoice.patientEmail) {
      onNotify(`Informe o e-mail de ${invoice.patient} no cadastro ou na fatura.`);
      return;
    }

    const subject = `Fatura Nexopsi - ${invoice.patient}`;
    const body = buildInvoiceMessage(invoice, "email");

    setPrintInvoice(invoice);
    window.setTimeout(() => window.print(), 120);
    window.setTimeout(() => {
      window.location.href = `mailto:${invoice.patientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 300);
    onNotify(`PDF da fatura aberto. Salve o arquivo e anexe no e-mail para ${invoice.patient}.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedTabs value={activeTab} options={["Visao geral", "Valores", "Pagamentos", "Faturas"]} onChange={(value) => setActiveTab(value as FinanceTab)} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPriceModalOpen(true)}>
            <Settings2 className="h-4 w-4" />
            Novo valor
          </Button>
          <Button type="button" onClick={() => setInvoiceModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova fatura
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Recebido" value={brl.format(totals.paid)} helper={`${totals.paidCount} faturas pagas`} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <Metric title="A receber" value={brl.format(totals.pending)} helper="Pendencias em aberto" icon={<WalletCards className="h-5 w-5" />} tone="warning" />
        <Metric title="Inadimplente" value={brl.format(totals.overdue)} helper="Faturas vencidas" icon={<AlertTriangle className="h-5 w-5" />} tone="danger" />
        <Metric title="Adimplencia" value={`${totals.complianceRate}%`} helper={`${totals.openCount} cobrancas abertas`} icon={<Receipt className="h-5 w-5" />} tone="primary" />
      </div>

      {activeTab === "Visao geral" ? <OverviewTab chartData={chartData} monthlyData={monthlyData} totals={totals} onNotify={onNotify} /> : null}
      {activeTab === "Valores" ? <PricesTab prices={prices} onToggle={togglePrice} onChangeValue={updatePriceValue} onCreate={() => setPriceModalOpen(true)} onSaveAll={saveAllPrices} /> : null}
      {activeTab === "Pagamentos" ? <PaymentsTab methods={methods} onToggle={toggleMethod} onNotify={onNotify} /> : null}
      {activeTab === "Faturas" ? (
        <InvoicesTab
          filtered={filtered}
          query={query}
          status={status}
          onQueryChange={setQuery}
          onStatusChange={setStatus}
          onCreate={() => setInvoiceModalOpen(true)}
          onMarkPaid={markPaid}
          onCancel={cancelInvoice}
          onGeneratePdf={generateInvoicePdf}
          onSendWhatsApp={sendInvoiceWhatsApp}
          onSendEmail={sendInvoiceEmail}
          onNotify={onNotify}
        />
      ) : null}

      {invoiceModalOpen ? <InvoiceModal patients={patients} prices={prices} methods={methods} onClose={() => setInvoiceModalOpen(false)} onSave={saveInvoice} /> : null}
      {priceModalOpen ? <PriceModal onClose={() => setPriceModalOpen(false)} onSave={savePrice} /> : null}
      {printInvoice ? <ModernPrintableInvoice invoice={printInvoice} onClose={() => setPrintInvoice(null)} /> : null}
    </div>
  );
}

function OverviewTab({
  chartData,
  monthlyData,
  totals,
  onNotify
}: {
  chartData: { name: string; value: number; color: string }[];
  monthlyData: { month: string; receita: number; atraso: number }[];
  totals: { paid: number; pending: number; overdue: number; canceled: number; activeTotal: number };
  onNotify: (message: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Receita e inadimplencia</CardTitle>
          <CardDescription>Controle mensal de recebimentos, atrasos e previsibilidade financeira.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => brl.format(Number(value)).replace(",00", "")} />
                <Tooltip formatter={(value) => brl.format(Number(value))} />
                <Bar dataKey="receita" name="Recebido" fill="#6D48E5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="atraso" name="Atrasado" fill="#B42318" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuicao das faturas</CardTitle>
          <CardDescription>Visao rapida entre pagos, pendentes e vencidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={4}>
                  {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => brl.format(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-2">
            {chartData.map((item) => (
              <button key={item.name} type="button" onClick={() => onNotify(`${item.name}: ${brl.format(item.value)}`)} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm font-bold text-ink">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />{item.name}</span>
                {brl.format(item.value)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Estrutura financeira configurada</CardTitle>
          <CardDescription>Resumo do que a clinica deve acompanhar todos os meses.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <SummaryItem title="Carteira ativa" value={brl.format(totals.activeTotal)} description="Pagas, pendentes e vencidas" />
          <SummaryItem title="Canceladas" value={brl.format(totals.canceled)} description="Faturas sem cobranca ativa" />
          <SummaryItem title="Pendencias" value={brl.format(totals.pending + totals.overdue)} description="Valor que exige acompanhamento" />
          <SummaryItem title="Recibos" value="PDF" description="Liberados apos baixa manual" />
        </CardContent>
      </Card>
    </div>
  );
}

function PricesTab({
  prices,
  onToggle,
  onChangeValue,
  onCreate,
  onSaveAll
}: {
  prices: ServicePrice[];
  onToggle: (id: string) => void;
  onChangeValue: (id: string, value: number) => void;
  onCreate: () => void;
  onSaveAll: () => void;
}) {
  const activePrices = prices.filter((price) => price.active);
  const averageValue = activePrices.length > 0 ? activePrices.reduce((sum, price) => sum + price.value, 0) / activePrices.length : 0;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <Card>
        <CardHeader>
          <CardTitle>Tabela de valores</CardTitle>
          <CardDescription>Configure os preços usados em faturas, mensalidades e pacotes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SummaryItem title="Valores ativos" value={String(activePrices.length)} description="Opções disponíveis para faturar" />
          <SummaryItem title="Valor médio" value={brl.format(averageValue)} description="Média dos serviços ativos" />
          <SummaryItem title="Maior valor" value={brl.format(Math.max(0, ...prices.map((price) => price.value)))} description="Referência máxima cadastrada" />
          <div className="grid gap-2 pt-2">
            <Button type="button" onClick={onSaveAll}>
              <CheckCircle2 className="h-4 w-4" />
              Salvar alterações
            </Button>
            <Button type="button" variant="outline" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Novo valor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Serviços cobrados</CardTitle>
            <CardDescription>Edite valores, ative/desative serviços e salve tudo no Supabase.</CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={onSaveAll}><CheckCircle2 className="h-4 w-4" />Atualizar e salvar</Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        {prices.map((price) => (
          <div key={price.id} className="rounded-lg border border-border bg-white p-4 shadow-line">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black text-ink">{price.name}</h3>
                  <Badge variant={price.active ? "success" : "muted"}>{price.active ? "Ativo" : "Inativo"}</Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-ink-muted">{price.duration} - {price.recurrence}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" aria-label={`Editar ${price.name}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <label className="mt-4 block text-sm font-bold text-ink">
              Valor cobrado
              <Input className="mt-2" type="number" min={0} step={10} value={price.value} onChange={(event) => onChangeValue(price.id, Number(event.target.value))} />
            </label>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xl font-black text-primary">{brl.format(price.value || 0)}</p>
              <Button type="button" variant={price.active ? "outline" : "default"} onClick={() => onToggle(price.id)}>
                {price.active ? "Desativar" : "Ativar"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    </div>
  );
}

function PaymentsTab({ methods, onToggle, onNotify }: { methods: PaymentMethod[]; onToggle: (id: string) => void; onNotify: (message: string) => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
      <Card>
        <CardHeader>
          <CardTitle>Formas de pagamento</CardTitle>
          <CardDescription>Ative os meios aceitos pela clinica e deixe claro o prazo de compensacao.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {methods.map((method) => (
            <button key={method.id} type="button" onClick={() => onToggle(method.id)} className="rounded-lg border border-border bg-background p-4 text-left transition hover:border-primary/30 hover:bg-primary-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-primary">
                  {method.id === "pix" ? <Banknote className="h-5 w-5" /> : method.id === "cartao" ? <CreditCard className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
                </div>
                <Badge variant={method.enabled ? "success" : "muted"}>{method.enabled ? "Ativo" : "Inativo"}</Badge>
              </div>
              <h3 className="mt-4 font-black text-ink">{method.name}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">{method.description}</p>
              <p className="mt-3 text-xs font-black uppercase text-primary">Compensacao: {method.settlement}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de cobranca</CardTitle>
          <CardDescription>Modelo operacional para acompanhar pagamentos sem confusao.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Mensalidades vencem na data escolhida para cada paciente.",
            "Faturas atrasadas entram automaticamente na lista de inadimplentes.",
            "A baixa manual libera recibo e atualiza os indicadores.",
            "Cobrancas podem ser enviadas por WhatsApp ou e-mail."
          ].map((item) => (
            <button key={item} type="button" onClick={() => onNotify(item)} className="flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-left text-sm font-semibold text-ink">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {item}
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InvoicesTab({
  filtered,
  query,
  status,
  onQueryChange,
  onStatusChange,
  onCreate,
  onMarkPaid,
  onCancel,
  onGeneratePdf,
  onSendWhatsApp,
  onSendEmail,
  onNotify
}: {
  filtered: Invoice[];
  query: string;
  status: InvoiceStatus | "todas";
  onQueryChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus | "todas") => void;
  onCreate: () => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onGeneratePdf: (invoice: Invoice) => void;
  onSendWhatsApp: (invoice: Invoice) => void;
  onSendEmail: (invoice: Invoice) => void;
  onNotify: (message: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Faturas, mensalidades e cobrancas</CardTitle>
            <CardDescription>Gerencie pagamentos, inadimplentes, recibos, PDF e envio por WhatsApp ou e-mail.</CardDescription>
          </div>
          <Button type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            Nova fatura
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input value={query} onChange={(event) => onQueryChange(event.target.value)} className="pl-9" placeholder="Buscar paciente, fatura, tipo ou forma de pagamento" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["todas", "paga", "pendente", "atrasada", "cancelada"] as const).map((item) => (
              <Button key={item} type="button" size="sm" variant={status === item ? "default" : "outline"} onClick={() => onStatusChange(item)}>
                {item === "todas" ? "Todas" : statusLabel[item]}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="hidden grid-cols-[0.95fr_1.1fr_0.55fr_0.65fr_0.55fr_0.65fr_270px] gap-4 bg-background px-4 py-3 text-xs font-black uppercase text-ink-muted lg:grid">
            <span>Paciente</span>
            <span>Descricao</span>
            <span>Tipo</span>
            <span>Vencimento</span>
            <span>Valor</span>
            <span>Status</span>
            <span>Acoes</span>
          </div>
          <div className="divide-y divide-border bg-white">
            {filtered.map((invoice) => (
              <div key={invoice.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[0.95fr_1.1fr_0.55fr_0.65fr_0.55fr_0.65fr_270px] lg:items-center">
                <div>
                  <p className="font-bold text-ink">{invoice.patient}</p>
                  <p className="text-xs font-semibold text-ink-muted">{invoice.patientPhone || invoice.patientEmail || "Sem contato"}</p>
                </div>
                <p className="text-sm text-ink-muted">{invoice.description}</p>
                <Badge variant="secondary">{kindLabel[invoice.kind]}</Badge>
                <p className="text-sm font-semibold text-ink">{new Date(invoice.dueDate).toLocaleDateString("pt-BR")}</p>
                <p className="font-black text-ink">{brl.format(invoice.amount)}</p>
                <Badge variant={statusStyle[invoice.status]}>{statusLabel[invoice.status]}</Badge>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onMarkPaid(invoice.id)}>Baixar</Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Gerar PDF" onClick={() => onGeneratePdf(invoice)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Enviar por WhatsApp" onClick={() => onSendWhatsApp(invoice)}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Enviar por e-mail" onClick={() => onSendEmail(invoice)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="Cancelar fatura" onClick={() => onCancel(invoice.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm font-semibold text-ink-muted">
                Nenhuma fatura cadastrada. Clique em Nova fatura para criar a primeira cobranca.
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceModal({
  patients,
  prices,
  methods,
  onClose,
  onSave
}: {
  patients: Patient[];
  prices: ServicePrice[];
  methods: PaymentMethod[];
  onClose: () => void;
  onSave: (invoice: Omit<Invoice, "id">) => void;
}) {
  const activePrices = prices.filter((price) => price.active);
  const enabledMethods = methods.filter((method) => method.enabled);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? "");
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const [patient, setPatient] = useState(selectedPatient?.name ?? "");
  const [patientCpf, setPatientCpf] = useState(selectedPatient?.cpf ?? "");
  const [patientPhone, setPatientPhone] = useState(selectedPatient?.phone ?? "");
  const [patientEmail, setPatientEmail] = useState(selectedPatient?.email ?? "");
  const [selectedPriceId, setSelectedPriceId] = useState(activePrices[0]?.id ?? "");
  const selectedPrice = activePrices.find((price) => price.id === selectedPriceId);
  const [description, setDescription] = useState(selectedPrice?.name ?? "");
  const [dueDate, setDueDate] = useState("2026-08-05");
  const [amount, setAmount] = useState(selectedPrice?.value ?? 0);
  const [kind, setKind] = useState<InvoiceKind>("mensalidade");
  const [method, setMethod] = useState(enabledMethods[0]?.name ?? "Pix");
  const [status, setStatus] = useState<InvoiceStatus>("pendente");
  const [installments, setInstallments] = useState("1x");

  function choosePrice(id: string) {
    const price = activePrices.find((item) => item.id === id);
    setSelectedPriceId(id);
    if (!price) return;
    setDescription(price.name);
    setAmount(price.value);
    setKind(price.recurrence.toLowerCase().includes("mensal") ? "mensalidade" : price.recurrence.toLowerCase().includes("pacote") ? "pacote" : "sessao");
  }

  function choosePatient(id: string) {
    const nextPatient = patients.find((item) => item.id === id);
    setSelectedPatientId(id);
    if (!nextPatient) {
      setPatient("");
      setPatientCpf("");
      setPatientPhone("");
      setPatientEmail("");
      return;
    }
    setPatient(nextPatient.name);
    setPatientCpf(nextPatient.cpf ?? "");
    setPatientPhone(nextPatient.phone);
    setPatientEmail(nextPatient.email);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <Card className="max-h-[92vh] w-full max-w-4xl overflow-y-auto shadow-[0_30px_90px_rgba(31,41,55,0.22)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border">
          <div>
            <CardTitle>Nova fatura</CardTitle>
            <CardDescription>Escolha um cliente cadastrado, gere PDF e envie a cobranca pelo WhatsApp.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-ink">
              Cliente cadastrado
              <select value={selectedPatientId} onChange={(event) => choosePatient(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                {patients.length === 0 ? <option value="">Nenhum paciente cadastrado</option> : null}
                {patients.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} - {item.phone || item.email || "sem contato"}</option>
                ))}
                <option value="">Paciente avulso</option>
              </select>
            </label>
            {patients.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {patients.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => choosePatient(item.id)} className={`rounded-md border p-3 text-left text-sm transition hover:bg-primary-soft ${selectedPatientId === item.id ? "border-primary bg-primary-soft" : "border-border bg-background"}`}>
                    <span className="block font-black text-ink">{item.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-ink-muted">{item.phone || item.email || "Sem contato cadastrado"}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Field label="Nome na fatura"><Input value={patient} onChange={(event) => setPatient(event.target.value)} placeholder="Nome do paciente" /></Field>
          <Field label="CPF"><Input value={patientCpf} onChange={(event) => setPatientCpf(event.target.value)} placeholder="000.000.000-00" /></Field>
          <Field label="WhatsApp do paciente"><Input value={patientPhone} onChange={(event) => setPatientPhone(event.target.value)} placeholder="5511999999999" /></Field>
          <Field label="E-mail do paciente"><Input value={patientEmail} onChange={(event) => setPatientEmail(event.target.value)} placeholder="paciente@email.com" /></Field>
          <label className="block text-sm font-bold text-ink">
            Usar valor cadastrado
            <select value={selectedPriceId} onChange={(event) => choosePrice(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              {activePrices.map((price) => <option key={price.id} value={price.id}>{price.name} - {brl.format(price.value)}</option>)}
              <option value="">Personalizado</option>
            </select>
          </label>
          <Field label="Descricao"><Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mensalidade terapeutica - 4 sessoes" /></Field>
          <Field label="Vencimento"><Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></Field>
          <Field label="Valor"><Input type="number" min={0} step={10} value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></Field>
          <label className="block text-sm font-bold text-ink">
            Tipo
            <select value={kind} onChange={(event) => setKind(event.target.value as InvoiceKind)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="sessao">Sessao</option>
              <option value="mensalidade">Mensalidade</option>
              <option value="pacote">Pacote</option>
              <option value="avulsa">Avulsa</option>
            </select>
          </label>
          <label className="block text-sm font-bold text-ink">
            Forma de pagamento
            <select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              {enabledMethods.map((item) => <option key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold text-ink">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as InvoiceStatus)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
              <option value="atrasada">Atrasada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
          <Field label="Parcelas / recorrencia"><Input value={installments} onChange={(event) => setInstallments(event.target.value)} placeholder="1x, 4 sessoes, mensal recorrente" /></Field>
          <div className="flex flex-col justify-end gap-3 border-t border-border pt-4 md:col-span-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={() => onSave({ patientId: selectedPatientId || undefined, patient: patient || "Paciente a definir", patientCpf, patientPhone, patientEmail, description: description || "Cobranca clinica", dueDate, amount, status, method, kind, installments })}>Salvar fatura</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PriceModal({ onClose, onSave }: { onClose: () => void; onSave: (price: Omit<ServicePrice, "id" | "active">) => void }) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("50 min");
  const [value, setValue] = useState(320);
  const [recurrence, setRecurrence] = useState("Por sessao");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-xl shadow-[0_30px_90px_rgba(31,41,55,0.22)]">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border">
          <div>
            <CardTitle>Novo valor de atendimento</CardTitle>
            <CardDescription>Cadastre precos usados nas faturas e mensalidades.</CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Nome"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Sessao individual, pacote mensal..." /></Field></div>
          <Field label="Duracao / quantidade"><Input value={duration} onChange={(event) => setDuration(event.target.value)} /></Field>
          <Field label="Valor"><Input type="number" min={0} step={10} value={value} onChange={(event) => setValue(Number(event.target.value))} /></Field>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-ink">
              Recorrencia
              <select value={recurrence} onChange={(event) => setRecurrence(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                <option>Por sessao</option>
                <option>Por atendimento</option>
                <option>Mensal</option>
                <option>Pacote</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4 md:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={() => onSave({ name: name || "Novo atendimento", duration, value, recurrence })}>Salvar valor</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PrintableInvoice({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  return (
    <div className="print-sheet fixed inset-0 z-[60] overflow-y-auto bg-white p-6 print:p-0">
      <div className="relative mx-auto min-h-[1060px] max-w-4xl overflow-hidden rounded-lg border border-border bg-white shadow-soft print:min-h-screen print:rounded-none print:border-0 print:shadow-none">
        <div className="pdf-logo-watermark" />
        <div className="relative z-10">
          <header className="bg-gradient-to-br from-[#24145F] via-[#42259A] to-[#6D48E5] px-10 py-9 text-white">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div className="flex h-20 w-72 items-center overflow-hidden rounded-md bg-white/95 p-2 shadow-[0_18px_45px_rgba(18,11,49,0.22)]">
                  <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={320} height={150} priority className="h-full w-full object-contain" />
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-white/65">Documento financeiro</p>
                <h1 className="mt-2 text-5xl font-black leading-tight tracking-tight">Fatura</h1>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/78">
                  Cobrança gerada pela Nexopsi para controle de atendimento, mensalidade ou serviço clínico.
                </p>
              </div>
              <div className="min-w-52 rounded-lg border border-white/15 bg-white/10 p-4 text-right backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Identificação</p>
                <p className="mt-2 break-all text-lg font-black text-white">{invoice.id}</p>
                <p className="mt-4 text-sm font-semibold text-white/75">Vencimento</p>
                <p className="text-xl font-black text-white">{new Date(invoice.dueDate).toLocaleDateString("pt-BR")}</p>
                <Badge variant={statusStyle[invoice.status]} className="mt-4">{statusLabel[invoice.status]}</Badge>
              </div>
            </div>
          </header>

          <main className="px-10 py-9">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-primary/12 bg-white/92 p-5 shadow-line">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Cliente</p>
                <p className="mt-3 text-2xl font-black text-ink">{invoice.patient}</p>
                <div className="mt-4 space-y-1 text-sm font-semibold text-ink-muted">
                  <p>{invoice.patientPhone || "Telefone não informado"}</p>
                  <p>{invoice.patientEmail || "E-mail não informado"}</p>
                </div>
              </div>
              <div className="rounded-lg border border-primary/12 bg-white/92 p-5 shadow-line">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Pagamento</p>
                <p className="mt-3 text-2xl font-black text-ink">{invoice.method}</p>
                <div className="mt-4 space-y-1 text-sm font-semibold text-ink-muted">
                  <p>{kindLabel[invoice.kind]}</p>
                  <p>{invoice.installments || "Parcela única"}</p>
                </div>
              </div>
            </div>

            <div className="mt-9 overflow-hidden rounded-lg border border-border bg-white/95 shadow-line">
              <div className="grid grid-cols-[1fr_170px] bg-[#F4F0FF] px-5 py-4 text-xs font-black uppercase tracking-[0.12em] text-primary">
                <span>Descrição</span>
                <span className="text-right">Valor</span>
              </div>
              <div className="grid grid-cols-[1fr_170px] px-5 py-7 text-sm font-semibold text-ink">
                <span>{invoice.description}</span>
                <span className="text-right text-xl font-black">{brl.format(invoice.amount)}</span>
              </div>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-[1fr_280px] md:items-stretch">
              <div className="rounded-lg border border-border bg-white/92 p-5 text-sm font-semibold leading-6 text-ink-muted shadow-line">
                <p className="font-black text-ink">Observações</p>
                <p className="mt-2">
                  Esta fatura registra uma cobrança clínica emitida pela plataforma Nexopsi. Guarde este documento para conferência financeira e organização do atendimento.
                </p>
              </div>
              <div className="rounded-lg bg-primary p-6 text-white shadow-[0_18px_45px_rgba(109,72,229,0.25)]">
                <p className="text-sm font-semibold text-white/75">Total da fatura</p>
                <p className="mt-2 text-4xl font-black">{brl.format(invoice.amount)}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-white/60">{statusLabel[invoice.status]}</p>
              </div>
            </div>

            <footer className="mt-12 border-t border-border pt-5 text-center text-xs font-semibold leading-5 text-ink-muted">
              <p className="font-black text-ink">Nexopsi | Gestão clínica para psicólogos</p>
              <p>Documento gerado eletronicamente. As informações financeiras devem ser conferidas pela clínica antes do envio ao paciente.</p>
              <p>nexopsi.app.br</p>
            </footer>

            <div className="mt-6 flex justify-end gap-3 print:hidden">
              <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
              <Button type="button" onClick={() => window.print()}>Imprimir / salvar PDF</Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ModernPrintableInvoice({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const issuedAt = new Date();
  const dueDate = new Date(invoice.dueDate);

  return (
    <div className="print-sheet fixed inset-0 z-[60] overflow-y-auto bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto min-h-[1120px] max-w-4xl bg-white px-14 py-12 text-[#071B3A] shadow-[0_24px_80px_rgba(15,23,42,0.18)] print:min-h-screen print:shadow-none">
        <header className="grid grid-cols-[1fr_230px] gap-10">
          <div>
            <div className="flex h-28 w-80 items-center overflow-hidden">
              <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={360} height={160} priority className="h-full w-full object-contain object-left" />
            </div>
            <p className="mt-2 pl-28 text-sm font-semibold text-slate-500">Plataforma para Psicologos</p>
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Fatura</h1>
            <p className="mt-2 text-lg text-slate-600"># {invoice.id}</p>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Data de emissao</p>
            <p className="mt-2 text-xl">{issuedAt.toLocaleDateString("pt-BR")}</p>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Vencimento</p>
            <p className="mt-2 text-xl">{dueDate.toLocaleDateString("pt-BR")}</p>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Status</p>
            <span className="mt-2 inline-flex rounded-full bg-[#FFD94D] px-5 py-2 text-sm font-black uppercase">{statusLabel[invoice.status]}</span>
          </div>
        </header>

        <div className="my-12 h-px bg-slate-200" />

        <section className="grid grid-cols-[0.9fr_1.1fr] gap-10">
          <div className="border-r border-slate-200 pr-10">
            <p className="text-sm font-black uppercase tracking-[0.18em]">Cliente</p>
            <h2 className="mt-8 text-3xl font-black">{invoice.patient}</h2>
            <div className="mt-8 space-y-5 text-lg">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">CPF</p><p>{invoice.patientCpf || "Nao informado"}</p></div>
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">E-mail</p><p>{invoice.patientEmail || "Nao informado"}</p></div>
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Telefone</p><p>{invoice.patientPhone || "Nao informado"}</p></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em]">Pagamento</p>
            <div className="mt-8 grid grid-cols-[1fr_220px] gap-8">
              <div className="space-y-6 text-lg">
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Metodo</p><p className="uppercase">{invoice.method}</p></div>
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Parcelas</p><p>{invoice.installments || "1x"}</p></div>
                <div><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Chave Pix</p><p>4407726425982</p></div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.12em]">QR Code Pix</p>
                <div className="grid aspect-square place-items-center bg-[repeating-linear-gradient(45deg,#111_0_4px,#fff_4px_8px)] text-[10px] font-black text-white">PIX</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1fr_170px_190px_190px] bg-[#071B3A] px-6 py-5 text-sm font-black uppercase tracking-[0.12em] text-white">
            <span>Itens da cobranca</span><span className="text-center">Quantidade</span><span className="text-center">Valor unitario</span><span className="text-right">Valor total</span>
          </div>
          <div className="grid grid-cols-[1fr_170px_190px_190px] px-6 py-8 text-lg">
            <span>{invoice.description}</span><span className="text-center">1</span><span className="text-center">{brl.format(invoice.amount)}</span><span className="text-right">{brl.format(invoice.amount)}</span>
          </div>
        </section>

        <section className="mt-10 grid grid-cols-[1fr_390px] gap-10">
          <div className="pt-28">
            <p className="text-sm font-black uppercase tracking-[0.18em]">Observacoes</p>
            <p className="mt-6 text-lg leading-8 text-slate-700">Obrigado pela confianca.<br />Esta cobranca foi emitida automaticamente pela plataforma Nexopsi.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-7 text-lg">
            <div className="space-y-4">
              <p className="flex justify-between"><span>Subtotal</span><span>{brl.format(invoice.amount)}</span></p>
              <p className="flex justify-between"><span>Desconto</span><span>{brl.format(0)}</span></p>
              <p className="flex justify-between"><span>Taxas</span><span>{brl.format(0)}</span></p>
            </div>
            <div className="mt-7 border-t border-slate-200 pt-7">
              <p className="flex items-end justify-between font-black"><span className="text-xl uppercase">Total</span><span className="text-4xl">{brl.format(invoice.amount)}</span></p>
            </div>
          </div>
        </section>

        <footer className="mt-14 grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-8 border-t border-slate-200 pt-8 text-sm">
          <div><p className="font-black uppercase tracking-[0.14em]">Documento financeiro</p><p className="mt-2 text-slate-600">Emitido automaticamente pela Nexopsi.</p><p className="mt-1 font-bold">www.nexopsi.com</p></div>
          <div className="border-l border-slate-200 pl-8"><p className="font-black uppercase tracking-[0.14em]">Codigo da fatura</p><p className="mt-2 text-slate-600">{invoice.id}</p></div>
          <div className="border-l border-slate-200 pl-8"><p className="font-black uppercase tracking-[0.14em]">Emitido em</p><p className="mt-2 text-slate-600">{issuedAt.toLocaleDateString("pt-BR")} as {issuedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p></div>
        </footer>

        <div className="mt-6 flex justify-end gap-3 print:hidden">
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          <Button type="button" onClick={() => window.print()}>Imprimir / salvar PDF</Button>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, helper, icon, tone }: { title: string; value: string; helper: string; icon: React.ReactNode; tone: "primary" | "success" | "warning" | "danger" }) {
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
          <p className="mt-1 text-xs font-semibold text-ink-muted">{helper}</p>
        </div>
        <div className={`rounded-md p-3 ${color}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-sm font-semibold text-ink-muted">{title}</p>
      <p className="mt-2 text-xl font-black text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold text-ink-muted">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function normalizePhoneForWhatsApp(value?: string) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  if (digits.startsWith("55") || digits.startsWith("44")) return digits;
  return `55${digits}`;
}

function buildInvoiceMessage(invoice: Invoice, channel: "whatsapp" | "email") {
  const dueDate = new Date(invoice.dueDate).toLocaleDateString("pt-BR");
  const pdfNote =
    channel === "whatsapp"
      ? "Estou encaminhando a fatura em PDF nesta conversa para conferencia."
      : "Estou encaminhando a fatura em PDF em anexo para conferencia.";

  return [
    `Ola, ${invoice.patient}.`,
    pdfNote,
    "",
    `Descricao: ${invoice.description}`,
    `Valor: ${brl.format(invoice.amount)}`,
    `Vencimento: ${dueDate}`,
    `Forma de pagamento: ${invoice.method}`,
    "",
    "Qualquer duvida, fico a disposicao."
  ].join("\n");
}

type DatabasePrice = {
  id: string;
  name: string;
  duration: string | null;
  value: number | string;
  recurrence: string | null;
  active: boolean;
};

type DatabaseInvoice = {
  id: string;
  patient_id: string | null;
  patient_name: string;
  patient_cpf: string | null;
  patient_phone: string | null;
  patient_email: string | null;
  description: string;
  due_date: string;
  amount: number | string;
  status: InvoiceStatus;
  method: string;
  kind: InvoiceKind;
  installments: string | null;
};

function mapDatabasePrice(price: DatabasePrice): ServicePrice {
  return {
    id: price.id,
    name: price.name,
    duration: price.duration ?? "50 min",
    value: Number(price.value ?? 0),
    recurrence: price.recurrence ?? "Por sessao",
    active: price.active
  };
}

function mapPriceToDatabase(price: ServicePrice, organizationId: string) {
  const payload: Record<string, string | number | boolean> = {
    organization_id: organizationId,
    name: price.name,
    duration: price.duration,
    value: price.value,
    recurrence: price.recurrence,
    active: price.active
  };
  if (isUuid(price.id)) payload.id = price.id;
  return payload;
}

function mapDatabaseInvoice(invoice: DatabaseInvoice): Invoice {
  return {
    id: invoice.id,
    patientId: invoice.patient_id ?? undefined,
    patient: invoice.patient_name,
    patientCpf: invoice.patient_cpf ?? "",
    patientPhone: invoice.patient_phone ?? "",
    patientEmail: invoice.patient_email ?? "",
    description: invoice.description,
    dueDate: invoice.due_date,
    amount: Number(invoice.amount ?? 0),
    status: invoice.status,
    method: invoice.method,
    kind: invoice.kind,
    installments: invoice.installments ?? ""
  };
}

function mapInvoiceToDatabase(invoice: Invoice, organizationId: string) {
  return {
    id: invoice.id,
    organization_id: organizationId,
    patient_id: invoice.patientId && isUuid(invoice.patientId) ? invoice.patientId : null,
    patient_name: invoice.patient,
    patient_cpf: invoice.patientCpf || null,
    patient_phone: invoice.patientPhone || null,
    patient_email: invoice.patientEmail || null,
    description: invoice.description,
    due_date: invoice.dueDate,
    amount: invoice.amount,
    status: invoice.status,
    method: invoice.method,
    kind: invoice.kind,
    installments: invoice.installments || null
  };
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
