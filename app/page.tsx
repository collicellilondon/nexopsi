import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  Check,
  Cloud,
  FileText,
  LockKeyhole,
  MessageCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards
} from "lucide-react";
import { Button } from "@/components/ui/button";

const whatsappMessage = "Olá, quero contratar a Nexopsi e receber minha chave de ativação.";
const whatsappUrl = `https://wa.me/4407726425982?text=${encodeURIComponent(whatsappMessage)}`;

const navItems = ["Recursos", "Benefícios", "Funcionalidades", "Depoimentos", "Planos", "Contato"];

const benefits = [
  "Agenda inteligente",
  "Prontuário eletrônico",
  "Relatórios e evolução",
  "Financeiro integrado"
];

const resources = [
  {
    title: "Agenda inteligente",
    description: "Agendamentos online, lembretes automáticos e gestão de horários sem conflitos.",
    icon: CalendarDays
  },
  {
    title: "Prontuário eletrônico",
    description: "Registros seguros, evolução de pacientes e modelo SOAP personalizável.",
    icon: FileText
  },
  {
    title: "Relatórios e evolução",
    description: "Gráficos, testes psicológicos e relatórios profissionais em poucos cliques.",
    icon: BarChart3
  },
  {
    title: "Financeiro completo",
    description: "Controle de recebimentos, mensalidades, faturas e faturamento da clínica.",
    icon: WalletCards
  },
  {
    title: "LGPD e segurança",
    description: "Dados dos pacientes protegidos com processos seguros e acesso controlado.",
    icon: ShieldCheck
  },
  {
    title: "Acesso de qualquer lugar",
    description: "Plataforma online para computador, tablet e celular.",
    icon: Cloud
  }
];

const testimonials = [
  {
    quote: "A Nexopsi transformou a minha rotina. Hoje tenho mais tempo para meus pacientes e menos burocracia.",
    name: "Juliana M.",
    role: "Psicóloga clínica",
    initials: "JM"
  },
  {
    quote: "Plataforma completa, intuitiva e com suporte excelente. Recomendo para todos os colegas.",
    name: "Carlos A.",
    role: "Psicólogo organizacional",
    initials: "CA"
  },
  {
    quote: "Finalmente encontrei um sistema que atende todas as necessidades da minha prática.",
    name: "Fernanda L.",
    role: "Neuropsicóloga",
    initials: "FL"
  }
];

const appointments = [
  ["09:00", "Ana Silva", "Terapia cognitivo-comportamental"],
  ["10:30", "João Santos", "Avaliação psicológica"],
  ["14:00", "Maria Oliveira", "Terapia de casal"]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#120f2f]">
      <header className="sticky top-0 z-40 border-b border-[#ece8fb] bg-white/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Nexopsi">
            <span className="flex h-12 w-40 items-center overflow-hidden">
              <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={230} height={110} priority className="h-full w-full object-contain" />
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold text-[#282044] lg:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${normalizeAnchor(item)}`} className="transition hover:text-[#6d48e5]">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="hidden h-11 rounded-lg border-[#d9d2f3] px-5 text-[#2b2345] sm:inline-flex">
              <Link href="/login">
                <UserRound className="h-4 w-4" />
                Entrar
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-lg bg-[#6d48e5] px-5 text-white shadow-[0_14px_35px_rgba(109,72,229,0.28)] hover:bg-[#5b36d6]">
              <Link href="/login">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(109,72,229,0.10),transparent_28%),radial-gradient(circle_at_84%_36%,rgba(148,117,255,0.22),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8f5ff_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 lg:min-h-[720px] lg:grid-cols-[0.92fr_1.08fr] lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f0ebff] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#6d48e5]">
              <Sparkles className="h-3.5 w-3.5" />
              Plataforma completa para psicólogos
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-[#120f2f] md:text-6xl">
              Mais organização, mais tempo para o que realmente importa:{" "}
              <span className="text-[#6d48e5]">seus pacientes.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-[#4d4568] md:text-lg">
              A Nexopsi facilita sua rotina clínica, melhora a gestão da agenda e entrega uma experiência profissional para você e seus pacientes.
            </p>

            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 text-sm font-bold text-[#2b2345]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#b7a7f7] bg-white text-[#6d48e5]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-14 rounded-lg bg-[#6d48e5] px-6 text-base font-black text-white shadow-[0_18px_45px_rgba(109,72,229,0.30)] hover:bg-[#5b36d6]">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-lg border-[#ded8f5] bg-white px-6 text-base font-black text-[#2b2345]">
                <Link href="/login">
                  <UserRound className="h-5 w-5" />
                  Criar minha conta
                </Link>
              </Button>
            </div>

            <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#6b6386]">
              <ShieldCheck className="h-4 w-4 text-[#6d48e5]" />
              Seus dados protegidos e em conformidade com a LGPD
            </div>
          </div>

          <div className="relative min-h-[520px]">
            <DashboardMockup />
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section id="recursos" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-wide text-[#6d48e5]">Tudo que você precisa em um só lugar</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#120f2f] md:text-4xl">
              Recursos desenvolvidos para psicólogos, como você
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {resources.map((resource) => (
              <div key={resource.title} className="rounded-2xl border border-[#eeeaf8] bg-white p-6 shadow-[0_12px_35px_rgba(33,25,74,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(109,72,229,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2edff] text-[#6d48e5]">
                  <resource.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-sm font-black text-[#120f2f]">{resource.title}</h3>
                <p className="mt-3 text-xs font-semibold leading-6 text-[#5c5574]">{resource.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefícios" className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#6d48e5]">Por que usar a Nexopsi?</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#120f2f] md:text-4xl">
              Menos burocracia, <span className="text-[#6d48e5]">mais conexão e resultados</span>
            </h2>
            <div className="mt-7 space-y-3">
              {[
                "Reduza faltas com lembretes automáticos",
                "Tenha todas as informações na palma da mão",
                "Organize sua rotina e maximize seu tempo",
                "Encante seus pacientes com atendimento profissional",
                "Suporte humanizado e especializado para psicólogos"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#30284d]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#a895f3] text-[#6d48e5]">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid overflow-hidden rounded-2xl border border-[#eeeaf8] bg-[#f7f3ff] shadow-[0_20px_60px_rgba(33,25,74,0.08)] md:grid-cols-[0.82fr_1.18fr]">
            <div className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#6d48e5] shadow-sm">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h3 className="mt-7 text-2xl font-black leading-tight text-[#120f2f]">Segurança e privacidade em primeiro lugar</h3>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#5c5574]">
                A Nexopsi segue boas práticas para proteger dados clínicos, documentos e acessos da plataforma.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#2b2345] shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0ebff] text-[#6d48e5]">
                  <Check className="h-4 w-4" />
                </span>
                Conformidade LGPD
              </div>
            </div>
            <div className="relative min-h-[310px] bg-[linear-gradient(135deg,#faf8ff,#ebe3ff)] p-6">
              <div className="absolute inset-6 rounded-2xl bg-white/70" />
              <div className="relative ml-auto flex h-full max-w-sm flex-col justify-end rounded-2xl bg-[linear-gradient(160deg,#fff,#efe9ff)] p-6 shadow-[0_22px_55px_rgba(33,25,74,0.12)]">
                <div className="mb-5 h-24 w-24 rounded-full bg-[#ded4ff]" />
                <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                  <div className="h-3 w-36 rounded-full bg-[#d6cef4]" />
                  <div className="h-3 w-52 rounded-full bg-[#eee9fb]" />
                  <div className="h-3 w-44 rounded-full bg-[#eee9fb]" />
                  <div className="mt-4 h-10 rounded-xl bg-[#6d48e5]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-wide text-[#6d48e5]">Depoimentos</p>
            <h2 className="mt-3 text-3xl font-black text-[#120f2f] md:text-4xl">O que nossos psicólogos dizem</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl border border-[#eeeaf8] bg-white p-6 shadow-[0_12px_35px_rgba(33,25,74,0.05)]">
                <Quote className="h-8 w-8 fill-[#c7baff] text-[#c7baff]" />
                <p className="mt-4 text-sm font-semibold leading-7 text-[#3b3458]">{testimonial.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0ebff] text-sm font-black text-[#6d48e5]">{testimonial.initials}</div>
                  <div>
                    <p className="font-black text-[#120f2f]">{testimonial.name}</p>
                    <p className="text-xs font-semibold text-[#6b6386]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="bg-white px-5 pb-16">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-3xl bg-[#24145f] p-8 text-white shadow-[0_22px_60px_rgba(36,20,95,0.22)] md:grid-cols-[0.82fr_0.55fr] md:items-center md:p-10">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#25d366] text-white shadow-[0_18px_40px_rgba(37,211,102,0.28)]">
              <MessageCircle className="h-11 w-11" />
            </div>
            <div>
              <h2 className="text-2xl font-black md:text-3xl">Pronto para transformar sua prática clínica?</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/75">
                Fale agora com um especialista e descubra como a Nexopsi pode facilitar sua rotina e impulsionar sua clínica.
              </p>
            </div>
          </div>
          <Button asChild className="h-16 rounded-2xl bg-white px-6 text-base font-black text-[#24145f] hover:bg-[#f5f1ff]">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="h-6 w-6 text-[#25d366]" />
              Falar no WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-[#eeeaf8] bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-sm font-semibold text-[#6b6386] md:flex-row md:items-center md:justify-between">
          <div className="grid gap-3 sm:grid-cols-3">
            <FooterBadge icon={<WalletCards className="h-4 w-4" />} title="Pagamento seguro" text="Transações protegidas" />
            <FooterBadge icon={<LockKeyhole className="h-4 w-4" />} title="Dados protegidos" text="Conformidade com a LGPD" />
            <FooterBadge icon={<UserRound className="h-4 w-4" />} title="Suporte humanizado" text="Especializado para psicólogos" />
          </div>
          <div className="flex items-center gap-4">
            <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={120} height={60} className="h-8 w-auto object-contain" />
            <span>Criado por ColliDev</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function DashboardMockup() {
  return (
    <div className="absolute left-0 top-2 w-full max-w-[720px] overflow-hidden rounded-[28px] border border-[#eeeaf8] bg-white shadow-[0_30px_90px_rgba(54,38,117,0.20)] lg:left-2">
      <div className="grid min-h-[460px] grid-cols-[138px_1fr]">
        <aside className="bg-[#100b31] p-5 text-white">
          <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={150} height={75} className="h-10 w-auto brightness-0 invert" />
          <div className="mt-8 space-y-3 text-xs font-bold text-white/70">
            {["Resumo", "Agenda", "Pacientes", "Prontuários", "Financeiro", "Relatórios", "Configurações"].map((item, index) => (
              <div key={item} className={`rounded-xl px-3 py-2 ${index === 0 ? "bg-[#6d48e5] text-white" : ""}`}>{item}</div>
            ))}
          </div>
        </aside>

        <div className="p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xl font-black text-[#120f2f]">Olá, Fernanda!</p>
              <p className="mt-1 text-xs font-semibold text-[#6b6386]">Aqui está o resumo da sua clínica hoje.</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#e8ddff]" />
          </div>

          <div className="mt-7 grid grid-cols-4 gap-3">
            {[
              ["Agenda de hoje", "5", "atendimentos"],
              ["Pacientes ativos", "32", "cadastros"],
              ["Faturamento", "R$ 8.450", "este mês"],
              ["Taxa de faltas", "8%", "-3% vs mês anterior"]
            ].map(([label, value, helper]) => (
              <div key={label} className="rounded-2xl border border-[#eeeaf8] bg-white p-4 shadow-sm">
                <p className="text-[11px] font-bold text-[#6b6386]">{label}</p>
                <p className="mt-3 text-xl font-black text-[#120f2f]">{value}</p>
                <p className="mt-1 text-[10px] font-semibold text-[#8a829d]">{helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_0.9fr]">
            <div className="rounded-2xl border border-[#eeeaf8] bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-[#120f2f]">Próximos atendimentos</p>
              <div className="mt-5 space-y-5">
                {appointments.map(([time, name, type]) => (
                  <div key={name} className="grid grid-cols-[52px_1fr] gap-3 border-l-2 border-[#6d48e5] pl-3">
                    <p className="text-xs font-black text-[#120f2f]">{time}</p>
                    <div>
                      <p className="text-xs font-black text-[#120f2f]">{name}</p>
                      <p className="text-[10px] font-semibold text-[#8a829d]">{type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs font-black text-[#6d48e5]">Ver agenda completa +</p>
            </div>

            <div className="rounded-2xl border border-[#eeeaf8] bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-[#120f2f]">Gráfico de atendimentos</p>
              <div className="mt-6 flex h-44 items-end gap-2">
                {[28, 45, 22, 52, 38, 68, 42, 88, 56, 74].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-lg bg-[#d9d0ff]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="absolute bottom-0 right-0 hidden w-[180px] rounded-[32px] border-[8px] border-[#120f2f] bg-white p-3 shadow-[0_26px_70px_rgba(18,15,47,0.24)] md:block lg:right-0">
      <div className="mb-4 flex items-center justify-between">
        <Image src="/brand/nexopsi-logo.png" alt="Nexopsi" width={88} height={44} className="h-6 w-auto object-contain" />
        <span className="text-xs text-[#8a829d]">×</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-[#120f2f]">Agenda</p>
        <span className="rounded-full bg-[#f0ebff] px-2 py-1 text-[9px] font-black text-[#6d48e5]">Hoje</span>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-1 text-center text-[9px] font-bold text-[#8a829d]">
        {["20", "21", "22", "23", "24"].map((day, index) => (
          <div key={day} className={`rounded-lg py-2 ${index === 2 ? "bg-[#6d48e5] text-white" : "bg-[#f6f3ff]"}`}>{day}</div>
        ))}
      </div>
      <p className="mt-5 text-[10px] font-black text-[#120f2f]">22 de maio, terça-feira</p>
      <div className="mt-3 space-y-3">
        {appointments.map(([time, name]) => (
          <div key={name} className="rounded-xl bg-[#f8f5ff] p-2">
            <p className="text-[10px] font-black text-[#120f2f]">{time}</p>
            <p className="text-[9px] font-semibold text-[#6b6386]">{name}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-around border-t border-[#eeeaf8] pt-3 text-[#6d48e5]">
        <CalendarDays className="h-4 w-4" />
        <UserRound className="h-4 w-4" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d48e5] text-white">+</span>
        <FileText className="h-4 w-4" />
      </div>
    </div>
  );
}

function FooterBadge({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0ebff] text-[#6d48e5]">{icon}</span>
      <span>
        <span className="block text-xs font-black text-[#2b2345]">{title}</span>
        <span className="block text-[11px] font-semibold text-[#8a829d]">{text}</span>
      </span>
    </div>
  );
}

function normalizeAnchor(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
