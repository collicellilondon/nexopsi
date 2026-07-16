import { AlertCircle, CheckCircle2, Clock, LockKeyhole, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StateProps = {
  title: string;
  description: string;
  actionLabel?: string;
};

function StateShell({ icon, title, description, actionLabel }: StateProps & { icon: React.ReactNode }) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="rounded-md bg-primary-soft p-3 text-primary">{icon}</div>
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>
        </div>
        {actionLabel ? (
          <Button type="button" variant="outline" size="sm">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LoadingState() {
  return <StateShell icon={<Clock className="h-5 w-5" />} title="Carregando informações" description="Estamos buscando os dados com segurança." />;
}

export function EmptyState({ title = "Nada encontrado", description = "Ajuste os filtros ou cadastre um novo item." }) {
  return <StateShell icon={<SearchX className="h-5 w-5" />} title={title} description={description} actionLabel="Limpar filtros" />;
}

export function ErrorState() {
  return <StateShell icon={<AlertCircle className="h-5 w-5" />} title="Não foi possível carregar" description="Tente novamente em instantes ou acione o suporte." actionLabel="Tentar novamente" />;
}

export function SuccessState() {
  return <StateShell icon={<CheckCircle2 className="h-5 w-5" />} title="Alteração salva" description="A informação foi registrada e auditada." />;
}

export function AccessDeniedState() {
  return <StateShell icon={<LockKeyhole className="h-5 w-5" />} title="Acesso negado" description="Seu perfil não tem permissão para visualizar estes dados." />;
}
