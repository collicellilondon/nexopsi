"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AppView = "inicio" | "agenda" | "pacientes" | "sessoes" | "financeiro" | "documentos" | "relatorios" | "configuracoes";
export type SearchSuggestion = {
  id: string;
  label: string;
  description: string;
  searchText: string;
};

const navItems: Array<{ label: string; view: AppView; icon: typeof Home }> = [
  { label: "Início", view: "inicio", icon: Home },
  { label: "Agenda", view: "agenda", icon: CalendarDays },
  { label: "Pacientes", view: "pacientes", icon: Users },
  { label: "Sessões", view: "sessoes", icon: Stethoscope },
  { label: "Financeiro", view: "financeiro", icon: WalletCards },
  { label: "Documentos", view: "documentos", icon: FileText },
  { label: "Relatórios", view: "relatorios", icon: BarChart3 },
  { label: "Configurações", view: "configuracoes", icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  professionalName: string;
  professionalSpecialty: string;
  professionalPhotoUrl?: string;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onGlobalSearch: (query: string) => void;
  searchSuggestions?: SearchSuggestion[];
  onNotify: (message: string) => void;
  onCreatePatient: () => void;
  onCreateSession: () => void;
};

export function AppShell({ children, professionalName, professionalSpecialty, professionalPhotoUrl, activeView, onNavigate, onGlobalSearch, searchSuggestions = [], onNotify, onCreatePatient, onCreateSession }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const displayName = professionalName.trim() || "Cadastro profissional";
  const displaySpecialty = professionalSpecialty.trim() || "Configure seu perfil";
  const initials = getInitials(displayName);
  const visibleSuggestions = useMemo(() => {
    const value = normalizeSearch(query);
    if (value.length < 2) return [];
    return searchSuggestions
      .filter((suggestion) => normalizeSearch(`${suggestion.label} ${suggestion.description} ${suggestion.searchText}`).includes(value))
      .slice(0, 6);
  }, [query, searchSuggestions]);

  function goTo(view: AppView, label: string) {
    onNavigate(view);
    onNotify(`Abrindo ${label.toLowerCase()}.`);
    setMobileOpen(false);
  }

  function runSearch() {
    const value = query.trim().toLowerCase();
    if (!value) {
      onNotify("Digite algo para executar a busca global.");
      return;
    }
    onGlobalSearch(query);
  }

  function selectSuggestion(suggestion: SearchSuggestion) {
    setQuery(suggestion.label);
    setSearchFocused(false);
    onGlobalSearch(suggestion.label);
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
            <div className={cn("flex h-16 items-center overflow-hidden rounded-md bg-white", collapsed ? "lg:w-12" : "w-56")}>
              <Image
                src="/brand/nexopsi-logo.png"
                alt="Nexopsi"
                width={260}
                height={130}
                priority
                className={cn("h-16 w-56 object-contain", collapsed && "lg:hidden")}
              />
              <span className={cn("hidden h-12 w-12 items-center justify-center rounded-md bg-primary text-sm font-black text-white", collapsed && "lg:flex")}>
                NX
              </span>
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
              onClick={() => goTo(item.view, item.label)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-ink-muted transition hover:bg-primary-soft hover:text-primary",
                activeView === item.view && "bg-primary text-white hover:bg-primary hover:text-white",
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
          <button type="button" onClick={() => onNotify(`Perfil de ${displayName} selecionado.`)} className={cn("flex w-full items-center gap-3 rounded-md bg-background p-2 text-left", collapsed && "lg:justify-center")}>
            <Avatar>
              {professionalPhotoUrl ? <AvatarImage src={professionalPhotoUrl} alt={`Foto de ${displayName}`} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-bold text-ink">{displayName}</p>
              <p className="truncate text-xs text-ink-muted">{displaySpecialty}</p>
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
            <form className="relative flex max-w-xl flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <Input
                className="pl-9"
                placeholder="Buscar paciente, documento, sessão, função ou pagamento"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 140)}
              />
              <Button type="submit" variant="outline" className="hidden px-4 md:inline-flex">
                Buscar
              </Button>
              {searchFocused && visibleSuggestions.length > 0 ? (
                <div className="absolute left-0 right-24 top-12 z-40 overflow-hidden rounded-lg border border-border bg-white shadow-soft">
                  <div className="border-b border-border bg-background px-3 py-2 text-xs font-black uppercase text-ink-muted">Sugestões de pacientes</div>
                  {visibleSuggestions.map((suggestion) => (
                    <button key={suggestion.id} type="button" className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-primary-soft" onMouseDown={(event) => event.preventDefault()} onClick={() => selectSuggestion(suggestion)}>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-soft text-xs font-black text-primary">{getInitials(suggestion.label)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-ink">{suggestion.label}</span>
                        <span className="block truncate text-xs font-semibold text-ink-muted">{suggestion.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </form>
            <Button type="button" className="hidden sm:inline-flex" onClick={onCreateSession}>
              <Plus className="h-4 w-4" />
              Ação rápida
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Notificações" onClick={() => setShowNotifications((value) => !value)}>
              <Bell className="h-5 w-5" />
            </Button>
            <div className="hidden min-w-0 items-center gap-3 rounded-md border border-border bg-white px-2 py-1.5 sm:flex">
              <div className="min-w-0 text-right">
                <p className="max-w-40 truncate text-sm font-black text-ink">{displayName}</p>
                <p className="max-w-40 truncate text-xs font-semibold text-ink-muted">{displaySpecialty}</p>
              </div>
              <Avatar>
                {professionalPhotoUrl ? <AvatarImage src={professionalPhotoUrl} alt={`Foto de ${displayName}`} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
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
              {["Nenhuma notificação pendente.", "Cadastre pacientes para gerar alertas.", "Agenda pronta para novos horários."].map((item) => (
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

        <main className="px-4 py-6 md:px-6 lg:px-8">
          {children}
          <footer className="mt-10 border-t border-border pt-5 text-center text-xs font-semibold text-ink-muted">
            Criado por <span className="font-black text-primary">ColliDev</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NX";
}
