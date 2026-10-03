begin;

select plan(12);

select ok(
  (select relrowsecurity from pg_class where oid='public.empresas'::regclass),
  'empresas has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid='public.usuario_empresas'::regclass),
  'usuario_empresas has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid='public.grupos_permissao'::regclass),
  'grupos_permissao has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid='public.grupo_permissoes'::regclass),
  'grupo_permissoes has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where oid='public.organizacao_licencas'::regclass),
  'organizacao_licencas has RLS enabled'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_select'),
  'empresas SELECT policy exists'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='empresas' and policyname='empresas_insert'),
  'empresas INSERT policy exists'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='usuario_empresas' and policyname='usuario_empresas_select'),
  'usuario_empresas SELECT policy exists'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='usuario_empresas' and policyname='usuario_empresas_insert'),
  'usuario_empresas INSERT policy exists'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='grupos_permissao' and policyname='grupos_permissao_rbac_admin'),
  'grupos_permissao RBAC policy exists'
);

select ok(
  exists (select 1 from pg_policies where schemaname='public' and tablename='organizacao_licencas' and policyname='organizacao_licencas_select'),
  'organizacao_licencas SELECT policy exists'
);

select ok(
  (select proconfig @> array['search_path='] from pg_proc p
   join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='app_private'
     and p.proname='has_company_permission'
     and pg_get_function_identity_arguments(p.oid)='p_empresa uuid, p_permission text'),
  'has_company_permission pins an empty search_path'
);

select * from finish();
rollback;
