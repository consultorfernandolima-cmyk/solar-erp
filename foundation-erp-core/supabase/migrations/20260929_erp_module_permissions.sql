alter table public.permissoes add column if not exists modulo_codigo text;

update public.permissoes
set modulo_codigo = case when modulo='core' then 'CORE' else upper(split_part(modulo,'.',1)) end
where modulo_codigo is null;

insert into public.permissoes (chave,modulo,recurso,acao,descricao,modulo_codigo)
values
('comercio.clientes.visualizar','comercio','clientes','visualizar','Visualizar clientes do módulo Comércio','COMERCIO'),
('comercio.clientes.criar','comercio','clientes','criar','Criar clientes do módulo Comércio','COMERCIO'),
('comercio.clientes.editar','comercio','clientes','editar','Editar clientes do módulo Comércio','COMERCIO'),
('comercio.clientes.excluir','comercio','clientes','excluir','Excluir clientes do módulo Comércio','COMERCIO'),
('servicos.ordens_servico.visualizar','servicos','ordens_servico','visualizar','Visualizar ordens de serviço','SERVICOS'),
('servicos.ordens_servico.criar','servicos','ordens_servico','criar','Criar ordens de serviço','SERVICOS'),
('servicos.ordens_servico.editar','servicos','ordens_servico','editar','Editar ordens de serviço','SERVICOS'),
('servicos.ordens_servico.excluir','servicos','ordens_servico','excluir','Excluir ordens de serviço','SERVICOS'),
('ufv.usinas.visualizar','ufv','usinas','visualizar','Visualizar usinas fotovoltaicas','UFV'),
('ufv.usinas.criar','ufv','usinas','criar','Criar usinas fotovoltaicas','UFV'),
('ufv.usinas.editar','ufv','usinas','editar','Editar usinas fotovoltaicas','UFV'),
('ufv.usinas.excluir','ufv','usinas','excluir','Excluir usinas fotovoltaicas','UFV')
on conflict (chave) do update set modulo=excluded.modulo,recurso=excluded.recurso,acao=excluded.acao,descricao=excluded.descricao,modulo_codigo=excluded.modulo_codigo;

create index if not exists permissoes_modulo_codigo_idx on public.permissoes(modulo_codigo);

create or replace function app_private.has_permission(p_permission text)
returns boolean language sql stable security definer
set search_path = public, app_private
as $$
  select exists (
    select 1
    from public.perfis p
    join public.permissoes pe on pe.chave = p_permission
    left join public.usuario_grupos ug on ug.usuario_id = p.id
    left join public.grupos_permissao gp on gp.id = ug.grupo_id
    left join public.grupo_permissoes gpe on gpe.grupo_id = gp.id and gpe.permissao_id = pe.id
    where p.id = (select auth.uid()) and p.ativo = true
      and (p.is_admin = true or (gp.ativo = true and gpe.permissao_id is not null))
      and (pe.modulo_codigo = 'CORE' or app_private.has_module_access(pe.modulo_codigo) or p.is_admin = true)
  );
$$;

revoke all on function app_private.has_permission(text) from public;
grant execute on function app_private.has_permission(text) to authenticated;
