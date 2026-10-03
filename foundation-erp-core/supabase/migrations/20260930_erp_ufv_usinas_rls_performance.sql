drop policy if exists usinas_select on public.usinas;
drop policy if exists usinas_insert on public.usinas;
drop policy if exists usinas_update on public.usinas;
drop policy if exists usinas_delete on public.usinas;

create policy usinas_select on public.usinas for select to authenticated using (
  app_private.has_permission('ufv.usinas.visualizar')
  and exists (
    select 1 from public.empresas e
    where e.id=usinas.empresa_id and e.organizacao_id=usinas.organizacao_id and e.ativo=true
    and (
      exists (select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin=true and p.ativo=true and p.organizacao_id=usinas.organizacao_id)
      or exists (select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=usinas.empresa_id)
    )
  )
);

create policy usinas_insert on public.usinas for insert to authenticated with check (
  app_private.has_permission('ufv.usinas.criar')
  and exists (
    select 1 from public.empresas e
    where e.id=usinas.empresa_id and e.organizacao_id=usinas.organizacao_id and e.ativo=true
    and (
      exists (select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin=true and p.ativo=true and p.organizacao_id=usinas.organizacao_id)
      or exists (select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=usinas.empresa_id)
    )
  )
  and (usinas.cliente_id is null or exists (select 1 from public.parceiros pr where pr.id=usinas.cliente_id and pr.organizacao_id=usinas.organizacao_id and pr.ativo=true))
);

create policy usinas_update on public.usinas for update to authenticated using (
  app_private.has_permission('ufv.usinas.editar')
  and exists (
    select 1 from public.empresas e
    where e.id=usinas.empresa_id and e.organizacao_id=usinas.organizacao_id and e.ativo=true
    and (
      exists (select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin=true and p.ativo=true and p.organizacao_id=usinas.organizacao_id)
      or exists (select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=usinas.empresa_id)
    )
  )
) with check (
  app_private.has_permission('ufv.usinas.editar')
  and exists (
    select 1 from public.empresas e
    where e.id=usinas.empresa_id and e.organizacao_id=usinas.organizacao_id and e.ativo=true
    and (
      exists (select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin=true and p.ativo=true and p.organizacao_id=usinas.organizacao_id)
      or exists (select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=usinas.empresa_id)
    )
  )
  and (usinas.cliente_id is null or exists (select 1 from public.parceiros pr where pr.id=usinas.cliente_id and pr.organizacao_id=usinas.organizacao_id and pr.ativo=true))
);

create policy usinas_delete on public.usinas for delete to authenticated using (
  app_private.has_permission('ufv.usinas.excluir')
  and exists (
    select 1 from public.empresas e
    where e.id=usinas.empresa_id and e.organizacao_id=usinas.organizacao_id
    and (
      exists (select 1 from public.perfis p where p.id=(select auth.uid()) and p.is_admin=true and p.ativo=true and p.organizacao_id=usinas.organizacao_id)
      or exists (select 1 from public.usuario_empresas ue where ue.usuario_id=(select auth.uid()) and ue.empresa_id=usinas.empresa_id)
    )
  )
);