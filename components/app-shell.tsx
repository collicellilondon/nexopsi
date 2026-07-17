"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronLeft,
  CircleHelp,
  FileText,
  Home,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Stethoscope,
  Users,
  WalletCards
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", icon: Home },
  { label: "Agenda", icon: CalendarDays },
  { label: "Pacientes", icon: Users },
  { label: "Sessões", icon: Stethoscope },
  { label: "Financeiro", icon: WalletCards },
  { label: "Documentos", icon: FileText },
  { label: "Relatórios", icon: BarChart3 },
  { label: "Configurações", icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  onNotify: (message: string) => void;
  onCreatePatient: () => void;
  onCreateSession: () => void;
};

export function AppShell({ children, onNotify, onCreatePatient, onCreateSession }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Início");
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  function goTo(label: string) {
    setActive(label);
    const target =
      label === "Agenda"
          ? "agenda"
        : label === "Pacientes"
          ? "pacientes"
          : label === "Financeiro"
            ? "financeiro"
          : label === "Relatórios"
            ? "relatorios"
            : label === "Configurações"
              ? "configuracoes"
              : "";
    if (target) {
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      onNotify(`Abrindo ${label.toLowerCase()} para teste.`);
    } else if (label === "Início") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onNotify("Você voltou ao início.");
    } else {
      onNotify(`${label} está habilitado em modo demonstração nesta prévia.`);
    }
    setMobileOpen(false);
  }

  function runSearch() {
    const value = query.trim().toLowerCase();
    if (!value) {
      onNotify("Digite algo para executar a busca global.");
      return;
    }
    const target = value.includes("agenda") || value.includes("sess") ? "agenda" : "pacientes";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    onNotify(`Busca global executada por "${query}".`);
  }

  function signOut() {
    document.cookie = "nexopsi_session=; path=/; max-age=0; samesite=lax";
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-white px-3 py-4 shadow-soft transition-transform duration-300 lg:translate-x-0",
          collapsed && "lg:w-20",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2">
          <div className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-black text-white">NX</div>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="text-sm font-black text-ink">Nexopsi</p>
              <p className="text-xs text-ink-muted">Gestão clínica</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => goTo(item.label)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-ink-muted transition hover:bg-primary-soft hover:text-primary",
                active === item.label && "bg-primary text-white hover:bg-primary hover:text-white",
                collapsed && "lg:justify-center lg:px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-2 border-t border-border pt-4">
          <button type="button" onClick={() => onNotify("Central de ajuda aberta em modo demonstração.")} className={cn("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-ink-muted hover:bg-primary-soft", collapsed && "lg:justify-center lg:px-0")}>
            <CircleHelp className="h-5 w-5" />
            <span className={cn(collapsed && "lg:hidden")}>Ajuda</span>
          </button>
          <button type="button" onClick={() => onNotify("Perfil de Ana Ribeiro selecionado.")} className={cn("flex w-full items-center gap-3 rounded-md bg-background p-2 text-left", collapsed && "lg:justify-center")}>
            <Avatar>
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-bold text-ink">Ana Ribeiro</p>
              <p className="truncate text-xs text-ink-muted">Psicóloga clínica</p>
            </div>
          </button>
          <button type="button" onClick={signOut} className={cn("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-semibold text-destructive hover:bg-red-50", collapsed && "lg:justify-center lg:px-0")}>
            <LogOut className="h-5 w-5" />
            <span className={cn(collapsed && "lg:hidden")}>Sair</span>
          </button>
        </div>
      </aside>

      {mobileOpen ? <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

      <div className={cn("transition-all duration-300 lg:pl-72", collapsed && "lg:pl-20")}>
        <header className="sticky top-0 z-20 border-b border-border bg-background/92 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed((value) => !value)} aria-label="Recolher menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                className="pl-9"
                placeholder="Buscar paciente, documento, sessão ou pagamento"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") runSearch();
                }}
              />
            </div>
            <Button type="button" className="hidden sm:inline-flex" onClick={onCreateSession}>
              <Plus className="h-4 w-4" />
              Ação rápida
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Notificações" onClick={() => setShowNotifications((value) => !value)}>
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="hidden sm:flex">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {showNotifications ? (
          <div className={cn("fixed right-4 top-16 z-30 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-border bg-white p-4 shadow-soft", collapsed ? "lg:right-6" : "lg:right-8")}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-ink">Notificações</p>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNotifications(false)}>
                Fechar
              </Button>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {["Pagamento de Caio vence hoje.", "3 evoluções clínicas pendentes.", "Horário de sexta às 10:30 disponível."].map((item) => (
                <button key={item} type="button" onClick={() => onNotify(item)} className="w-full rounded-md bg-background p-3 text-left font-semibold text-ink hover:bg-primary-soft">
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={onCreatePatient}>
                Paciente
              </Button>
              <Button type="button" size="sm" onClick={onCreateSession}>
                Sessão
              </Button>
            </div>
          </div>
        ) : null}

        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
