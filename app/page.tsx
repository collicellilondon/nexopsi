import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappMessage = "Ola, quero contratar a Nexopsi e receber minha chave de ativacao.";
const whatsappUrl = `https://wa.me/4407726425982?text=${encodeURIComponent(whatsappMessage)}`;

const modules = [
  {
    title: "Agenda inteligente",
    description: "Organize sessoes, status, reagendamentos e faltas com leitura rapida do dia.",
    icon: CalendarDays
  },
  {
    title: "Prontuario e documentos",
    description: "Gere relatorios, recibos, termos e PDFs com identidade profissional.",
    icon: FileText
  },
  {
    title: "Financeiro clinico",
    description: "Controle faturas, mensalidades, pagamentos pendentes e inadimplencia.",
    icon: WalletCards
  },
  {
    title: "Cadastro profissional",
    description: "Nome, registro, foto e contato aplicados em cabecalhos e documentos.",
    icon: Stethoscope
  }
];

const outcomes = [
  "Ambiente individual para cada profissional",
  "Login com codigo de ativacao do produto",
  "Pacientes, sessoes e documentos em fluxo unico",
  "Visual moderno para apresentar a clinica com seguranca"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-ink">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#f7f8fa]/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexopsi">
            <span className="flex h-14 w-40 items-center overflow-hidden">
              <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={240} height={120} priority className="h-full w-full object-contain" />
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-bold text-ink-muted md:flex">
            <a href="#recursos" className="transition hover:text-primary">Recursos</a>
            <a href="#seguranca" className="transition hover:text-primary">Seguranca</a>
            <a href="#fluxo" className="transition hover:text-primary">Como funciona</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Acessar plataforma</Link>
            </Button>
            <Button asChild>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Contratar
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border bg-[#f7f8fa]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(36,91,104,0.10)_0%,rgba(95,158,140,0.04)_36%,rgba(247,248,250,0)_70%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/15 bg-white px-3 py-2 text-sm font-black text-primary shadow-line">
              <Sparkles className="h-4 w-4" />
              SaaS clinico para psicologos independentes
            </div>
            <h1 className="mt-6 text-4xl font-black leading-[1.02] text-ink md:text-6xl">
              Sua clinica organizada em uma plataforma elegante, segura e pronta para vender.
            </h1>
            <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-ink-muted">
              A Nexopsi centraliza agenda, pacientes, sessoes, financeiro, documentos e relatorios em um painel profissional para a rotina real da psicologia.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 px-5 text-base">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Contratar pelo WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 px-5 text-base">
                <Link href="/login">
                  Ja tenho acesso
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="mt-7 grid gap-3 text-sm font-bold text-ink-muted sm:grid-cols-2">
              {outcomes.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-secondary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="rounded-lg border border-white/80 bg-white p-3 shadow-[0_24px_70px_rgba(31,41,55,0.12)]">
              <div className="rounded-md border border-border bg-[#f9fbfb] p-4">
                <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex h-12 w-36 items-center">
                    <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={220} height={110} className="h-full w-full object-contain" />
                  </div>
                  <span className="rounded-md bg-primary-soft px-3 py-2 text-xs font-black text-primary">Dashboard clinico</span>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-3">
                    {["Agenda", "Pacientes", "Sessoes", "Financeiro", "Documentos"].map((item, index) => (
                      <div key={item} className={`rounded-md border p-3 text-sm font-black ${index === 0 ? "border-primary bg-primary text-white" : "border-border bg-white text-ink-muted"}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-md bg-primary p-5 text-white">
                      <p className="text-sm font-semibold text-white/75">Bem-vindo a Nexopsi</p>
                      <p className="mt-2 text-2xl font-black">Portal pronto para sua clinica</p>
                      <p className="mt-2 text-sm font-semibold text-white/75">Configure o cadastro profissional e comece com dados zerados.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Pacientes", "Sessoes", "PDFs"].map((item) => (
                        <div key={item} className="rounded-md border border-border bg-white p-4">
                          <p className="text-xs font-bold text-ink-muted">{item}</p>
                          <p className="mt-2 text-2xl font-black text-ink">0</p>
                          <div className="mt-3 h-2 rounded-full bg-secondary-soft">
                            <div className="h-2 w-1/3 rounded-full bg-secondary" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-md border border-border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black text-ink">Primeiros passos</p>
                        <span className="text-xs font-black text-primary">4 etapas</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {["Cadastrar registro profissional", "Criar primeiro paciente", "Agendar sessao", "Gerar documento"].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                            <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="border-b border-border bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wide text-secondary">Recursos essenciais</p>
            <h2 className="mt-3 text-3xl font-black text-ink md:text-4xl">Tudo que a psicologa precisa para operar com clareza.</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-ink-muted">
              Menos planilhas soltas, menos improviso e mais controle sobre cada etapa do atendimento.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <div key={module.title} className="rounded-md border border-border bg-[#f9fbfb] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-soft text-primary">
                  <module.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-black text-ink">{module.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="border-b border-border bg-[#eef8f5] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Compra protegida</p>
            <h2 className="mt-3 text-3xl font-black text-ink md:text-4xl">Acesso liberado somente com chave de ativacao.</h2>
            <p className="mt-4 text-base font-semibold leading-7 text-ink-muted">
              O cadastro nao fica aberto para qualquer visitante. A pessoa recebe uma chave de produto e so entao consegue concluir a criacao da conta.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-white bg-white p-5 shadow-line">
              <LockKeyhole className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-black text-ink">Login em segundo plano</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">A divulgacao vende primeiro. A area de acesso fica disponivel para clientes ativados.</p>
            </div>
            <div className="rounded-md border border-white bg-white p-5 shadow-line">
              <ShieldCheck className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-black text-ink">Seguro e confidencial</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">Mensagens, PDFs e fluxo de cadastro seguem a identidade profissional da Nexopsi.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="fluxo" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-secondary">Como funciona</p>
              <h2 className="mt-3 text-3xl font-black text-ink md:text-4xl">Da compra ao primeiro prontuario em poucos passos.</h2>
              <div className="mt-8 grid gap-3">
                {[
                  "A cliente contrata pelo WhatsApp.",
                  "Voce envia a chave de ativacao do produto.",
                  "Ela cria a conta, confirma o e-mail e acessa o painel.",
                  "O primeiro acesso orienta cadastro, pacientes, agenda e documentos."
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-md border border-border bg-[#f9fbfb] p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-black text-white">{index + 1}</span>
                    <p className="self-center text-sm font-bold text-ink">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-primary p-6 text-white">
              <p className="text-sm font-semibold text-white/75">Nexopsi para psicologas</p>
              <h3 className="mt-3 text-3xl font-black">Venda uma plataforma com cara de produto serio.</h3>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/78">
                Design limpo, comunicacao comercial clara, cadastro protegido e acesso direto para quem ja comprou.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary" className="h-11">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">Quero contratar</a>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/35 bg-white/10 text-white hover:bg-white/18">
                  <Link href="/login">Area de acesso</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[#f7f8fa] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm font-semibold text-ink-muted md:flex-row md:items-center md:justify-between md:px-6">
          <p>Nexopsi - gestao clinica para psicologos</p>
          <p>Criado por <span className="font-black text-primary">ColliDev</span></p>
        </div>
      </footer>
    </main>
  );
}
