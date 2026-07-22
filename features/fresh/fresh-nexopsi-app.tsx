"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, CreditCard, LogOut, Plus, Save, Settings, UserRound, UsersRound } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { brl } from "@/lib/utils";

type View = "perfil" | "pacientes" | "agenda" | "financeiro" | "configuracoes";

type Profile = {
  name: string;
  register: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  photoUrl: string;
};

type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  notes: string;
};

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  startsAt: string;
  status: string;
  mode: string;
};

type Invoice = {
  id: string;
  patientId: string;
  patientName: string;
  description: string;
  dueDate: string;
  amount: number;
  status: string;
};

const emptyProfile: Profile = {
  name: "",
  register: "",
  email: "",
  phone: "",
  specialty: "Psicologia clinica",
  bio: "",
  photoUrl: ""
};

export function FreshNexopsiApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Carregando Nexopsi...");
  const [view, setView] = useState<View>("perfil");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session) {
        void loadData(data.session);
      } else {
        setMessage("Entre para acessar o portal Nexopsi.");
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession);
      if (nextSession) void loadData(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function loadData(activeSession: Session) {
    const supabase = createBrowserSupabaseClient();
    const userId = activeSession.user.id;
    setMessage("Carregando dados salvos no Supabase...");

    const profileResult = await fetchProfile(activeSession.access_token);
    if (profileResult.ok) {
      setProfile(profileResult.profile);
    } else {
      setMessage(profileResult.message);
    }

    const [patientResult, appointmentResult, invoiceResult] = await Promise.all([
      supabase
        .from("patients")
        .select("id, full_name, email, phone, cpf, address, notes")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("appointments")
        .select("id, patient_id, starts_at, status, mode")
        .eq("user_id", userId)
        .order("starts_at", { ascending: true }),
      supabase
        .from("invoices")
        .select("id, patient_id, patient_name, description, due_date, amount, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ]);

    if (!patientResult.error) {
      setPatients((patientResult.data ?? []).map(mapPatient));
    } else {
      setMessage(`Pacientes nao carregaram: ${patientResult.error.message}`);
    }

    if (!appointmentResult.error) {
      setAppointments(((appointmentResult.data ?? []) as Record<string, unknown>[]).map((item) => mapAppointment(item, patients)));
    }

    if (!invoiceResult.error) {
      setInvoices((invoiceResult.data ?? []).map(mapInvoice));
    } else if (!patientResult.error) {
      setMessage(`Faturas nao carregaram: ${invoiceResult.error.message}`);
    }

    if (!profileResult.ok || patientResult.error || invoiceResult.error) return;
    setMessage("Portal pronto. Dados conectados ao Supabase por usuario.");
  }

  if (loading) {
    return <CenteredMessage title="Nexopsi" message="Preparando o portal..." />;
  }

  if (!session) {
    return <FreshLogin onMessage={setMessage} message={message} />;
  }

  const userId = session.user.id;
  const patientOptions = patients.length > 0 ? patients : [{ id: "", name: "Paciente a definir", email: "", phone: "", cpf: "", address: "", notes: "" }];

  return (
    <main className="min-h-screen bg-[#FBFAFF] text-[#15112A]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#ECE7FF] bg-[#15112A] p-5 text-white lg:block">
        <div className="flex h-20 items-center rounded-md bg-white p-2">
          <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={240} height={100} className="h-full w-full object-contain" priority />
        </div>
        <nav className="mt-8 space-y-2">
          <NavButton active={view === "perfil"} icon={<UserRound className="h-4 w-4" />} label="Perfil" onClick={() => setView("perfil")} />
          <NavButton active={view === "pacientes"} icon={<UsersRound className="h-4 w-4" />} label="Pacientes" onClick={() => setView("pacientes")} />
          <NavButton active={view === "agenda"} icon={<CalendarDays className="h-4 w-4" />} label="Agenda" onClick={() => setView("agenda")} />
          <NavButton active={view === "financeiro"} icon={<CreditCard className="h-4 w-4" />} label="Financeiro" onClick={() => setView("financeiro")} />
          <NavButton active={view === "configuracoes"} icon={<Settings className="h-4 w-4" />} label="Configuracoes" onClick={() => setView("configuracoes")} />
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#ECE7FF] bg-white/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6D48E5]">Nexopsi</p>
              <h1 className="text-2xl font-black">{profile.name || "Portal da clinica"}</h1>
              <p className="text-sm font-semibold text-slate-500">{message}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <MobileTabs view={view} onView={setView} />
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-5 lg:p-8">
          <Stats patients={patients.length} appointments={appointments.length} invoices={invoices} />

          {view === "perfil" ? <ProfilePanel profile={profile} setProfile={setProfile} onSave={() => saveProfile(session.access_token, profile)} /> : null}
          {view === "pacientes" ? <PatientsPanel patients={patients} onCreate={createPatient} /> : null}
          {view === "agenda" ? <AgendaPanel patients={patientOptions} appointments={appointments} onCreate={createAppointment} /> : null}
          {view === "financeiro" ? <FinancePanel patients={patientOptions} invoices={invoices} onCreate={createInvoice} /> : null}
          {view === "configuracoes" ? <SettingsPanel onMessage={setMessage} /> : null}
        </div>
      </section>
    </main>
  );

  async function saveProfile(accessToken: string, nextProfile: Profile) {
    const result = await postProfile(accessToken, nextProfile);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setProfile(result.profile);
    setMessage(`Cadastro profissional salvo para ${result.profile.name || "profissional"}.`);
  }

  async function createPatient(formData: FormData) {
    const supabase = createBrowserSupabaseClient();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setMessage("Informe o nome do paciente.");
      return;
    }
    const payload = {
      user_id: userId,
      full_name: name,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      cpf: String(formData.get("cpf") ?? "").trim() || null,
      address: String(formData.get("address") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null
    };
    const { data, error } = await supabase.from("patients").insert(payload).select("id, full_name, email, phone, cpf, address, notes").single();
    if (error) {
      setMessage(`Nao foi possivel salvar paciente: ${error.message}`);
      return;
    }
    setPatients((current) => [mapPatient(data), ...current]);
    setMessage(`Paciente ${name} salvo no Supabase.`);
  }

  async function createAppointment(formData: FormData) {
    const supabase = createBrowserSupabaseClient();
    const patientId = String(formData.get("patientId") ?? "");
    const patient = patients.find((item) => item.id === patientId);
    const payload = {
      user_id: userId,
      patient_id: patientId || null,
      starts_at: String(formData.get("startsAt") ?? new Date().toISOString()),
      ends_at: String(formData.get("startsAt") ?? new Date().toISOString()),
      status: String(formData.get("status") ?? "scheduled"),
      mode: String(formData.get("mode") ?? "in_person"),
      type: "Terapia individual",
      room: String(formData.get("room") ?? "Sala 1")
    };
    const { data, error } = await supabase.from("appointments").insert(payload).select("id, patient_id, starts_at, status, mode").single();
    if (error) {
      setMessage(`Nao foi possivel salvar sessao: ${error.message}`);
      return;
    }
    setAppointments((current) => [mapAppointment(data, patient ? [patient] : patients), ...current]);
    setMessage("Sessao salva no Supabase.");
  }

  async function createInvoice(formData: FormData) {
    const supabase = createBrowserSupabaseClient();
    const patientId = String(formData.get("patientId") ?? "");
    const patient = patients.find((item) => item.id === patientId);
    const amount = Number(formData.get("amount") ?? 0);
    const payload = {
      user_id: userId,
      patient_id: patientId || null,
      patient_name: patient?.name || String(formData.get("patientName") ?? "Paciente"),
      description: String(formData.get("description") ?? "Sessao individual"),
      due_date: String(formData.get("dueDate") ?? new Date().toISOString().slice(0, 10)),
      amount,
      status: "pendente",
      method: "Pix",
      kind: "sessao"
    };
    const { data, error } = await supabase.from("invoices").insert(payload).select("id, patient_id, patient_name, description, due_date, amount, status").single();
    if (error) {
      setMessage(`Nao foi possivel salvar fatura: ${error.message}`);
      return;
    }
    setInvoices((current) => [mapInvoice(data), ...current]);
    setMessage(`Fatura de ${brl.format(amount)} salva.`);
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setSession(null);
    setMessage("Sessao encerrada.");
  }
}

function FreshLogin({ message, onMessage }: { message: string; onMessage: (value: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      onMessage(`Nao foi possivel entrar: ${error.message}`);
      return;
    }
    onMessage("Acesso confirmado. Carregando dados...");
  }

  return (
    <main className="grid min-h-screen bg-[#FBFAFF] lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden bg-[#15112A] p-12 text-white lg:block">
        <div className="auth-flow-lines" />
        <div className="auth-flow-grid" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex h-24 w-80 items-center rounded-md bg-white p-3">
            <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={300} height={130} className="h-full w-full object-contain" priority />
          </div>
          <h1 className="mt-12 text-5xl font-black leading-tight">Portal clinico reconstruido do zero.</h1>
          <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-white/70">
            Perfil, pacientes, agenda e financeiro em uma tela limpa, conectada diretamente ao Supabase por usuario.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex h-24 w-72 items-center rounded-md bg-white p-2 shadow-sm lg:hidden">
            <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={300} height={130} className="h-full w-full object-contain" priority />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#6D48E5]">Acesso Nexopsi</p>
          <h2 className="mt-2 text-4xl font-black text-[#15112A]">Entrar no portal</h2>
          <p className="mt-3 rounded-md border border-[#ECE7FF] bg-white p-3 text-sm font-semibold text-slate-600">{message}</p>
          <div className="mt-6 space-y-4">
            <Field label="E-mail"><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></Field>
            <Field label="Senha"><Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" /></Field>
            <Button className="h-12 w-full" disabled={busy} onClick={login}>{busy ? "Entrando..." : "Entrar e carregar portal"}</Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfilePanel({ profile, setProfile, onSave }: { profile: Profile; setProfile: (profile: Profile) => void; onSave: () => void }) {
  return (
    <Panel title="Cadastro profissional" description="Dados usados no cabecalho, documentos e rotina da plataforma.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nome profissional"><Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></Field>
        <Field label="Registro profissional"><Input value={profile.register} onChange={(event) => setProfile({ ...profile, register: event.target.value })} /></Field>
        <Field label="E-mail"><Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></Field>
        <Field label="Telefone"><Input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></Field>
        <Field label="Especialidade"><Input value={profile.specialty} onChange={(event) => setProfile({ ...profile, specialty: event.target.value })} /></Field>
        <Field label="Foto URL"><Input value={profile.photoUrl} onChange={(event) => setProfile({ ...profile, photoUrl: event.target.value })} /></Field>
        <label className="block text-sm font-bold text-[#15112A] lg:col-span-2">
          Bio profissional
          <textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} className="mt-2 min-h-28 w-full rounded-md border border-[#E4E0F5] bg-white p-3 text-sm outline-none focus:border-[#6D48E5]" />
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={onSave}><Save className="h-4 w-4" />Salvar cadastro profissional</Button>
      </div>
    </Panel>
  );
}

function PatientsPanel({ patients, onCreate }: { patients: Patient[]; onCreate: (formData: FormData) => void }) {
  return (
    <Panel title="Pacientes" description="Cadastro simples e direto no Supabase.">
      <form action={onCreate} className="grid gap-3 rounded-md border border-[#ECE7FF] bg-[#FBFAFF] p-4 lg:grid-cols-3">
        <Input name="name" placeholder="Nome completo" />
        <Input name="email" placeholder="E-mail" />
        <Input name="phone" placeholder="Telefone" />
        <Input name="cpf" placeholder="CPF" />
        <Input name="address" placeholder="Endereco" />
        <Input name="notes" placeholder="Observacoes" />
        <Button className="lg:col-span-3"><Plus className="h-4 w-4" />Salvar paciente</Button>
      </form>
      <List empty="Nenhum paciente cadastrado.">
        {patients.map((patient) => (
          <ListRow key={patient.id} title={patient.name} detail={`${patient.phone || "Sem telefone"} | ${patient.email || "Sem e-mail"}`} />
        ))}
      </List>
    </Panel>
  );
}

function AgendaPanel({ patients, appointments, onCreate }: { patients: Patient[]; appointments: Appointment[]; onCreate: (formData: FormData) => void }) {
  return (
    <Panel title="Agenda" description="Crie sessoes vinculadas aos pacientes cadastrados.">
      <form action={onCreate} className="grid gap-3 rounded-md border border-[#ECE7FF] bg-[#FBFAFF] p-4 lg:grid-cols-4">
        <Select name="patientId" options={patients.map((patient) => [patient.id, patient.name])} />
        <Input name="startsAt" type="datetime-local" />
        <Select name="status" options={[["scheduled", "Pendente"], ["confirmed", "Confirmada"], ["completed", "Realizada"]]} />
        <Select name="mode" options={[["in_person", "Presencial"], ["online", "Online"]]} />
        <Input name="room" placeholder="Sala ou link" />
        <Button className="lg:col-span-3"><Plus className="h-4 w-4" />Salvar sessao</Button>
      </form>
      <List empty="Nenhuma sessao cadastrada.">
        {appointments.map((item) => <ListRow key={item.id} title={item.patientName} detail={`${new Date(item.startsAt).toLocaleString("pt-BR")} | ${item.status} | ${item.mode}`} />)}
      </List>
    </Panel>
  );
}

function FinancePanel({ patients, invoices, onCreate }: { patients: Patient[]; invoices: Invoice[]; onCreate: (formData: FormData) => void }) {
  const total = useMemo(() => invoices.reduce((sum, invoice) => sum + invoice.amount, 0), [invoices]);
  return (
    <Panel title="Financeiro" description={`Total registrado: ${brl.format(total)}`}>
      <form action={onCreate} className="grid gap-3 rounded-md border border-[#ECE7FF] bg-[#FBFAFF] p-4 lg:grid-cols-4">
        <Select name="patientId" options={patients.map((patient) => [patient.id, patient.name])} />
        <Input name="description" placeholder="Descricao" defaultValue="Sessao individual" />
        <Input name="amount" type="number" placeholder="Valor" />
        <Input name="dueDate" type="date" />
        <Button className="lg:col-span-4"><Plus className="h-4 w-4" />Salvar fatura</Button>
      </form>
      <List empty="Nenhuma fatura cadastrada.">
        {invoices.map((invoice) => <ListRow key={invoice.id} title={`${invoice.patientName} - ${brl.format(invoice.amount)}`} detail={`${invoice.description} | vencimento ${invoice.dueDate} | ${invoice.status}`} />)}
      </List>
    </Panel>
  );
}

function SettingsPanel({ onMessage }: { onMessage: (message: string) => void }) {
  return (
    <Panel title="Configuracoes" description="Temas e ajustes visuais locais.">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["#6D48E5", "#8B6FF1", "Nexopsi lilas"],
          ["#245B68", "#5F9E8C", "Clinico verde"],
          ["#15112A", "#6D48E5", "Premium escuro"]
        ].map(([primary, secondary, label]) => (
          <button
            key={label}
            className="rounded-md border border-[#ECE7FF] bg-white p-4 text-left font-black shadow-sm"
            type="button"
            onClick={() => {
              document.documentElement.style.setProperty("--theme-primary", primary);
              document.documentElement.style.setProperty("--theme-secondary", secondary);
              onMessage(`Tema aplicado: ${label}.`);
            }}
          >
            <span className="flex gap-2">
              <span className="h-8 flex-1 rounded-sm" style={{ background: primary }} />
              <span className="h-8 flex-1 rounded-sm" style={{ background: secondary }} />
            </span>
            <span className="mt-3 block">{label}</span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function Stats({ patients, appointments, invoices }: { patients: number; appointments: number; invoices: Invoice[] }) {
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Stat label="Pacientes" value={String(patients)} />
      <Stat label="Sessoes" value={String(appointments)} />
      <Stat label="Faturas" value={brl.format(total)} />
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#ECE7FF] bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-[#15112A]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function List({ empty, children }: { empty: string; children: React.ReactNode }) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0;
  return <div className="mt-5 space-y-3">{count ? children : <div className="rounded-md border border-[#ECE7FF] p-4 text-sm font-semibold text-slate-500">{empty}</div>}</div>;
}

function ListRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-[#ECE7FF] bg-white p-4">
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{detail}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ECE7FF] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-black ${active ? "bg-white text-[#6D48E5]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
      {icon}
      {label}
    </button>
  );
}

function MobileTabs({ view, onView }: { view: View; onView: (view: View) => void }) {
  return (
    <select value={view} onChange={(event) => onView(event.target.value as View)} className="h-10 rounded-md border border-[#ECE7FF] bg-white px-3 text-sm font-bold lg:hidden">
      <option value="perfil">Perfil</option>
      <option value="pacientes">Pacientes</option>
      <option value="agenda">Agenda</option>
      <option value="financeiro">Financeiro</option>
      <option value="configuracoes">Configuracoes</option>
    </select>
  );
}

function Select({ name, options }: { name: string; options: string[][] }) {
  return (
    <select name={name} className="h-10 rounded-md border border-[#E4E0F5] bg-white px-3 text-sm font-semibold outline-none focus:border-[#6D48E5]">
      {options.map(([value, label]) => <option key={`${name}-${value}-${label}`} value={value}>{label}</option>)}
    </select>
  );
}

function CenteredMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#FBFAFF] p-6 text-center">
      <div>
        <h1 className="text-4xl font-black text-[#15112A]">{title}</h1>
        <p className="mt-3 font-semibold text-slate-500">{message}</p>
      </div>
    </main>
  );
}

async function fetchProfile(accessToken: string) {
  try {
    const response = await fetch("/api/professional-profile", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const payload = await response.json();
    if (!response.ok) return { ok: false as const, message: readApiError(payload), profile: emptyProfile };
    return { ok: true as const, message: "", profile: normalizeProfile(payload.profile) };
  } catch {
    return { ok: false as const, message: "Nao foi possivel carregar o perfil profissional.", profile: emptyProfile };
  }
}

async function postProfile(accessToken: string, profile: Profile) {
  try {
    const response = await fetch("/api/professional-profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    const payload = await response.json();
    if (!response.ok) return { ok: false as const, message: readApiError(payload), profile };
    return { ok: true as const, message: "", profile: normalizeProfile(payload.profile) };
  } catch {
    return { ok: false as const, message: "Nao foi possivel salvar o perfil profissional.", profile };
  }
}

function normalizeProfile(value: unknown): Profile {
  if (!value || typeof value !== "object") return emptyProfile;
  const item = value as Partial<Profile>;
  return {
    name: item.name ?? "",
    register: item.register ?? "",
    email: item.email ?? "",
    phone: item.phone ?? "",
    specialty: item.specialty ?? "Psicologia clinica",
    bio: item.bio ?? "",
    photoUrl: item.photoUrl ?? ""
  };
}

function mapPatient(value: Record<string, unknown>): Patient {
  return {
    id: String(value.id ?? ""),
    name: String(value.full_name ?? ""),
    email: String(value.email ?? ""),
    phone: String(value.phone ?? ""),
    cpf: String(value.cpf ?? ""),
    address: String(value.address ?? ""),
    notes: String(value.notes ?? "")
  };
}

function mapAppointment(value: Record<string, unknown>, patients: Patient[]): Appointment {
  const patientId = String(value.patient_id ?? "");
  const patient = patients.find((item) => item.id === patientId);
  return {
    id: String(value.id ?? ""),
    patientId,
    patientName: patient?.name || "Paciente",
    startsAt: String(value.starts_at ?? new Date().toISOString()),
    status: String(value.status ?? "scheduled"),
    mode: String(value.mode ?? "in_person")
  };
}

function mapInvoice(value: Record<string, unknown>): Invoice {
  return {
    id: String(value.id ?? ""),
    patientId: String(value.patient_id ?? ""),
    patientName: String(value.patient_name ?? "Paciente"),
    description: String(value.description ?? "Sessao"),
    dueDate: String(value.due_date ?? ""),
    amount: Number(value.amount ?? 0),
    status: String(value.status ?? "pendente")
  };
}

function readApiError(value: unknown) {
  if (!value || typeof value !== "object") return "Erro inesperado do servidor.";
  const error = (value as { error?: unknown }).error;
  return typeof error === "string" && error.trim() ? error : "Erro inesperado do servidor.";
}
