"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const themes = [
  { id: "nexopsi", name: "Nexopsi clássico", primary: "#245B68", secondary: "#5F9E8C", bg: "#F7F8FA" },
  { id: "calm", name: "Calma clínica", primary: "#2F6F73", secondary: "#8AB8A8", bg: "#F6FAF8" },
  { id: "focus", name: "Foco profissional", primary: "#1F4E5A", secondary: "#3B82A0", bg: "#F5F7FA" },
  { id: "warm", name: "Acolhimento", primary: "#6A4C3B", secondary: "#9B8A6A", bg: "#FAF8F4" },
  { id: "minimal", name: "Minimal premium", primary: "#263238", secondary: "#607D72", bg: "#F8FAF9" }
];

export function ThemeSettings({ onNotify }: { onNotify: (message: string) => void }) {
  const [active, setActive] = useState("nexopsi");

  useEffect(() => {
    const saved = localStorage.getItem("nexopsi_theme") ?? "nexopsi";
    applyTheme(saved, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTheme(id: string, notify = true) {
    const theme = themes.find((item) => item.id === id) ?? themes[0];
    document.documentElement.dataset.theme = theme.id;
    document.documentElement.style.setProperty("--theme-primary", theme.primary);
    document.documentElement.style.setProperty("--theme-secondary", theme.secondary);
    document.documentElement.style.setProperty("--theme-bg", theme.bg);
    localStorage.setItem("nexopsi_theme", theme.id);
    setActive(theme.id);
    if (notify) onNotify(`Tema aplicado: ${theme.name}.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de tema</CardTitle>
        <CardDescription>Escolha uma identidade visual para a rotina da clínica.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {themes.map((theme) => (
          <button key={theme.id} type="button" onClick={() => applyTheme(theme.id)} className={`rounded-lg border bg-white p-4 text-left shadow-line transition hover:-translate-y-0.5 ${active === theme.id ? "border-primary ring-2 ring-primary/15" : "border-border"}`}>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <p className="font-black text-ink">{theme.name}</p>
            </div>
            <div className="mt-4 flex gap-2">
              {[theme.primary, theme.secondary, theme.bg].map((color) => <span key={color} className="h-8 flex-1 rounded-sm border border-border" style={{ backgroundColor: color }} />)}
            </div>
            <Button type="button" size="sm" variant={active === theme.id ? "default" : "outline"} className="mt-4 w-full">
              {active === theme.id ? "Tema ativo" : "Aplicar"}
            </Button>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
