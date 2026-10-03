create table if not exists public.avisos_aprovacao (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.organizacoes(id) on delete cascade,
  destinatario_id uuid not null references public.perfis(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text,
  entidade_tipo text,
  entidade_id uuid,
  dados jsonb not null default '{}'::jsonb,
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado','cancelado')),
  aprovado_por uuid references public.perfis(id) on delete set null,
  aprovado_em timestamptz,
  criado_por uuid references public.perfis(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint avisos_aprovacao_status_approval_check check ((status = 'pendente' and aprovado_por is null and aprovado_em is null) or (status <> 'pendente'))
);
create index if not exists idx_avisos_aprovacao_destinatario_status on public.avisos_aprovacao (destinatario_id, status, created_at desc);
create index if not exists idx_avisos_aprovacao_org_status on public.avisos_aprovacao (organizacao_id, status, created_at desc);
alter table public.avisos_aprovacao enable row level security;
drop policy if exists avisos_aprovacao_select on public.avisos_aprovacao;
create policy avisos_aprovacao_select on public.avisos_aprovacao for select to authenticated using (destinatario_id = auth.uid());
drop policy if exists avisos_aprovacao_update on public.avisos_aprovacao;
create policy avisos_aprovacao_update on public.avisos_aprovacao for update to authenticated using (destinatario_id = auth.uid() and status = 'pendente') with check (destinatario_id = auth.uid() and status in ('aprovado','rejeitado'));
create or replace function public.touch_avisos_aprovacao_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists trg_avisos_aprovacao_updated_at on public.avisos_aprovacao;
create trigger trg_avisos_aprovacao_updated_at before update on public.avisos_aprovacao for each row execute function public.touch_avisos_aprovacao_updated_at();
alter publication supabase_realtime add table public.avisos_aprovacao;