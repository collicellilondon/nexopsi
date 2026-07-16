# Arquitetura Inicial

## Stack

- Next.js App Router com TypeScript
- Tailwind CSS com componentes locais no padrão shadcn/ui
- Supabase Auth, PostgreSQL e Row Level Security
- React Hook Form e Zod para formulários
- FullCalendar para agenda
- Recharts para indicadores

## Pastas

- `app/`: rotas, layout raiz e tela inicial autenticada mockada
- `components/`: componentes compartilhados, UI base e estados reutilizáveis
- `features/`: módulos de produto por domínio
- `lib/`: utilitários, tipos, mocks, validações e cliente Supabase
- `supabase/`: migrations SQL e políticas RLS
- `docs/`: decisões arquiteturais e notas de evolução

## Multi-tenant

Todos os dados clínicos e financeiros carregam `organization_id`. O vínculo entre usuário autenticado e organização fica em `organization_members`, usado pelas políticas RLS para limitar leitura e escrita.

## Próximas Etapas

- Conectar Supabase Auth real
- Trocar mocks por queries segmentadas por organização
- Adicionar auditoria por trigger nas tabelas críticas
- Implementar formulários reais com React Hook Form e Zod
- Criar telas de prontuário, financeiro e documentos
