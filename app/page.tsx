import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  FileSignature,
  LockKeyhole,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappMessage = "Olá, quero contratar a Nexopsi e receber minha chave de ativação.";
const whatsappUrl = `https://wa.me/4407726425982?text=${encodeURIComponent(whatsappMessage)}`;

const highlights = [
  "Agenda clínica",
  "Prontuários em PDF",
  "Financeiro completo",
  "Cadastro com ativação"
];

const modules = [
  {
    title: "Agenda que acompanha a rotina",
    description: "Sessões, status, faltas, reagendamentos e visão do dia em uma tela clara para atendimento.",
    icon: CalendarCheck,
    accent: "bg-[#245b68]"
  },
  {
    title: "Documentos com identidade",
    description: "Relatórios, termos, resumos e prontuários com logo, cabeçalho, contato e marca d'água.",
    icon: FileSignature,
    accent: "bg-[#c56b43]"
  },
  {
    title: "Financeiro sem improviso",
    description: "Faturas, mensalidades, adimplentes, inadimplentes e pendências em um fluxo profissional.",
    icon: WalletCards,
    accent: "bg-[#5f9e8c]"
  },
  {
    title: "Conta protegida por chave",
    description: "O cadastro só é concluído com código de ativação, preservando o acesso para quem comprou.",
    icon: LockKeyhole,
    accent: "bg-[#7c5cbb]"
  }
];

const steps = [
  "A cliente conhece a Nexopsi e chama no WhatsApp.",
  "Você libera a chave de ativação após a compra.",
  "Ela cria a conta, confirma o e-mail e acessa o painel.",
  "O primeiro acesso orienta cadastro profissional, pacientes, agenda e documentos."
];

const proofCards = [
  { label: "Pacientes", value: "Centralizado", icon: UserRoundCheck },
  { label: "Sessões", value: "Organizadas", icon: ClipboardCheck },
  { label: "Cobranças", value: "Visíveis", icon: ReceiptText }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbf8] text-ink">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/55 bg-white/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexopsi">
            <span className="flex h-16 w-44 items-center overflow-hidden">
              <Image
                src="/brand/nexopsi-logo.png"
                alt="Nexopsi"
                width={280}
                height={140}
                priority
                className="h-full w-full object-contain"
              />
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-ink-muted lg:flex">
            <a href="#recursos" className="transition hover:text-primary">Recursos</a>
            <a href="#experiencia" className="transition hover:text-primary">Experiência</a>
            <a href="#seguranca" className="transition hover:text-primary">Segurança</a>
            <a href="#fluxo" className="transition hover:text-primary">Como funciona</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="shadow-[0_12px_30px_rgba(36,91,104,0.22)]">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Contratar
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen pt-24">
        <div className="landing-aurora" />
        <div className="landing-lines" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbfbf8] to-transparent" />

        <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-4 pb-16 pt-8 md:px-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#245b68]/15 bg-white/86 px-4 py-2 text-sm font-black text-primary shadow-[0_12px_32px_rgba(31,41,55,0.08)]">
              <Sparkles className="h-4 w-4 text-[#c56b43]" />
              SaaS profissional para psicólogos independentes
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.02] text-ink md:text-6xl xl:text-7xl">
              Nexopsi organiza a clínica e transforma atendimento em gestão.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-ink-muted md:text-xl">
              Uma plataforma elegante para agenda, pacientes, sessões, financeiro, documentos e relatórios. Feita para vender confiança antes mesmo do primeiro login.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-md px-5 text-base shadow-[0_16px_35px_rgba(36,91,104,0.24)]">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Contratar pelo WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-md border-[#245b68]/20 bg-white/80 px-5 text-base">
                <Link href="/login">
                  Área de acesso
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-white bg-white/82 px-4 py-2 text-sm font-black text-ink shadow-line">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 lg:pl-4">
            <div className="absolute -left-4 top-16 hidden h-28 w-28 rounded-full bg-[#c56b43]/18 blur-2xl lg:block" />
            <div className="absolute -right-6 bottom-10 hidden h-36 w-36 rounded-full bg-[#5f9e8c]/22 blur-2xl lg:block" />
            <div className="landing-dashboard-frame">
              <div className="flex items-center justify-between border-b border-white/55 bg-[#1f2937] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#f06a62]" />
                  <span className="h-3 w-3 rounded-full bg-[#f4c259]" />
                  <span className="h-3 w-3 rounded-full bg-[#5fca8f]" />
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/76">nexopsi.app.br</span>
              </div>

              <div className="grid gap-0 bg-white md:grid-cols-[168px_1fr]">
                <aside className="hidden border-r border-border bg-[#f4f7f6] p-4 md:block">
                  <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={190} height={95} className="mb-6 h-auto w-32 object-contain" />
                  <div className="space-y-2">
                    {["Dashboard", "Agenda", "Pacientes", "Financeiro", "Documentos"].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-3 text-sm font-black ${
                          index === 0 ? "bg-primary text-white shadow-[0_10px_26px_rgba(36,91,104,0.22)]" : "text-ink-muted"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="p-4 sm:p-5">
                  <div className="rounded-md bg-[#245b68] p-5 text-white shadow-[0_18px_45px_rgba(36,91,104,0.24)]">
                    <p className="text-sm font-bold text-white/72">Bem-vinda à Nexopsi</p>
                    <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h2 className="text-2xl font-black md:text-3xl">Sua clínica começa zerada, bonita e pronta.</h2>
                        <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-white/72">
                          Configure seu cadastro profissional para personalizar cabeçalhos, PDFs e relatórios.
                        </p>
                      </div>
                      <div className="rounded-md bg-white/12 px-4 py-3">
                        <p className="text-xs font-bold text-white/64">Próxima sessão</p>
                        <p className="text-2xl font-black">14:00</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {proofCards.map((card) => (
                      <div key={card.label} className="rounded-md border border-border bg-[#fbfbf8] p-4">
                        <card.icon className="h-5 w-5 text-[#c56b43]" />
                        <p className="mt-3 text-xs font-bold text-ink-muted">{card.label}</p>
                        <p className="mt-1 text-lg font-black text-ink">{card.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.82fr]">
                    <div className="rounded-md border border-border bg-white p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-ink">Agenda da semana</p>
                        <span className="rounded-full bg-[#eaf4f1] px-3 py-1 text-xs font-black text-[#2f7d63]">Confirmadas</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ["09:00", "Triagem inicial", "#245b68"],
                          ["11:30", "Sessão presencial", "#c56b43"],
                          ["15:00", "Retorno online", "#5f9e8c"]
                        ].map(([time, label, color]) => (
                          <div key={label} className="flex items-center gap-3 rounded-md bg-[#f7f8fa] p-3">
                            <span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <div>
                              <p className="text-sm font-black text-ink">{time}</p>
                              <p className="text-xs font-bold text-ink-muted">{label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-md border border-border bg-[#fbfbf8] p-4">
                      <p className="font-black text-ink">Documentos</p>
                      <div className="mt-4 space-y-3">
                        {["Prontuário", "Recibo", "Relatório"].map((item) => (
                          <div key={item} className="flex items-center justify-between rounded-md bg-white px-3 py-3 text-sm font-bold shadow-line">
                            {item}
                            <BadgeCheck className="h-4 w-4 text-[#5f9e8c]" />
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

      <section id="recursos" className="relative border-y border-border bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#c56b43]">Produto completo</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-ink md:text-5xl">
                Uma operação clínica com cara de software premium.
              </h2>
            </div>
            <p className="text-base font-semibold leading-8 text-ink-muted">
              A landing precisa vender a sensação certa: organização, segurança e profissionalismo. A Nexopsi apresenta isso antes de pedir login e entrega um painel pronto para uso depois da compra.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <div key={module.title} className="group rounded-md border border-border bg-[#fbfbf8] p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(31,41,55,0.10)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-md text-white ${module.accent}`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black text-ink">{module.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experiencia" className="bg-[#1f2937] py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#8ed0bd]">Experiência de compra</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
              A tela pública vende. O login entra no momento certo.
            </h2>
            <p className="mt-5 text-base font-semibold leading-8 text-white/70">
              O visitante vê uma página comercial, moderna e objetiva. Quem já comprou acessa a área restrita, conclui o cadastro com chave de ativação e começa pelo painel de boas-vindas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Página comercial na entrada", "WhatsApp como canal de venda", "Acesso protegido por chave", "Dashboard limpo após login"].map((item) => (
              <div key={item} className="rounded-md border border-white/12 bg-white/7 p-5">
                <BadgeCheck className="h-6 w-6 text-[#8ed0bd]" />
                <p className="mt-4 text-lg font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="border-b border-border bg-[#f4f7f6] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-primary">Seguro e confidencial</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-ink md:text-5xl">
              Cadastro controlado, comunicação profissional e documentos padronizados.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-white bg-white p-6 shadow-[0_18px_55px_rgba(31,41,55,0.08)]">
              <LockKeyhole className="h-8 w-8 text-primary" />
              <h3 className="mt-5 text-xl font-black text-ink">Chave de ativação</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">
                A conta só é criada quando a cliente informa o código do produto comprado.
              </p>
            </div>
            <div className="rounded-md border border-white bg-white p-6 shadow-[0_18px_55px_rgba(31,41,55,0.08)]">
              <ShieldCheck className="h-8 w-8 text-[#5f9e8c]" />
              <h3 className="mt-5 text-xl font-black text-ink">E-mails e PDFs com marca</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-ink-muted">
                Confirmação, redefinição de senha, relatórios e prontuários com presença profissional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="fluxo" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-[#c56b43]">Da venda ao uso</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-ink md:text-5xl">
                Um caminho simples para contratar, ativar e começar.
              </h2>
              <Button asChild className="mt-8 h-12 px-5 text-base">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Falar com ColliDev
                  <MessageCircle className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="grid gap-3">
              {steps.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-md border border-border bg-[#fbfbf8] p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#245b68] text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="self-center text-sm font-bold leading-6 text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#245b68] px-4 py-14 text-white md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-white/70">Nexopsi</p>
            <h2 className="mt-2 text-3xl font-black">Pronta para apresentar, vender e ativar clientes.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary" className="h-12 px-5">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">Contratar agora</a>
            </Button>
            <Button asChild variant="outline" className="h-12 border-white/35 bg-white/10 px-5 text-white hover:bg-white/18">
              <Link href="/login">Entrar na plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-[#fbfbf8] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm font-semibold text-ink-muted md:flex-row md:items-center md:justify-between md:px-6">
          <p>Nexopsi - gestão clínica para psicólogos</p>
          <p>Criado por <span className="font-black text-primary">ColliDev</span></p>
        </div>
      </footer>
    </main>
  );
}
