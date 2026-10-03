-- Prevent recursive RLS evaluation when validating a filial's matriz.
-- The helper is SECURITY DEFINER and owned by postgres, so the lookup of
-- the parent company does not re-enter public.empresas policies.

create or replace function app_private.is_active_matriz(p_empresa uuid, p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.empresas e
    where e.id = p_empresa
      and e.organizacao_id = p_org
      and e.tipo = 'MATRIZ'
      and e.ativo = true
  );
$function$;

drop policy if exists empresas_insert on public.empresas;

create policy empresas_insert
on public.empresas
for insert
to authenticated
with check (
  (select app_private.is_master())
  and (select app_private.has_org_access(organizacao_id))
  and (select app_private.has_license_capacity(organizacao_id, tipo))
  and (
    tipo = 'MATRIZ'
    or (
      tipo = 'FILIAL'
      and empresa_matriz_id is not null
      and (select app_private.is_active_matriz(empresa_matriz_id, organizacao_id))
    )
  )
);
