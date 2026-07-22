"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type ProfessionalProfileData = {
  name: string;
  register: string;
  email: string;
  phone: string;
  specialty: string;
  bio: string;
  photoUrl?: string;
};

type ProfessionalProfileProps = {
  initialProfile: ProfessionalProfileData;
  onNotify: (message: string) => void;
  onSave: (profile: ProfessionalProfileData) => boolean | Promise<boolean>;
  onUploadPhoto?: (file: File) => Promise<string | null>;
};

export function ProfessionalProfile({ initialProfile, onNotify, onSave, onUploadPhoto }: ProfessionalProfileProps) {
  const [profile, setProfile] = useState<ProfessionalProfileData>(initialProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  function update(field: keyof ProfessionalProfileData, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function saveProfile() {
    setSaving(true);
    const success = await onSave(profile);
    setSaving(false);
    setSaved(success);
  }

  async function changePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onNotify("Selecione um arquivo de imagem para a foto profissional.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      onNotify("A foto precisa ter ate 4 MB para ser salva no Supabase.");
      return;
    }
    if (!onUploadPhoto) {
      onNotify("Upload de foto indisponivel nesta tela.");
      return;
    }

    setPhotoUploading(true);
    const photoUrl = await onUploadPhoto(file);
    setPhotoUploading(false);

    if (!photoUrl) return;
    setProfile((current) => ({ ...current, photoUrl }));
    setSaved(false);
    onNotify("Foto enviada ao Supabase. Clique em Salvar cadastro para atualizar documentos e cabecalho.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro do psicologo</CardTitle>
        <CardDescription>Informacoes usadas em documentos, recibos, prontuarios e relatorios.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border border-border bg-background p-5 text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-4xl font-black text-primary">
            {profile.photoUrl ? (
              <Image src={profile.photoUrl} alt={`Foto de ${profile.name}`} width={128} height={128} unoptimized className="h-full w-full object-cover" />
            ) : (
              getInitials(profile.name)
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => changePhoto(event.target.files?.[0])} />
          <Button type="button" variant="outline" className="mt-4 w-full" disabled={photoUploading} onClick={() => fileInputRef.current?.click()}>
            <Camera className="h-4 w-4" />
            {photoUploading ? "Enviando..." : "Alterar foto"}
          </Button>
          <p className="mt-3 text-sm text-ink-muted">Foto profissional de {profile.name || "psicologo"} para cabecalhos e documentos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome profissional"><Input value={profile.name} onChange={(event) => update("name", event.target.value)} /></Field>
          <Field label="Registro profissional"><Input value={profile.register} onChange={(event) => update("register", event.target.value)} /></Field>
          <Field label="E-mail"><Input value={profile.email} onChange={(event) => update("email", event.target.value)} /></Field>
          <Field label="Telefone"><Input value={profile.phone} onChange={(event) => update("phone", event.target.value)} /></Field>
          <Field label="Especialidade"><Input value={profile.specialty} onChange={(event) => update("specialty", event.target.value)} /></Field>
          <Field label="Assinatura em documentos"><Input value={`${profile.name} - ${profile.register}`} readOnly /></Field>
          <label className="text-sm font-bold text-ink md:col-span-2">
            Bio profissional
            <textarea className="mt-2 min-h-28 w-full rounded-md border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={profile.bio} onChange={(event) => update("bio", event.target.value)} />
          </label>
          {saved ? (
            <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-bold text-green-700 md:col-span-2">
              <CheckCircle2 className="h-4 w-4" />
              Cadastro salvo. O cabecalho ja foi atualizado com {profile.name || "o psicologo"}.
            </div>
          ) : null}
          <div className="flex justify-end md:col-span-2">
            <Button type="button" disabled={saving || photoUploading} onClick={saveProfile}>
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar cadastro"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-bold text-ink">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NX"
  );
}
