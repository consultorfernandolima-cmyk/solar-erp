-- Consolidated RBAC/company-scope migration for foundation/erp-core.
create table if not exists public.organizacao_licencas (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.organizacoes(id) on delete cascade,
  codigo text not null,
  nome text not null,
  max_empresas integer not null default 1 check (max_empresas >= 1),
  max_filiais integer not null default 0 check (max_filiais >= 0),
  inicio_em date not null default current_date,
  fim_em date,
  ativo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizacao_licencas_codigo_org_uk unique (organizacao_id,codigo),
  constraint organizacao_licencas_periodo_ck check (fim_em is null or fim_em >= inicio_em)
);

-- This file mirrors the already-applied Supabase changes from 2026-10-02.

alter table public.grupos_permissao add column if not exists empresa_id uuid;
do $ begin
  if not exists (select 1 from pg_constraint where conname='grupos_permissao_empresa_fkey') then
    alter table public.grupos_permissao add constraint grupos_permissao_empresa_fkey foreign key (empresa_id) references public.empresas(id) on delete cascade;
  end if;
end $;
create index if not exists idx_grupos_permissao_empresa on public.grupos_permissao(empresa_id) where empresa_id is not null;

alter table public.usuario_empresas
  add column if not exists grupo_id uuid,
  add column if not exists is_administrador boolean not null default false,
  add column if not exists concedido_por uuid,
  add column if not exists concedido_em timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname='usuario_empresas_grupo_id_fkey') then
    alter table public.usuario_empresas add constraint usuario_empresas_grupo_id_fkey
      foreign key (grupo_id) references public.grupos_permissao(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where conname='usuario_empresas_concedido_por_fkey') then
    alter table public.usuario_empresas add constraint usuario_empresas_concedido_por_fkey
      foreign key (concedido_por) references public.perfis(id) on delete set null;
  end if;
end $$;

create index if not exists idx_usuario_empresas_empresa_usuario on public.usuario_empresas(empresa_id, usuario_id);
create index if not exists idx_usuario_empresas_grupo on public.usuario_empresas(grupo_id);

create or replace function app_private.is_master()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfis p
    where p.id=(select auth.uid()) and p.ativo=true and p.is_master=true);
$$;

create or replace function app_private.has_company_access(p_empresa uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuario_empresas ue
    join public.empresas e on e.id=ue.empresa_id
    join public.perfis p on p.id=ue.usuario_id
    where ue.usuario_id=(select auth.uid()) and ue.empresa_id=p_empresa
      and e.ativo=true and p.ativo=true and p.organizacao_id=e.organizacao_id
  );
$$;

create or replace function app_private.is_company_admin(p_empresa uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuario_empresas ue
    join public.empresas e on e.id=ue.empresa_id
    join public.perfis p on p.id=ue.usuario_id
    where ue.usuario_id=(select auth.uid()) and ue.empresa_id=p_empresa
      and ue.is_administrador=true and e.ativo=true
      and p.ativo=true and p.organizacao_id=e.organizacao_id
  );
$$;

create or replace function app_private.is_any_company_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuario_empresas ue
    join public.empresas e on e.id=ue.empresa_id and e.ativo=true
    where ue.usuario_id=(select auth.uid()) and ue.is_administrador=true
  );
$$;

create or replace function app_private.has_module_access(p_module_code text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.perfis p
    join public.organizacao_modulos om on om.organizacao_id=p.organizacao_id
    join public.modulos_sistema m on m.id=om.modulo_id
    where p.id=(select auth.uid()) and p.ativo=true
      and m.codigo=p_module_code and m.ativo=true and om.status='ATIVO'
      and current_date>=om.inicio_em
      and (om.fim_em is null or current_date<=om.fim_em)
  );
$$;

create or replace function app_private.has_permission(p_permission text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.perfis p
    join public.permissoes pe on pe.chave=p_permission
    join public.grupos_permissao gp on gp.organizacao_id=p.organizacao_id and gp.ativo=true
    join public.grupo_permissoes gpe on gpe.grupo_id=gp.id and gpe.permissao_id=pe.id
    where p.id=(select auth.uid()) and p.ativo=true
      and ((gp.escopo='ORGANIZACAO' and gp.empresa_id is null and exists (select 1 from public.usuario_grupos ug where ug.usuario_id=p.id and ug.grupo_id=gp.id))
        or (gp.escopo='EMPRESA' and gp.empresa_id is not null and exists (select 1 from public.usuario_empresas ue where ue.usuario_id=p.id and ue.empresa_id=gp.empresa_id and ue.grupo_id=gp.id)))
      and (pe.modulo_codigo='CORE' or app_private.has_module_access(pe.modulo_codigo));
$$;

create or replace function app_private.has_company_permission(p_empresa uuid, p_permission text)
returns boolean language sql stable security definer set search_path = ''
as $
  select app_private.is_company_admin(p_empresa)
    or exists (
      select 1
      from public.perfis p
      join public.usuario_empresas ue on ue.usuario_id=p.id and ue.empresa_id=p_empresa
      join public.empresas e on e.id=ue.empresa_id
      join public.grupos_permissao gp on gp.id=ue.grupo_id and gp.empresa_id=p_empresa and gp.ativo=true
      join public.permissoes pe on pe.chave=p_permission
      join public.grupo_permissoes gpe on gpe.grupo_id=gp.id and gpe.permissao_id=pe.id
      where p.id=(select auth.uid())
        and p.ativo=true
        and e.ativo=true
        and p.organizacao_id=e.organizacao_id
        and (pe.modulo_codigo='CORE' or app_private.has_module_access(pe.modulo_codigo))
    );
$;

revoke execute on function app_private.is_master() from public,anon;
revoke execute on function app_private.has_company_access(uuid) from public,anon;
revoke execute on function app_private.is_company_admin(uuid) from public,anon;
revoke execute on function app_private.is_any_company_admin() from public,anon;
revoke execute on function app_private.has_company_permission(uuid,text) from public,anon;
revoke execute on function app_private.has_license_capacity(uuid,text) from public,anon;
grant execute on function app_private.is_master() to authenticated;
grant execute on function app_private.has_company_access(uuid) to authenticated;
grant execute on function app_private.is_company_admin(uuid) to authenticated;
grant execute on function app_private.is_any_company_admin() to authenticated;
grant execute on function app_private.has_company_permission(uuid,text) to authenticated;
grant execute on function app_private.has_license_capacity(uuid,text) to authenticated;

alter table public.organizacao_licencas enable row level security;
revoke all on public.organizacao_licencas from anon;
grant select,insert,update,delete on public.organizacao_licencas to authenticated;
create index if not exists idx_organizacao_licencas_org_ativo
  on public.organizacao_licencas(organizacao_id,ativo,inicio_em,fim_em);

insert into public.organizacao_licencas
  (organizacao_id,codigo,nome,max_empresas,max_filiais,observacoes)
select o.id,'FOUNDATION-2026','Licença Foundation de Desenvolvimento',10,20,
       'Capacidade provisória de desenvolvimento/homologação; não representa plano comercial.'
from public.organizacoes o
where o.id='1eea8cd8-3562-42ba-9640-54ee307562f5'::uuid
  and not exists (
    select 1 from public.organizacao_licencas l
    where l.organizacao_id=o.id and l.codigo='FOUNDATION-2026'
  );

-- Policies below are intentionally company-scoped for operational data.
-- Company Administrator is an explicit usuario_empresas grant, never is_admin alone.
drop policy if exists empresas_org_select on public.empresas;
drop policy if exists empresas_org_insert on public.empresas;
drop policy if exists empresas_org_update on public.empresas;
drop policy if exists empresas_org_delete on public.empresas;
drop policy if exists empresas_select on public.empresas;
drop policy if exists empresas_insert on public.empresas;
drop policy if exists empresas_update on public.empresas;
drop policy if exists empresas_delete on public.empresas;

create policy empresas_select on public.empresas for select to authenticated
using ((select app_private.is_master()) or (select app_private.has_company_access(id)));

create policy empresas_insert on public.empresas for insert to authenticated
with check (
  (select app_private.is_master())
  and (select app_private.has_org_access(organizacao_id))
  and (select app_private.has_license_capacity(organizacao_id,tipo))
  and (
    tipo='MATRIZ'
    or (tipo='FILIAL' and empresa_matriz_id is not null and exists (
      select 1 from public.empresas m
      where m.id=empresa_matriz_id and m.organizacao_id=organizacao_id
        and m.tipo='MATRIZ' and m.ativo
    ))
  )
);

create policy empresas_update on public.empresas for update to authenticated
using ((select app_private.is_master()) or (select app_private.is_company_admin(id)))
with check ((select app_private.is_master()) or (select app_private.is_company_admin(id)));

create policy empresas_delete on public.empresas for delete to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));

drop policy if exists usuario_empresas_org_select on public.usuario_empresas;
drop policy if exists usuario_empresas_org_insert on public.usuario_empresas;
drop policy if exists usuario_empresas_org_update on public.usuario_empresas;
drop policy if exists usuario_empresas_org_delete on public.usuario_empresas;
drop policy if exists usuario_empresas_select on public.usuario_empresas;
drop policy if exists usuario_empresas_insert on public.usuario_empresas;
drop policy if exists usuario_empresas_update on public.usuario_empresas;
drop policy if exists usuario_empresas_delete on public.usuario_empresas;

create policy usuario_empresas_select on public.usuario_empresas for select to authenticated
using ((select app_private.is_master()) or (select app_private.has_company_access(empresa_id)));

create policy usuario_empresas_insert on public.usuario_empresas for insert to authenticated
with check ((select app_private.is_master()) or (select app_private.is_company_admin(empresa_id)));

create policy usuario_empresas_update on public.usuario_empresas for update to authenticated
using ((select app_private.is_master()) or (select app_private.is_company_admin(empresa_id)))
with check ((select app_private.is_master()) or (select app_private.is_company_admin(empresa_id)));

create policy usuario_empresas_delete on public.usuario_empresas for delete to authenticated
using ((select app_private.is_master()) or (select app_private.is_company_admin(empresa_id)));

drop policy if exists usuario_grupos_rbac_admin on public.usuario_grupos;
create policy usuario_grupos_rbac_admin on public.usuario_grupos for all to authenticated
using (
  (select app_private.is_master())
  or exists (
    select 1 from public.grupos_permissao g
    join public.perfis u on u.id=usuario_grupos.usuario_id
    where g.id=usuario_grupos.grupo_id and g.escopo='ORGANIZACAO'
      and u.organizacao_id=g.organizacao_id
      and (select app_private.has_permission('core.usuarios.editar'))
  )
)
with check (
  (select app_private.is_master())
  or exists (
    select 1 from public.grupos_permissao g
    join public.perfis u on u.id=usuario_grupos.usuario_id
    where g.id=usuario_grupos.grupo_id and g.escopo='ORGANIZACAO'
      and u.organizacao_id=g.organizacao_id
      and (select app_private.has_permission('core.usuarios.editar'))
  )
);

drop policy if exists organizacao_licencas_select on public.organizacao_licencas;
drop policy if exists organizacao_licencas_insert on public.organizacao_licencas;
drop policy if exists organizacao_licencas_update on public.organizacao_licencas;
drop policy if exists organizacao_licencas_delete on public.organizacao_licencas;
create policy organizacao_licencas_select on public.organizacao_licencas for select to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));
create policy organizacao_licencas_insert on public.organizacao_licencas for insert to authenticated
with check ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));
create policy organizacao_licencas_update on public.organizacao_licencas for update to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)))
with check ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));
create policy organizacao_licencas_delete on public.organizacao_licencas for delete to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));

drop policy if exists organizacao_modulos_org_access on public.organizacao_modulos;
drop policy if exists organizacao_modulos_select on public.organizacao_modulos;
drop policy if exists organizacao_modulos_insert on public.organizacao_modulos;
drop policy if exists organizacao_modulos_update on public.organizacao_modulos;
drop policy if exists organizacao_modulos_delete on public.organizacao_modulos;
create policy organizacao_modulos_select on public.organizacao_modulos for select to authenticated
using ((select app_private.has_org_access(organizacao_id)));
create policy organizacao_modulos_insert on public.organizacao_modulos for insert to authenticated
with check ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));
create policy organizacao_modulos_update on public.organizacao_modulos for update to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)))
with check ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));
create policy organizacao_modulos_delete on public.organizacao_modulos for delete to authenticated
using ((select app_private.is_master()) and (select app_private.has_org_access(organizacao_id)));

drop policy if exists grupos_permissao_rbac_admin on public.grupos_permissao;
create policy grupos_permissao_rbac_admin on public.grupos_permissao for all to authenticated
using ((select app_private.is_master()) or (escopo='EMPRESA' and empresa_id is not null and (select app_private.is_company_admin(empresa_id))))
with check ((select app_private.is_master()) or (escopo='EMPRESA' and empresa_id is not null and (select app_private.is_company_admin(empresa_id))));

drop policy if exists grupo_permissoes_rbac_admin on public.grupo_permissoes;
create policy grupo_permissoes_rbac_admin on public.grupo_permissoes for all to authenticated
using ((select app_private.is_master()) or exists (
  select 1 from public.grupos_permissao g
  where g.id=grupo_permissoes.grupo_id and g.escopo='EMPRESA' and (select app_private.is_company_admin(g.empresa_id))
))
with check ((select app_private.is_master()) or exists (
  select 1 from public.grupos_permissao g
  where g.id=grupo_permissoes.grupo_id and (select app_private.is_any_company_admin())
    and (select app_private.has_org_access(g.organizacao_id))
));

update public.permissoes
set chave=replace(chave,'comercio.propostas.','servicos.propostas.'),
    modulo='SERVICOS', modulo_codigo='SERVICOS'
where chave like 'comercio.propostas.%';

-- Operational policy replacement uses the company-scoped helper.
-- Existing business integrity checks remain in the live migration history.


-- Company-scoped operational RLS.
drop policy if exists ordens_servico_select on public.ordens_servico;
drop policy if exists ordens_servico_insert on public.ordens_servico;
drop policy if exists ordens_servico_update on public.ordens_servico;
drop policy if exists ordens_servico_delete on public.ordens_servico;
create policy ordens_servico_select on public.ordens_servico for select to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.ordens_servico.visualizar')));
create policy ordens_servico_insert on public.ordens_servico for insert to authenticated
with check (
  (select app_private.has_company_permission(empresa_id,'servicos.ordens_servico.criar'))
  and exists (select 1 from public.empresas e where e.id=ordens_servico.empresa_id and e.organizacao_id=ordens_servico.organizacao_id and e.ativo)
  and exists (select 1 from public.parceiros c join public.parceiro_papeis pp on pp.parceiro_id=c.id and pp.papel='CLIENTE' where c.id=ordens_servico.cliente_id and c.organizacao_id=ordens_servico.organizacao_id and c.ativo)
  and (usina_id is null or exists (select 1 from public.usinas u where u.id=ordens_servico.usina_id and u.organizacao_id=ordens_servico.organizacao_id and u.empresa_id=ordens_servico.empresa_id))
  and (tecnico_id is null or exists (select 1 from public.perfis t where t.id=ordens_servico.tecnico_id and t.organizacao_id=ordens_servico.organizacao_id and t.ativo))
);
create policy ordens_servico_update on public.ordens_servico for update to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.ordens_servico.editar')))
with check ((select app_private.has_company_permission(empresa_id,'servicos.ordens_servico.editar')));
create policy ordens_servico_delete on public.ordens_servico for delete to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.ordens_servico.excluir')));

drop policy if exists usinas_select on public.usinas;
drop policy if exists usinas_insert on public.usinas;
drop policy if exists usinas_update on public.usinas;
drop policy if exists usinas_delete on public.usinas;
create policy usinas_select on public.usinas for select to authenticated
using ((select app_private.has_company_permission(empresa_id,'ufv.usinas.visualizar')));
create policy usinas_insert on public.usinas for insert to authenticated
with check ((select app_private.has_company_permission(empresa_id,'ufv.usinas.criar')));
create policy usinas_update on public.usinas for update to authenticated
using ((select app_private.has_company_permission(empresa_id,'ufv.usinas.editar')))
with check ((select app_private.has_company_permission(empresa_id,'ufv.usinas.editar')));
create policy usinas_delete on public.usinas for delete to authenticated
using ((select app_private.has_company_permission(empresa_id,'ufv.usinas.excluir')));

drop policy if exists propostas_select on public.propostas;
drop policy if exists propostas_insert on public.propostas;
drop policy if exists propostas_update on public.propostas;
drop policy if exists propostas_delete on public.propostas;
create policy propostas_select on public.propostas for select to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.propostas.visualizar')));
create policy propostas_insert on public.propostas for insert to authenticated
with check ((select app_private.has_company_permission(empresa_id,'servicos.propostas.criar')));
create policy propostas_update on public.propostas for update to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.propostas.editar')))
with check ((select app_private.has_company_permission(empresa_id,'servicos.propostas.editar')));
create policy propostas_delete on public.propostas for delete to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.propostas.excluir')));

drop policy if exists proposta_itens_select on public.proposta_itens;
drop policy if exists proposta_itens_insert on public.proposta_itens;
drop policy if exists proposta_itens_update on public.proposta_itens;
drop policy if exists proposta_itens_delete on public.proposta_itens;
create policy proposta_itens_select on public.proposta_itens for select to authenticated
using (exists (select 1 from public.propostas p where p.id=proposta_itens.proposta_id and (select app_private.has_company_permission(p.empresa_id,'servicos.propostas.visualizar'))));
create policy proposta_itens_insert on public.proposta_itens for insert to authenticated
with check (exists (select 1 from public.propostas p join public.produtos_servicos ps on ps.id=proposta_itens.produto_id where p.id=proposta_itens.proposta_id and ps.organizacao_id=p.organizacao_id and ps.ativo and (select app_private.has_company_permission(p.empresa_id,'servicos.propostas.criar'))));
create policy proposta_itens_update on public.proposta_itens for update to authenticated
using (exists (select 1 from public.propostas p where p.id=proposta_itens.proposta_id and (select app_private.has_company_permission(p.empresa_id,'servicos.propostas.editar'))))
with check (exists (select 1 from public.propostas p join public.produtos_servicos ps on ps.id=proposta_itens.produto_id where p.id=proposta_itens.proposta_id and ps.organizacao_id=p.organizacao_id and ps.ativo and (select app_private.has_company_permission(p.empresa_id,'servicos.propostas.editar'))));
create policy proposta_itens_delete on public.proposta_itens for delete to authenticated
using (exists (select 1 from public.propostas p where p.id=proposta_itens.proposta_id and (select app_private.has_company_permission(p.empresa_id,'servicos.propostas.excluir'))));

drop policy if exists contratos_select on public.contratos;
drop policy if exists contratos_insert on public.contratos;
drop policy if exists contratos_update on public.contratos;
drop policy if exists contratos_delete on public.contratos;
create policy contratos_select on public.contratos for select to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.contratos.visualizar')));
create policy contratos_insert on public.contratos for insert to authenticated
with check ((select app_private.has_company_permission(empresa_id,'servicos.contratos.criar')));
create policy contratos_update on public.contratos for update to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.contratos.editar')))
with check ((select app_private.has_company_permission(empresa_id,'servicos.contratos.editar')));
create policy contratos_delete on public.contratos for delete to authenticated
using ((select app_private.has_company_permission(empresa_id,'servicos.contratos.excluir')));

drop policy if exists faturamentos_select on public.faturamentos;
drop policy if exists faturamentos_insert on public.faturamentos;
drop policy if exists faturamentos_update on public.faturamentos;
drop policy if exists faturamentos_delete on public.faturamentos;
create policy faturamentos_select on public.faturamentos for select to authenticated
using ((select app_private.has_company_permission(empresa_id,'faturamento.visualizar')));
create policy faturamentos_insert on public.faturamentos for insert to authenticated
with check ((select app_private.has_company_permission(empresa_id,'faturamento.criar')));
create policy faturamentos_update on public.faturamentos for update to authenticated
using ((select app_private.has_company_permission(empresa_id,'faturamento.editar')))
with check ((select app_private.has_company_permission(empresa_id,'faturamento.editar')));
create policy faturamentos_delete on public.faturamentos for delete to authenticated
using ((select app_private.has_company_permission(empresa_id,'faturamento.excluir')) and status='RASCUNHO');

drop policy if exists faturamento_parcelas_select on public.faturamento_parcelas;
drop policy if exists faturamento_parcelas_insert on public.faturamento_parcelas;
drop policy if exists faturamento_parcelas_update on public.faturamento_parcelas;
drop policy if exists faturamento_parcelas_delete on public.faturamento_parcelas;
create policy faturamento_parcelas_select on public.faturamento_parcelas for select to authenticated
using (exists (select 1 from public.faturamentos f where f.id=faturamento_parcelas.faturamento_id and (select app_private.has_company_permission(f.empresa_id,'faturamento.visualizar'))));
create policy faturamento_parcelas_insert on public.faturamento_parcelas for insert to authenticated
with check (exists (select 1 from public.faturamentos f where f.id=faturamento_parcelas.faturamento_id and f.status='RASCUNHO' and (select app_private.has_company_permission(f.empresa_id,'faturamento.criar'))));
create policy faturamento_parcelas_update on public.faturamento_parcelas for update to authenticated
using (exists (select 1 from public.faturamentos f where f.id=faturamento_parcelas.faturamento_id and (select app_private.has_company_permission(f.empresa_id,'faturamento.editar'))))
with check (exists (select 1 from public.faturamentos f where f.id=faturamento_parcelas.faturamento_id and (select app_private.has_company_permission(f.empresa_id,'faturamento.editar'))));
create policy faturamento_parcelas_delete on public.faturamento_parcelas for delete to authenticated
using (exists (select 1 from public.faturamentos f where f.id=faturamento_parcelas.faturamento_id and f.status='RASCUNHO' and (select app_private.has_company_permission(f.empresa_id,'faturamento.excluir'))));



