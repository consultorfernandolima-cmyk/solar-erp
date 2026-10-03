create index if not exists auditoria_eventos_organizacao_idx on public.auditoria_eventos(organizacao_id);
create index if not exists auditoria_eventos_usuario_idx on public.auditoria_eventos(usuario_id);
create index if not exists empresas_empresa_matriz_idx on public.empresas(empresa_matriz_id);
create index if not exists familias_produto_grupo_idx on public.familias_produto(grupo_id);
create index if not exists grupo_permissoes_permissao_idx on public.grupo_permissoes(permissao_id);
create index if not exists produto_empresas_empresa_idx on public.produto_empresas(empresa_id);
create index if not exists produtos_servicos_familia_idx on public.produtos_servicos(familia_id);
create index if not exists produtos_servicos_grupo_idx on public.produtos_servicos(grupo_id);
create index if not exists produtos_servicos_unidade_idx on public.produtos_servicos(unidade_medida_id);
create index if not exists usuario_empresas_empresa_idx on public.usuario_empresas(empresa_id);
create index if not exists usuario_grupos_grupo_idx on public.usuario_grupos(grupo_id);
create or replace function app_private.set_updated_at() returns trigger language plpgsql set search_path=public,app_private as $$
begin new.updated_at=now(); return new; end; $$;
drop policy if exists perfis_self_or_org on public.perfis;
create policy perfis_self_or_org on public.perfis for select to authenticated using(id=(select auth.uid()) or app_private.has_org_access(organizacao_id));