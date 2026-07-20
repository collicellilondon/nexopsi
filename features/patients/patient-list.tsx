"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, CalendarClock, Filter, MoreHorizontal, Search, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/states";
import { brl } from "@/lib/utils";
import type { Patient, PatientStatus } from "@/lib/types";

const statusLabel: Record<PatientStatus, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  alta: "Alta",
  triagem: "Triagem"
};

const statusVariant: Record<PatientStatus, "success" | "muted" | "secondary" | "warning"> = {
  ativo: "success",
  pausado: "muted",
  alta: "secondary",
  triagem: "warning"
};

type PatientListProps = {
  patients: Patient[];
  searchQuery?: string;
  onNotify: (message: string) => void;
};

export function PatientList({ patients, searchQuery = "", onNotify }: PatientListProps) {
  const [items, setItems] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PatientStatus | "todos">("todos");
  const [showOnlyDebt, setShowOnlyDebt] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const allPatients = useMemo(() => [...patients, ...items], [patients, items]);

  const filteredPatients = useMemo(() => {
    return allPatients
      .filter((patient) => {
        const matchesQuery = [patient.name, patient.email, patient.phone, patient.therapist, patient.address, patient.cpf, ...patient.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === "todos" || patient.status === status;
        const matchesDebt = !showOnlyDebt || patient.pendingBalance > 0;
        return matchesQuery && matchesStatus && matchesDebt;
      })
      .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [allPatients, query, status, showOnlyDebt, sortAsc]);

  function cycleStatus(patientId: string) {
    const order: PatientStatus[] = ["triagem", "ativo", "pausado", "alta"];
    setItems((current) =>
      current.map((patient) => {
        if (patient.id !== patientId) return patient;
        const next = order[(order.indexOf(patient.status) + 1) % order.length];
        onNotify(`${patient.name} movido para ${statusLabel[next]}.`);
        return { ...patient, status: next };
      })
    );
  }

  function payBalance(patientId: string) {
    setItems((current) =>
      current.map((patient) => {
        if (patient.id !== patientId) return patient;
        onNotify(patient.pendingBalance > 0 ? `Saldo de ${patient.name} baixado como pago.` : `${patient.name} não possui saldo pendente.`);
        return { ...patient, pendingBalance: 0 };
      })
    );
  }

  function clearFilters() {
    setQuery("");
    setStatus("todos");
    setShowOnlyDebt(false);
    onNotify("Filtros de pacientes limpos.");
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Buscar por nome, CPF, endereço, telefone ou profissional" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["todos", "ativo", "triagem", "pausado"] as const).map((item) => (
              <Button key={item} type="button" variant={status === item ? "default" : "outline"} size="sm" onClick={() => setStatus(item)}>
                {item === "todos" ? "Todos" : statusLabel[item]}
              </Button>
            ))}
            <Button type="button" variant={showOnlyDebt ? "default" : "outline"} size="sm" onClick={() => setShowOnlyDebt((value) => !value)}>
              <Filter className="h-4 w-4" />
              Com saldo
            </Button>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="Nenhum paciente encontrado" description="Revise a busca ou cadastre um novo paciente para iniciar a jornada clínica." />
            <div className="mt-3 flex justify-center">
              <Button type="button" variant="outline" onClick={clearFilters}>Limpar filtros</Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg border border-border">
            <div className="hidden grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_0.7fr_130px] gap-4 bg-background px-4 py-3 text-xs font-black uppercase tracking-wide text-ink-muted lg:grid">
              <button type="button" className="flex items-center gap-2 text-left" onClick={() => setSortAsc((value) => !value)}>
                Paciente <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
              <span>Contato e endereço</span>
              <span>Próxima sessão</span>
              <span>Status</span>
              <span>Saldo</span>
              <span>Ações</span>
            </div>
            <div className="divide-y divide-border bg-white">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.8fr_0.7fr_130px] lg:items-center">
                  <button type="button" onClick={() => onNotify(`Ficha de ${patient.name}: ${patient.mainComplaint ?? "sem queixa principal cadastrada"}.`)} className="text-left">
                    <p className="font-black text-ink">{patient.name}</p>
                    <p className="mt-1 text-sm text-ink-muted">{patient.age} anos • CPF {patient.cpf ?? "não informado"}</p>
                    <p className="text-sm text-ink-muted">{patient.email}</p>
                  </button>
                  <div className="text-sm text-ink-muted">
                    <p className="font-semibold text-ink">{patient.phone}</p>
                    <p>{patient.address ?? "Endereço não informado"}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    {patient.nextSession}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusVariant[patient.status]}>{statusLabel[patient.status]}</Badge>
                    {patient.tags.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                  <button type="button" onClick={() => payBalance(patient.id)} className="flex items-center gap-2 text-left text-sm font-bold text-ink hover:text-primary">
                    <WalletCards className="h-4 w-4 text-secondary" />
                    {brl.format(patient.pendingBalance)}
                  </button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => cycleStatus(patient.id)}>Status</Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Ações de ${patient.name}`} onClick={() => onNotify(`Ficha completa aberta para ${patient.name}.`)}>
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
