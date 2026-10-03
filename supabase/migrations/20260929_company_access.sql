-- Company registry authorization hardening.
-- Reads remain available to active users in their organization; mutations require explicit CORE permissions.
insert into public.permissoes (chave, modulo, recurso, acao, descricao, modulo_codigo)
values
  ('core.empresas.criar', 'CORE', 'EMPRESAS', 'criar', 'Cadastrar empresas e filiais', 'CORE'),
  ('core.empresas.editar', 'CORE', 'EMPRESAS', 'editar', 'Alterar empresas e filiais', 'CORE'),
  ('core.empresas.excluir', 'CORE', 'EMPRESAS', 'excluir', 'Desativar empresas e filiais', 'CORE')
on conflict (chave) do update
set modulo = excluded.modulo,
    recurso = excluded.recurso,
    acao = excluded.acao,
    descricao = excluded.descricao,
    modulo_codigo = excluded.modulo_codigo;

drop policy if exists empresas_org_access on public.empresas;

create policy empresas_org_select
on public.empresas
for select
to authenticated
using (app_private.has_org_access(organizacao_id));

create policy empresas_org_insert
on public.empresas
for insert
to authenticated
with check (
  app_private.has_org_access(organizacao_id)
  and app_private.has_permission('core.empresas.criar')
);

create policy empresas_org_update
on public.empresas
for update
to authenticated
using (
  app_private.has_org_access(organizacao_id)
  and app_private.has_permission('core.empresas.editar')
)
with check (
  app_private.has_org_access(organizacao_id)
  and app_private.has_permission('core.empresas.editar')
);

create policy empresas_org_delete
on public.empresas
for delete
to authenticated
using (
  app_private.has_org_access(organizacao_id)
  and app_private.has_permission('core.empresas.excluir')
);

-- Company membership assignment is user administration, not ordinary company visibility.
drop policy if exists usuario_empresas_org_access on public.usuario_empresas;

create policy usuario_empresas_org_select
on public.usuario_empresas
for select
to authenticated
using (
  exists (
    select 1
    from public.empresas e
    join public.perfis p on p.id = usuario_empresas.usuario_id
    where e.id = usuario_empresas.empresa_id
      and p.organizacao_id = e.organizacao_id
      and app_private.has_org_access(e.organizacao_id)
  )
);

create policy usuario_empresas_org_insert
on public.usuario_empresas
for insert
to authenticated
with check (
  app_private.has_permission('core.usuarios.editar')
  and exists (
    select 1
    from public.empresas e
    join public.perfis p on p.id = usuario_empresas.usuario_id
    where e.id = usuario_empresas.empresa_id
      and p.organizacao_id = e.organizacao_id
      and app_private.has_org_access(e.organizacao_id)
  )
);

create policy usuario_empresas_org_update
on public.usuario_empresas
for update
to authenticated
using (
  app_private.has_permission('core.usuarios.editar')
  and exists (
    select 1
    from public.empresas e
    join public.perfis p on p.id = usuario_empresas.usuario_id
    where e.id = usuario_empresas.empresa_id
      and p.organizacao_id = e.organizacao_id
      and app_private.has_org_access(e.organizacao_id)
  )
)
with check (
  app_private.has_permission('core.usuarios.editar')
  and exists (
    select 1
    from public.empresas e
    join public.perfis p on p.id = usuario_empresas.usuario_id
    where e.id = usuario_empresas.empresa_id
      and p.organizacao_id = e.organizacao_id
      and app_private.has_org_access(e.organizacao_id)
  )
);

create policy usuario_empresas_org_delete
on public.usuario_empresas
for delete
to authenticated
using (
  app_private.has_permission('core.usuarios.editar')
  and exists (
    select 1
    from public.empresas e
    join public.perfis p on p.id = usuario_empresas.usuario_id
    where e.id = usuario_empresas.empresa_id
      and p.organizacao_id = e.organizacao_id
      and app_private.has_org_access(e.organizacao_id)
  )
);
