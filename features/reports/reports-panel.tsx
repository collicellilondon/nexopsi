"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/lib/types";

const attendanceData = [
  { name: "Confirmadas", value: 42, color: "#245B68" },
  { name: "Realizadas", value: 36, color: "#2F7D63" },
  { name: "Faltas", value: 4, color: "#B42318" },
  { name: "Pendentes", value: 8, color: "#B7791F" }
];

const monthlyData = [
  { month: "Mar", sessoes: 88, novos: 12 },
  { month: "Abr", sessoes: 94, novos: 9 },
  { month: "Mai", sessoes: 101, novos: 15 },
  { month: "Jun", sessoes: 96, novos: 11 },
  { month: "Jul", sessoes: 112, novos: 18 }
];

export function ReportsPanel({ patients, onNotify }: { patients: Patient[]; onNotify: (message: string) => void }) {
  const featuredPatient = patients[0];

  function printReport(kind: string) {
    onNotify(`${kind} preparado para impressão em PDF.`);
    setTimeout(() => window.print(), 120);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumo mensal</CardTitle>
            <CardDescription>Sessões realizadas e entrada de novos pacientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessoes" name="Sessões" fill="#245B68" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="novos" name="Novos pacientes" fill="#5F9E8C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de agendamentos</CardTitle>
            <CardDescription>Distribuição dos atendimentos do mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                    {attendanceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {attendanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documentos para PDF</CardTitle>
          <CardDescription>Imprima prontuários e resumos em uma folha com cabeçalho e marca d&apos;água.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Prontuário completo", "Resumo clínico", "Relatório financeiro", "Histórico de presença"].map((item) => (
            <Button key={item} type="button" variant="outline" className="justify-start" onClick={() => printReport(item)}>
              {item.includes("Prontuário") ? <Printer className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
              {item}
            </Button>
          ))}
        </CardContent>
      </Card>

      <section className="print-sheet rounded-lg border border-border bg-white p-8 shadow-soft">
        <div className="watermark">Nexopsi</div>
        <header className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Nexopsi</p>
            <h3 className="mt-2 text-2xl font-black text-ink">Prontuário e resumo do paciente</h3>
            <p className="text-sm text-ink-muted">Documento demonstrativo para impressão em PDF.</p>
          </div>
          <div className="text-right text-sm text-ink-muted">
            <p>Tatiane Bonfin</p>
            <p>Psicóloga responsável</p>
            <p>Emitido em 16/07/2026</p>
          </div>
        </header>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Info title="Paciente" value={featuredPatient?.name ?? "Marina Duarte"} />
          <Info title="Contato" value={featuredPatient?.phone ?? "(11) 99842-1022"} />
          <Info title="E-mail" value={featuredPatient?.email ?? "paciente@email.com"} />
          <Info title="Endereço" value={featuredPatient?.address ?? "Endereço cadastral completo"} />
          <Info title="Queixa principal" value={featuredPatient?.mainComplaint ?? "Acompanhamento terapêutico contínuo com foco em organização emocional."} />
          <Info title="Última evolução" value="Paciente compareceu à sessão, manteve boa adesão e recebeu tarefa terapêutica para a próxima semana." />
        </div>
      </section>
    </div>
  );
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-xs font-black uppercase text-ink-muted">{title}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
