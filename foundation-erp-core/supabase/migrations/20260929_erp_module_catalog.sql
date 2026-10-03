create table if not exists public.modulos_sistema (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text,
  icone text,
  tipo text not null default 'MODULO' check (tipo in ('CORE','MODULO','SUBMODULO')),
  modulo_pai_id uuid references public.modulos_sistema(id) on delete cascade,
  status text not null default 'ATIVO' check (status in ('ATIVO','STANDBY','INATIVO')),
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizacao_modulos (
  id uuid primary key default gen_random_uuid(),
  organizacao_id uuid not null references public.organizacoes(id) on delete cascade,
  modulo_id uuid not null references public.modulos_sistema(id) on delete cascade,
  status text not null default 'ATIVO' check (status in ('ATIVO','STANDBY','SUSPENSO','ENCERRADO')),
  inicio_em date not null default current_date,
  fim_em date,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organizacao_id, modulo_id),
  check (fim_em is null or fim_em >= inicio_em)
);

create index if not exists organizacao_modulos_org_idx on public.organizacao_modulos(organizacao_id);
create index if not exists organizacao_modulos_modulo_idx on public.organizacao_modulos(modulo_id);

alter table public.modulos_sistema enable row level security;
alter table public.organizacao_modulos enable row level security;

create policy "modulos_sistema_authenticated_read" on public.modulos_sistema
for select to authenticated using (ativo = true);

create policy "organizacao_modulos_org_access" on public.organizacao_modulos
for select to authenticated using (app_private.has_org_access(organizacao_id));

create trigger modulos_sistema_updated_at before update on public.modulos_sistema
for each row execute function app_private.set_updated_at();

create trigger organizacao_modulos_updated_at before update on public.organizacao_modulos
for each row execute function app_private.set_updated_at();

insert into public.modulos_sistema (codigo,nome,descricao,icone,tipo,status,ordem)
values
('CORE','Núcleo do ERP','Cadastros, usuários, empresas, parceiros, produtos e configurações.','Layers','CORE','ATIVO',0),
('COMERCIO','Comércio','Venda de produtos, pedidos, estoque e rotinas comerciais.','ShoppingCart','MODULO','ATIVO',10),
('SERVICOS','Serviços','Prestação de serviços, ordens de serviço, execução e contratos.','Wrench','MODULO','ATIVO',20)
on conflict (codigo) do update set nome=excluded.nome, descricao=excluded.descricao, icone=excluded.icone, tipo=excluded.tipo, status=excluded.status, ordem=excluded.ordem, ativo=true;

insert into public.modulos_sistema (codigo,nome,descricao,icone,tipo,modulo_pai_id,status,ordem)
select 'UFV','Gestão de Usinas','Especialização de Serviços para implantação, manutenção, limpeza, monitoramento e acompanhamento de usinas fotovoltaicas.','Sun','SUBMODULO',id,'ATIVO',21
from public.modulos_sistema where codigo='SERVICOS'
on conflict (codigo) do update set nome=excluded.nome, descricao=excluded.descricao, icone=excluded.icone, tipo=excluded.tipo, modulo_pai_id=excluded.modulo_pai_id, status=excluded.status, ordem=excluded.ordem, ativo=true;

insert into public.organizacao_modulos (organizacao_id,modulo_id,status,observacao)
select o.id,m.id,'ATIVO','Bootstrap inicial para homologação do produto.'
from public.organizacoes o cross join public.modulos_sistema m
where o.nome='SOLAR ERP' and m.codigo in ('CORE','COMERCIO','SERVICOS','UFV')
on conflict (organizacao_id,modulo_id) do update set status=excluded.status, observacao=excluded.observacao;

create or replace function app_private.has_module_access(p_module_code text)
returns boolean language sql stable security definer
set search_path = public, app_private
as $$
  select exists (
    select 1 from public.perfis p
    join public.organizacao_modulos om on om.organizacao_id = p.organizacao_id
    join public.modulos_sistema m on m.id = om.modulo_id
    where p.id = (select auth.uid()) and p.ativo = true and m.codigo = p_module_code
      and m.ativo = true and om.status = 'ATIVO' and current_date >= om.inicio_em
      and (om.fim_em is null or current_date <= om.fim_em)
  ) or exists (
    select 1 from public.perfis p
    where p.id = (select auth.uid()) and p.ativo = true and p.is_admin = true
  );
$$;

revoke all on function app_private.has_module_access(text) from public;
grant execute on function app_private.has_module_access(text) to authenticated;
