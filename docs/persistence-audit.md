# Auditoria de persistencia Nexopsi

Data: 2026-07-21

## Modulos identificados

- Autenticacao: `features/auth/login-page.tsx`, `lib/auth/supabase-auth.ts`, `app/api/auth/signup/route.ts`
- Dashboard/home: `features/home/interactive-home.tsx`, `features/dashboard/dashboard.tsx`
- Pacientes: `features/patients/patient-registration-modal.tsx`, `features/patients/patient-list.tsx`
- Agenda: `features/calendar/clinical-calendar.tsx`, `features/calendar/session-modal.tsx`
- Sessoes/evolucoes: `features/sessions/session-management.tsx`
- Documentos/prontuarios/recibos/relatorios clinicos: `features/documents/document-center.tsx`, `features/reports/reports-panel.tsx`
- Financeiro: `features/finance/finance-panel.tsx`
- Configuracoes/perfil/tema: `features/settings/professional-profile.tsx`, `features/settings/theme-settings.tsx`

## Persistencia atual confirmada

- Pacientes usam Supabase com `organization_id`.
- Perfil profissional esta sendo migrado para `professional_profiles`, mas o fluxo anterior tambem atualizava metadados e podia mostrar sucesso mesmo se o banco falhasse.
- Financeiro tem conexao parcial com Supabase para faturas e valores.

## Pontos ainda com estado local ou dados fixos

- Agenda usa `initialAppointments` de `lib/mock-data.ts` e `useState`.
- Modal de sessao guarda evolucao em `useState`.
- Sessao/evolucao usa `initialSessions` e `useState`.
- Documentos usam `initialDocuments`, `templates` fixos e `useState`.
- Relatorios geram graficos zerados a partir de arrays fixos.
- Tema usa `localStorage` como fonte principal.
- Dashboard ainda usa metricas fixas e contadores derivados parcialmente.

## Tabelas existentes ou propostas

- Existentes/propostas ja no script: `organizations`, `profiles`, `organization_members`, `patients`, `professional_profiles`, `service_prices`, `invoices`.
- Necessarias para cobertura global: `appointments`, `clinical_sessions`, `clinical_notes`, `documents`, `document_templates`, `receipts`, `prescriptions`, `reports`, `app_settings`, `audit_logs`.

## Causa-raiz do desaparecimento

Varios modulos simulam criacao/edicao apenas no estado local do React. Ao atualizar a pagina, sair da conta ou trocar de dispositivo, esses estados sao recriados vazios. Em alguns pontos, mensagens de sucesso eram exibidas antes da confirmacao do Supabase.

## Plano de correcao por etapas

1. Criar schema seguro e RLS para todos os modulos ausentes.
2. Padronizar `organization_id` como escopo principal de multiacesso e `profile_id` para autoria/profissional.
3. Corrigir perfil profissional para salvar e carregar de `professional_profiles`.
4. Persistir configuracoes visuais em `app_settings`.
5. Persistir financeiro em `invoices` e `service_prices`.
6. Persistir agenda em `appointments`.
7. Persistir sessoes/evolucoes em `clinical_sessions` e `clinical_notes`.
8. Persistir documentos/modelos/relatorios/receituarios/recibos nas tabelas dedicadas.
9. Remover `localStorage` como fonte principal de dados permanentes.
10. Testar refresh, logout/login e segundo usuario por modulo.
