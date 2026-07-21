"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const themes = [
  { id: "nexopsi", name: "Nexopsi lilás", primary: "#6D48E5", secondary: "#8B6FF1", bg: "#FBFAFF" },
  { id: "nexopsi-verde", name: "Nexopsi clássico", primary: "#245B68", secondary: "#5F9E8C", bg: "#F7F8FA" },
  { id: "calm", name: "Calma clínica", primary: "#2F6F73", secondary: "#8AB8A8", bg: "#F6FAF8" },
  { id: "focus", name: "Foco profissional", primary: "#1F4E5A", secondary: "#3B82A0", bg: "#F5F7FA" },
  { id: "warm", name: "Acolhimento", primary: "#6A4C3B", secondary: "#9B8A6A", bg: "#FAF8F4" },
  { id: "minimal", name: "Minimal premium", primary: "#263238", secondary: "#607D72", bg: "#F8FAF9" }
];

export function ThemeSettings({ workspaceId, onNotify }: { workspaceId?: string | null; onNotify: (message: string) => void }) {
  const [active, setActive] = useState("nexopsi");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      applyThemeLocally("nexopsi");
      if (!workspaceId) return;

      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("organization_id", workspaceId)
        .eq("key", "theme")
        .maybeSingle();

      if (!mounted) return;
      if (error) {
        onNotify(`Nao foi possivel carregar o tema salvo: ${error.message}`);
        return;
      }

      const savedTheme = readThemeId(data?.value);
      applyThemeLocally(savedTheme);
    }

    loadTheme();

    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  function applyThemeLocally(id: string) {
    const theme = themes.find((item) => item.id === id) ?? themes[0];
    document.documentElement.dataset.theme = theme.id;
    document.documentElement.style.setProperty("--theme-primary", theme.primary);
    document.documentElement.style.setProperty("--theme-secondary", theme.secondary);
    document.documentElement.style.setProperty("--theme-bg", theme.bg);
    setActive(theme.id);
  }

  async function applyTheme(id: string) {
    const theme = themes.find((item) => item.id === id) ?? themes[0];
    applyThemeLocally(theme.id);

    if (!workspaceId) {
      onNotify("Tema aplicado nesta tela. Aguarde o workspace carregar para salvar no Supabase.");
      return;
    }

    setSaving(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("app_settings").upsert(
      {
        organization_id: workspaceId,
        key: "theme",
        value: { id: theme.id }
      },
      { onConflict: "organization_id,key" }
    );
    setSaving(false);

    if (error) {
      onNotify(`Nao foi possivel salvar o tema no Supabase: ${error.message}`);
      return;
    }

    onNotify(`Tema aplicado e salvo: ${theme.name}.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de tema</CardTitle>
        <CardDescription>Escolha uma identidade visual para a rotina da clínica.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {themes.map((theme) => (
          <button key={theme.id} type="button" disabled={saving} onClick={() => applyTheme(theme.id)} className={`rounded-lg border bg-white p-4 text-left shadow-line transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 ${active === theme.id ? "border-primary ring-2 ring-primary/15" : "border-border"}`}>
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

function readThemeId(value: unknown) {
  if (!value || typeof value !== "object") return "nexopsi";
  const themeId = (value as { id?: unknown }).id;
  return typeof themeId === "string" ? themeId : "nexopsi";
}
