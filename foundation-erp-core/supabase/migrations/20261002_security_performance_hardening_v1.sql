-- Security/performance hardening after RBAC/company-scope validation.
-- Legacy energy reports have no organization/company key, so access is restricted to Master.
alter table public.relatorios_energia enable row level security;
drop policy if exists relatorios_energia_master_select on public.relatorios_energia;
drop policy if exists relatorios_energia_master_insert on public.relatorios_energia;
drop policy if exists relatorios_energia_master_update on public.relatorios_energia;
drop policy if exists relatorios_energia_master_delete on public.relatorios_energia;

create policy relatorios_energia_master_select on public.relatorios_energia
  for select to authenticated
  using ((select app_private.is_master()));
create policy relatorios_energia_master_insert on public.relatorios_energia
  for insert to authenticated
  with check ((select app_private.is_master()));
create policy relatorios_energia_master_update on public.relatorios_energia
  for update to authenticated
  using ((select app_private.is_master()))
  with check ((select app_private.is_master()));
create policy relatorios_energia_master_delete on public.relatorios_energia
  for delete to authenticated
  using ((select app_private.is_master()));

-- Cover the three foreign keys flagged by the performance advisor.
create index if not exists idx_avisos_aprovacao_aprovado_por
  on public.avisos_aprovacao(aprovado_por);
create index if not exists idx_avisos_aprovacao_criado_por
  on public.avisos_aprovacao(criado_por);
create index if not exists idx_usuario_empresas_concedido_por
  on public.usuario_empresas(concedido_por);

-- Avoid per-row auth.uid() re-evaluation in approval-notification RLS.
drop policy if exists avisos_aprovacao_select on public.avisos_aprovacao;
create policy avisos_aprovacao_select on public.avisos_aprovacao
  for select to authenticated
  using (destinatario_id = (select auth.uid()));

drop policy if exists avisos_aprovacao_update on public.avisos_aprovacao;
create policy avisos_aprovacao_update on public.avisos_aprovacao
  for update to authenticated
  using (
    destinatario_id = (select auth.uid())
    and status = 'pendente'
  )
  with check (
    destinatario_id = (select auth.uid())
    and status in ('aprovado','rejeitado')
  );
