import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexopsi | Gestão para psicólogos",
  description: "Plataforma SaaS moderna para gestão clínica, agenda, prontuário, documentos e financeiro."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
